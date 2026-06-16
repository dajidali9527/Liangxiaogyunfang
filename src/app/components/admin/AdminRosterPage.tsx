import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from './AdminLayout';
import { StatusBadge } from '../shared/StatusBadge';
import { ArrowLeft, Search, CheckCircle, DollarSign, LogOut, RotateCcw, Users, Plus, Trash2, X, Download, UserCheck, AlertTriangle, RefreshCw } from 'lucide-react';
import { ManualEnrollData, Participant } from '../../context/AppContext';
import * as XLSX from 'xlsx';

type Tab = 'checkin' | 'payment' | 'checkout';

export function AdminRosterPage({ activityId }: { activityId: string }) {
  const { activities, enrollments, users, currentUser, navigate, updateCheckIn, updatePayment, updateEnrollment, manualEnroll, removeEnrollment, fetchAdminEnrollments } = useApp();
  const activity = activities.find(a => a.id === activityId);
  const [tab, setTab] = useState<Tab>('checkin');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [noteModal, setNoteModal] = useState<{ enrollId: string; type: 'admin' | 'payment' } | null>(null);
  const [noteText, setNoteText] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState<ManualEnrollData>({ contactName: '', contactPhone: '', adults: 1, children: 0, amount: 0, note: '', participants: [] });
  const [addResult, setAddResult] = useState<{ success: boolean; message: string } | null>(null);
  const [confirmPayModal, setConfirmPayModal] = useState<{ enrollId: string; action: '已确认' | '已减免' } | null>(null);
  const [confirmPayAmount, setConfirmPayAmount] = useState('');
  const [lastPayAmount, setLastPayAmount] = useState('');
  const [removeConfirm, setRemoveConfirm] = useState<{ id: string; name: string } | null>(null);
  const [cancelCheckinConfirm, setCancelCheckinConfirm] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  useEffect(() => {
    fetchAdminEnrollments(activityId);
  }, [activityId]);
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAdminEnrollments(activityId);
    setRefreshing(false);
  };
  const handleTabChange = async (t: Tab) => {
    setTab(t);
    setFilterStatus('all');
    await fetchAdminEnrollments(activityId);
  };

  if (!activity) return null;

  const actEnrollments = enrollments.filter(e => e.activityId === activityId && e.status !== '已取消' && e.status !== '已移除');
  const enriched = actEnrollments.map(e => ({
    ...e,
    user: users.find(u => u.id === e.userId),
  })).filter(e => {
    const name = e.user?.name || e.contactName;
    const phone = e.user?.phone || e.contactPhone;
    const matchSearch = !search || name.includes(search) || phone.includes(search);
    let matchFilter = true;
    if (tab === 'checkin' && filterStatus !== 'all') matchFilter = e.checkInStatus === filterStatus;
    if (tab === 'payment' && filterStatus !== 'all') matchFilter = e.paymentStatus === filterStatus;
    if (tab === 'checkout' && filterStatus !== 'all') matchFilter = e.checkInStatus === filterStatus;
    return matchSearch && matchFilter;
  });
  const checkedInCount = actEnrollments.filter(e => e.checkInStatus !== '未签到').length;
  const confirmedCount = actEnrollments.filter(e => e.paymentStatus === '已确认' || e.paymentStatus === '已减免').length;
  const checkedOutCount = actEnrollments.filter(e => e.checkInStatus === '已离场').length;

  const openNoteModal = (enrollId: string, type: 'admin' | 'payment', current: string) => {
    setNoteText(current);
    setNoteModal({ enrollId, type });
  };
  const saveNote = async () => {
    if (!noteModal) return;
    const enrollId = noteModal.enrollId;
    const text = noteText;
    setNoteModal(null);
    await updateEnrollment(enrollId, { adminNote: text });
  };

  const handleAddEnroll = async () => {
    if (!addForm.contactPhone) return;
    const result = await manualEnroll(activityId, addForm);
    setAddResult(result);
    if (result.success) {
      setTimeout(() => {
        setShowAddModal(false);
        setAddForm({ contactName: '', contactPhone: '', adults: 1, children: 0, amount: 0, note: '', participants: [] });
        setAddResult(null);
      }, 500);
    }
  };
  const rebuildParticipants = (adults: number, children: number, existing: Participant[]): Participant[] => {
    const total = adults + children;
    const result: Participant[] = [];
    for (let i = 0; i < total; i++) {
      const defaultName = i < adults ? `成人${i + 1}` : `儿童${i - adults + 1}`;
      result.push(existing[i] || { name: defaultName, gender: '', age: '', note: '' });
    }
    return result;
  };
  const updateParticipant = (idx: number, field: keyof Participant, value: string) => {
    setAddForm(p => {
      const ps = [...(p.participants || [])];
      ps[idx] = { ...ps[idx], [field]: value };
      return { ...p, participants: ps };
    });
  };

  const handleRemove = (enrollmentId: string, name: string) => {
    setRemoveConfirm({ id: enrollmentId, name });
  };

  const handleExport = () => {
    const rows = actEnrollments.map(e => {
      const u = users.find(u => u.id === e.userId);
      return {
        '昵称': e.contactName || u?.nickname || u?.name || '',
        '手机号': e.contactPhone || u?.phone || '',
        '成人人数': e.adults,
        '儿童人数': e.children,
        '报名状态': e.status,
        '签到状态': e.checkInStatus,
        '签到时间': e.checkInTime || '',
        '离场时间': e.checkOutTime || '',
        '收费状态': e.paymentStatus,
        '金额': e.amount,
        '报名时间': e.enrolledAt,
        '参与者明细': (e.participants || []).map((p, i) => `${p.name || (i < e.adults ? `成人${i+1}` : `儿童${i-e.adults+1}`)}${p.gender ? '/'+p.gender : ''}${p.age ? '/'+p.age+'岁' : ''}${p.note ? '/'+p.note : ''}`).join('；') || '',
        '备注': e.note || '',
        '管理员备注': e.adminNote || '',
      };
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '报名列表');
    const now = new Date();
    const ts = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
    XLSX.writeFile(wb, `zersolo_${activity.name}_报名列表_${ts}.xlsx`);
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-5 max-w-5xl">
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={() => navigate({ page: 'admin-activities' })} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-foreground leading-tight">{activity.name}</h1>
            <p className="text-muted-foreground text-sm">{activity.startDate} · {activity.location}</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 bg-secondary text-foreground rounded-xl text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} /> 刷新
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2.5 bg-secondary text-foreground rounded-xl text-sm font-medium hover:bg-muted transition-colors"
            >
              <Download size={16} /> 导出Excel
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Plus size={16} /> 后台报名
            </button>
          </div>
        </div>
        {/* Quick stats */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-card rounded-xl p-3 border border-border text-center">
            <div className="text-primary font-bold text-xl">{actEnrollments.length}</div>
            <div className="text-xs text-muted-foreground">已报名</div>
          </div>
          <div className="bg-card rounded-xl p-3 border border-border text-center">
            <div className="text-emerald-600 font-bold text-xl">{checkedInCount}</div>
            <div className="text-xs text-muted-foreground">已签到</div>
          </div>
          <div className="bg-card rounded-xl p-3 border border-border text-center">
            <div className="text-blue-600 font-bold text-xl">{checkedOutCount}</div>
            <div className="text-xs text-muted-foreground">已离场</div>
          </div>
          <div className="bg-card rounded-xl p-3 border border-border text-center">
            <div className="text-accent font-bold text-xl">{confirmedCount}</div>
            <div className="text-xs text-muted-foreground">已收费确认</div>
          </div>
        </div>
        {/* Tabs */}
        <div className="flex gap-1 bg-muted p-1 rounded-xl">
          {([['checkin', '签到管理'], ['payment', '收费确认'], ['checkout', '离场管理']] as [Tab, string][]).map(([t, label]) => (
            <button
              key={t}
              onClick={() => handleTabChange(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {/* Search and filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="搜索昵称或手机号..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2.5 bg-card rounded-xl border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2.5 bg-card rounded-xl border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="all">全部</option>
            {tab === 'checkin' ? (
              <>
                <option value="未签到">未签到</option>
                <option value="已签到">已签到</option>
              </>
            ) : tab === 'checkout' ? (
              <>
                <option value="已签到">已签到（未离场）</option>
                <option value="已离场">已离场</option>
              </>
            ) : (
              <>
                <option value="未确认">未确认</option>
                <option value="已确认">已确认</option>
                <option value="已减免">已减免</option>
                <option value="已退款">已退款</option>
              </>
            )}
          </select>
        </div>
        {/* Enrollment list */}
        <div className="space-y-3">
          {enriched.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users size={32} className="mx-auto mb-3 opacity-40" />
              <p>暂无报名记录</p>
            </div>
          ) : (
            enriched.map(e => (
              <div key={e.id} className="bg-card rounded-2xl border border-border shadow-sm p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-primary text-sm font-medium">{(e.user?.name || e.contactName).charAt(0)}</span>
                    </div>
                    <div>
                      <div className="text-foreground font-medium text-sm">{e.user?.name || e.contactName}</div>
                      <div className="text-muted-foreground text-xs">{e.user?.phone || e.contactPhone}</div>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <StatusBadge status={e.checkInStatus} />
                    <StatusBadge status={e.paymentStatus} />
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                  <span>{e.adults}成人 {e.children}儿童</span>
                  <span>·</span>
                  <span className="text-accent font-medium">¥{e.amount}</span>
                  <span>·</span>
                  <span>报名 {e.enrolledAt ? new Date(e.enrolledAt).toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(/\//g, '-') : ''}</span>
                </div>
                {e.participants && e.participants.length > 0 && (
                  <div className="mb-3 space-y-1.5">
                    {e.participants.map((p, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs bg-muted/60 rounded-lg px-3 py-1.5">
                        <span className="text-foreground font-medium">{p.name || `参与者${i + 1}`}</span>
                        {p.gender && <span className="text-muted-foreground">{p.gender}</span>}
                        {p.age && <span className="text-muted-foreground">{p.age}岁</span>}
                        {p.note && <span className="text-blue-600 truncate">{p.note}</span>}
                      </div>
                    ))}
                  </div>
                )}
                {e.note && (
                  <div className="text-xs text-muted-foreground bg-muted rounded-lg px-3 py-2 mb-3">
                    备注：{e.note}
                  </div>
                )}
                {tab === 'checkin' ? (
                  <div className="flex gap-2 flex-wrap">
                    {e.checkInStatus === '未签到' && (
                      <button
                        onClick={(ev) => { ev.stopPropagation(); updateCheckIn(e.id, '已签到'); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium hover:bg-emerald-100 transition-colors"
                      >
                        <UserCheck size={13} /> 签到
                      </button>
                    )}
                    {e.checkInStatus === '已签到' && (
                      <button
                        onClick={(ev) => { ev.stopPropagation(); setCancelCheckinConfirm(e.id); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-muted text-muted-foreground rounded-lg text-xs hover:bg-secondary transition-colors"
                      >
                        <RotateCcw size={13} /> 取消签到
                      </button>
                    )}
                    {e.checkInStatus === '已离场' && (
                      <span className="text-xs text-muted-foreground">
                        签到 {e.checkInTime} · 离场 {e.checkOutTime}
                      </span>
                    )}
                    <button
                      onClick={() => openNoteModal(e.id, 'admin', e.adminNote)}
                      className="px-3 py-1.5 bg-muted text-muted-foreground rounded-lg text-xs hover:bg-secondary"
                    >
                      {e.adminNote ? '修改备注' : '添加备注'}
                    </button>
                    <button
                      onClick={() => handleRemove(e.id, e.user?.name || e.contactName)}
                      className="ml-auto px-3 py-1.5 bg-red-50 text-destructive rounded-lg text-xs hover:bg-red-100 transition-colors"
                    >
                      <Trash2 size={13} className="inline mr-1" />移除
                    </button>
                  </div>
                ) : tab === 'checkout' ? (
                  <div className="flex gap-2 flex-wrap">
                    {e.checkInStatus === '已签到' && (
                      <button
                        onClick={(ev) => { ev.stopPropagation(); updateCheckIn(e.id, '已离场'); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
                      >
                        <LogOut size={13} /> 记录离场
                      </button>
                    )}
                    {e.checkInStatus === '已离场' && (
                      <span className="text-xs text-muted-foreground">
                        签到 {e.checkInTime} · 离场 {e.checkOutTime}
                      </span>
                    )}
                    <button
                      onClick={() => openNoteModal(e.id, 'admin', e.adminNote)}
                      className="px-3 py-1.5 bg-muted text-muted-foreground rounded-lg text-xs hover:bg-secondary"
                    >
                      {e.adminNote ? '修改备注' : '添加备注'}
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2 flex-wrap">
                    {e.paymentStatus === '未确认' && (
                      <>
                        <button
                          onClick={(ev) => { ev.stopPropagation(); setConfirmPayAmount(lastPayAmount || String(e.amount)); setConfirmPayModal({ enrollId: e.id, action: '已确认' }); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium hover:bg-emerald-100"
                        >
                          <DollarSign size={13} /> 确认收款
                        </button>
                        <button
                          onClick={(ev) => { ev.stopPropagation(); setConfirmPayAmount('0'); setConfirmPayModal({ enrollId: e.id, action: '已减免' }); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs hover:bg-blue-100"
                        >
                          减免
                        </button>
                      </>
                    )}
                    {(e.paymentStatus === '已确认' || e.paymentStatus === '已减免') && (
                      <>
                        <span className="text-xs text-emerald-600">已由 {e.confirmedBy} 确认</span>
                        <button
                          onClick={(ev) => { ev.stopPropagation(); updatePayment(e.id, '已退款'); }}
                          className="px-3 py-1.5 bg-muted text-muted-foreground rounded-lg text-xs hover:bg-secondary"
                        >
                          标记退款
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => openNoteModal(e.id, 'payment', e.adminNote)}
                      className="px-3 py-1.5 bg-muted text-muted-foreground rounded-lg text-xs hover:bg-secondary"
                    >
                      {e.adminNote ? '修改备注' : '添加备注'}
                    </button>
                    <button
                      onClick={() => handleRemove(e.id, e.user?.name || e.contactName)}
                      className="ml-auto px-3 py-1.5 bg-red-50 text-destructive rounded-lg text-xs hover:bg-red-100 transition-colors"
                    >
                      <Trash2 size={13} className="inline mr-1" />移除
                    </button>
                  </div>
                )}
                {e.adminNote && (
                  <div className="text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2 mt-2">
                    管理备注：{e.adminNote}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Confirm payment modal */}
      {confirmPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setConfirmPayModal(null)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-foreground mb-3">{confirmPayModal.action === '已确认' ? '确认收款' : '确认减免'}</h3>
            <div>
              <label className="block text-sm text-muted-foreground mb-1.5">收款金额（元）</label>
              <input
                type="number"
                className="w-full px-3 py-2.5 bg-input-background rounded-xl border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30"
                value={confirmPayAmount}
                onChange={e => setConfirmPayAmount(e.target.value)}
                placeholder="请输入金额"
                autoFocus
              />
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setConfirmPayModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-border text-foreground text-sm hover:bg-muted"
              >
                取消
              </button>
              <button
                onClick={async () => {
                  const amount = Number(confirmPayAmount) || 0;
                  await updateEnrollment(confirmPayModal.enrollId, {
                    paymentStatus: confirmPayModal.action,
                    amount,
                    confirmedBy: currentUser?.name,
                    confirmedAt: new Date().toLocaleString('zh-CN'),
                  });
                  setLastPayAmount(confirmPayAmount);
                  setConfirmPayModal(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Note modal */}
      {noteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setNoteModal(null)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-foreground mb-3">添加管理备注</h3>
            <textarea
              className="w-full px-3 py-2.5 bg-input-background rounded-xl border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              rows={3}
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="输入备注内容..."
            />
            <div className="flex gap-3 mt-3">
              <button onClick={() => setNoteModal(null)} className="flex-1 py-2.5 rounded-xl border border-border text-sm hover:bg-muted">取消</button>
              <button onClick={saveNote} className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90">保存</button>
            </div>
          </div>
        </div>
      )}

      {/* Manual add modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setShowAddModal(false); setAddResult(null); }} />
          <div className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-foreground">后台报名</h2>
                <button onClick={() => { setShowAddModal(false); setAddResult(null); }} className="text-muted-foreground hover:text-foreground">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-foreground mb-1.5">联系手机 *</label>
                  <input
                    className="w-full px-3 py-2.5 bg-input-background rounded-xl border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    value={addForm.contactPhone}
                    onChange={e => setAddForm(p => ({ ...p, contactPhone: e.target.value }))}
                    placeholder="请输入手机号"
                  />
                  <p className="text-xs text-muted-foreground mt-1">若用户不存在将自动创建账号</p>
                </div>
                <div>
                  <label className="block text-sm text-foreground mb-1.5">联系人昵称</label>
                  <input
                    className="w-full px-3 py-2.5 bg-input-background rounded-xl border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    value={addForm.contactName}
                    onChange={e => setAddForm(p => ({ ...p, contactName: e.target.value }))}
                    placeholder="请输入联系人昵称"
                  />
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-sm text-foreground mb-1.5">成人人数</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const newAdults = Math.max(1, addForm.adults - 1);
                          const ps = [...(addForm.participants || [])];
                          if (ps.length > newAdults + addForm.children) ps.splice(newAdults, 1);
                          setAddForm(p => ({ ...p, adults: newAdults, participants: rebuildParticipants(newAdults, p.children, ps) }));
                        }}
                        className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-foreground hover:bg-muted"
                      >-</button>
                      <span className="text-foreground font-medium w-6 text-center">{addForm.adults}</span>
                      <button
                        onClick={() => {
                          const newAdults = addForm.adults + 1;
                          setAddForm(p => ({ ...p, adults: newAdults, participants: rebuildParticipants(newAdults, p.children, p.participants || []) }));
                        }}
                        className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-foreground hover:bg-muted"
                      >+</button>
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm text-foreground mb-1.5">儿童人数</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const newChildren = Math.max(0, addForm.children - 1);
                          const ps = [...(addForm.participants || [])];
                          if (ps.length > addForm.adults + newChildren) ps.splice(addForm.adults + newChildren, 1);
                          setAddForm(p => ({ ...p, children: newChildren, participants: rebuildParticipants(p.adults, newChildren, ps) }));
                        }}
                        className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-foreground hover:bg-muted"
                      >-</button>
                      <span className="text-foreground font-medium w-6 text-center">{addForm.children}</span>
                      <button
                        onClick={() => {
                          const newChildren = addForm.children + 1;
                          setAddForm(p => ({ ...p, children: newChildren, participants: rebuildParticipants(p.adults, newChildren, p.participants || []) }));
                        }}
                        className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-foreground hover:bg-muted"
                      >+</button>
                    </div>
                  </div>
                </div>
                {(addForm.participants || []).length > 0 && (
                  <div className="space-y-3">
                    {(addForm.participants || []).map((p, idx) => (
                      <div key={idx} className="bg-input-background rounded-xl p-3 border border-border">
                        <div className="text-xs font-medium text-muted-foreground mb-2">{p.name || (idx < addForm.adults ? `成人${idx + 1}` : `儿童${idx - addForm.adults + 1}`)}</div>
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            className="px-2 py-1.5 bg-white rounded-lg border border-border text-xs outline-none focus:ring-1 focus:ring-primary/30"
                            value={p.name}
                            onChange={e => updateParticipant(idx, 'name', e.target.value)}
                            placeholder="称呼"
                          />
                          <select
                            className="px-2 py-1.5 bg-white rounded-lg border border-border text-xs outline-none focus:ring-1 focus:ring-primary/30"
                            value={p.gender}
                            onChange={e => updateParticipant(idx, 'gender', e.target.value)}
                          >
                            <option value="">性别</option>
                            <option value="男">男</option>
                            <option value="女">女</option>
                          </select>
                          <input
                            className="px-2 py-1.5 bg-white rounded-lg border border-border text-xs outline-none focus:ring-1 focus:ring-primary/30"
                            value={p.age}
                            onChange={e => updateParticipant(idx, 'age', e.target.value)}
                            placeholder="年龄"
                          />
                        </div>
                        <input
                          className="mt-1.5 w-full px-2 py-1.5 bg-white rounded-lg border border-border text-xs outline-none focus:ring-1 focus:ring-primary/30"
                          value={p.note}
                          onChange={e => updateParticipant(idx, 'note', e.target.value)}
                          placeholder="备注"
                        />
                      </div>
                    ))}
                  </div>
                )}
                <div>
                  <label className="block text-sm text-foreground mb-1.5">备注</label>
                  <textarea
                    className="w-full px-3 py-2.5 bg-input-background rounded-xl border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                    rows={2}
                    value={addForm.note}
                    onChange={e => setAddForm(p => ({ ...p, note: e.target.value }))}
                    placeholder="备注信息"
                  />
                </div>
                {addResult && (
                  <p className={`text-sm px-3 py-2 rounded-lg ${addResult.success ? 'text-emerald-600 bg-emerald-50' : 'text-destructive bg-red-50'}`}>
                    {addResult.message}
                  </p>
                )}
                <div className="flex gap-3 pt-2">
                  <button onClick={() => { setShowAddModal(false); setAddResult(null); }} className="flex-1 py-3 rounded-xl border border-border text-foreground text-sm hover:bg-muted transition-colors">
                    取消
                  </button>
                  <button
                    onClick={handleAddEnroll}
                    disabled={!addForm.contactPhone}
                    className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${
                      addForm.contactPhone
                        ? 'bg-primary text-white hover:bg-primary/90'
                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                    }`}
                  >
                    确认添加
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* 移除报名确认弹窗 */}
      {removeConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setRemoveConfirm(null)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-foreground font-medium mb-2">确认移除报名</h3>
            <p className="text-sm text-muted-foreground mb-1">
              确定要移除「{removeConfirm.name}」的报名吗？
            </p>
            <p className="text-sm text-destructive mb-5">移除后该用户将无法恢复此报名记录。</p>
            <div className="flex gap-3">
              <button
                onClick={() => setRemoveConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-border text-foreground text-sm hover:bg-muted transition-colors"
              >
                取消
              </button>
              <button
                onClick={async () => {
                  await removeEnrollment(removeConfirm.id);
                  setRemoveConfirm(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-destructive text-white text-sm font-medium hover:bg-destructive/90 transition-colors"
              >
                确认移除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 取消签到确认弹窗 */}
      {cancelCheckinConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setCancelCheckinConfirm(null)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-foreground font-medium mb-2">确认取消签到</h3>
            <div className="flex items-start gap-2 mb-4">
              <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">取消签到后，该用户的签到状态将恢复为"未签到"，签到时间记录将被清除。</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setCancelCheckinConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-border text-foreground text-sm hover:bg-muted transition-colors"
              >
                返回
              </button>
              <button
                onClick={async () => {
                  await updateCheckIn(cancelCheckinConfirm, '未签到');
                  setCancelCheckinConfirm(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors"
              >
                确认取消签到
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
