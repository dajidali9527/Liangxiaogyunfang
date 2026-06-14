import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from './AdminLayout';
import { StatusBadge } from '../shared/StatusBadge';
import { ArrowLeft, Search, CheckCircle, DollarSign, LogOut, RotateCcw, Users, Plus, Trash2, X, Download } from 'lucide-react';
import { ManualEnrollData } from '../../context/AppContext';
import * as XLSX from 'xlsx';

type Tab = 'checkin' | 'payment';

export function AdminRosterPage({ activityId }: { activityId: string }) {
  const { activities, enrollments, users, currentUser, navigate, updateCheckIn, updatePayment, updateEnrollment, manualEnroll, removeEnrollment, fetchAdminEnrollments } = useApp();
  const activity = activities.find(a => a.id === activityId);
  const [tab, setTab] = useState<Tab>('checkin');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [noteModal, setNoteModal] = useState<{ enrollId: string; type: 'admin' | 'payment' } | null>(null);
  const [noteText, setNoteText] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState<ManualEnrollData>({ contactName: '', contactPhone: '', adults: 1, children: 0, amount: 0, note: '' });
  const [addResult, setAddResult] = useState<{ success: boolean; message: string } | null>(null);
  const [confirmPayModal, setConfirmPayModal] = useState<{ enrollId: string; action: '已确认' | '已减免' } | null>(null);
  const [confirmPayAmount, setConfirmPayAmount] = useState('');
  const [lastPayAmount, setLastPayAmount] = useState('');
  useEffect(() => {
    fetchAdminEnrollments(activityId);
  }, [activityId]);

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
    return matchSearch && matchFilter;
  });
  const checkedInCount = actEnrollments.filter(e => e.checkInStatus !== '未签到').length;
  const confirmedCount = actEnrollments.filter(e => e.paymentStatus === '已确认' || e.paymentStatus === '已减免').length;

  const openNoteModal = (enrollId: string, type: 'admin' | 'payment', current: string) => {
    setNoteText(current);
    setNoteModal({ enrollId, type });
  };
  const saveNote = async () => {
    if (!noteModal) return;
    await updateEnrollment(noteModal.enrollId, { adminNote: noteText });
    setNoteModal(null);
  };

  const handleAddEnroll = async () => {
    if (!addForm.contactPhone) return;
    const result = await manualEnroll(activityId, addForm);
    setAddResult(result);
    if (result.success) {
      setTimeout(() => {
        setShowAddModal(false);
        setAddForm({ contactName: '', contactPhone: '', adults: 1, children: 0, amount: 0, note: '' });
        setAddResult(null);
      }, 500);
    }
  };

  const handleRemove = async (enrollmentId: string, name: string) => {
    if (confirm(`确定要移除 ${name} 的报名吗？将保留历史数据。`)) {
      await removeEnrollment(enrollmentId);
    }
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
        <div className="flex items-center gap-3">
          <button onClick={() => navigate({ page: 'admin-activities' })} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1">
            <h1 className="text-foreground leading-tight">{activity.name}</h1>
            <p className="text-muted-foreground text-sm">{activity.startDate} · {activity.location}</p>
          </div>
          <div className="flex gap-2">
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
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-xl p-3 border border-border text-center">
            <div className="text-primary font-bold text-xl">{actEnrollments.length}</div>
            <div className="text-xs text-muted-foreground">已报名</div>
          </div>
          <div className="bg-card rounded-xl p-3 border border-border text-center">
            <div className="text-emerald-600 font-bold text-xl">{checkedInCount}</div>
            <div className="text-xs text-muted-foreground">已签到</div>
          </div>
          <div className="bg-card rounded-xl p-3 border border-border text-center">
            <div className="text-accent font-bold text-xl">{confirmedCount}</div>
            <div className="text-xs text-muted-foreground">已收费确认</div>
          </div>
        </div>
        {/* Tabs */}
        <div className="flex gap-1 bg-muted p-1 rounded-xl">
          {([['checkin', '签到管理'], ['payment', '收费确认']] as [Tab, string][]).map(([t, label]) => (
            <button
              key={t}
              onClick={() => { setTab(t); setFilterStatus('all'); }}
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
                  <span>报名 {e.enrolledAt.split(' ')[0]}</span>
                </div>
                {e.note && (
                  <div className="text-xs text-muted-foreground bg-muted rounded-lg px-3 py-2 mb-3">
                    备注：{e.note}
                  </div>
                )}
                {tab === 'checkin' ? (
                  <div className="flex gap-2 flex-wrap">
                    {e.checkInStatus === '未签到' && (
                      <button
                        onClick={(ev) => { ev.stopPropagation(); updateCheckIn(e.id, '已签到').then(() => setFilterStatus('all')); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium hover:bg-emerald-100 transition-colors"
                      >
                        <CheckCircle size={13} /> 签到
                      </button>
                    )}
                    {e.checkInStatus === '已签到' && (
                      <>
                        <button
                          onClick={(ev) => { ev.stopPropagation(); updateCheckIn(e.id, '已离场').then(() => setFilterStatus('all')); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
                        >
                          <LogOut size={13} /> 记录离场
                        </button>
                        <button
                          onClick={(ev) => { ev.stopPropagation(); updateCheckIn(e.id, '未签到').then(() => setFilterStatus('all')); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-muted text-muted-foreground rounded-lg text-xs hover:bg-secondary transition-colors"
                        >
                          <RotateCcw size={13} /> 取消签到
                        </button>
                      </>
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
                          onClick={(ev) => { ev.stopPropagation(); updatePayment(e.id, '已退款').then(() => setFilterStatus('all')); }}
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
                  setFilterStatus('all');
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
                  <label className="block text-sm text-foreground mb-1.5">昵称（可选）</label>
                  <input
                    className="w-full px-3 py-2.5 bg-input-background rounded-xl border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    value={addForm.contactName}
                    onChange={e => setAddForm(p => ({ ...p, contactName: e.target.value }))}
                    placeholder="请输入昵称"
                  />
                </div>
                <div>
                  <label className="block text-sm text-foreground mb-1.5">手机号 *</label>
                  <input
                    className="w-full px-3 py-2.5 bg-input-background rounded-xl border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    value={addForm.contactPhone}
                    onChange={e => setAddForm(p => ({ ...p, contactPhone: e.target.value }))}
                    placeholder="请输入手机号"
                  />
                  <p className="text-xs text-muted-foreground mt-1">若用户不存在将自动创建账号</p>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-sm text-foreground mb-1.5">成人人数</label>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setAddForm(p => ({ ...p, adults: Math.max(1, p.adults - 1) }))} className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-foreground hover:bg-muted">-</button>
                      <span className="text-foreground font-medium w-6 text-center">{addForm.adults}</span>
                      <button onClick={() => setAddForm(p => ({ ...p, adults: p.adults + 1 }))} className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-foreground hover:bg-muted">+</button>
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm text-foreground mb-1.5">儿童人数</label>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setAddForm(p => ({ ...p, children: Math.max(0, p.children - 1) }))} className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-foreground hover:bg-muted">-</button>
                      <span className="text-foreground font-medium w-6 text-center">{addForm.children}</span>
                      <button onClick={() => setAddForm(p => ({ ...p, children: p.children + 1 }))} className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-foreground hover:bg-muted">+</button>
                    </div>
                  </div>
                </div>
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
    </AdminLayout>
  );
}
