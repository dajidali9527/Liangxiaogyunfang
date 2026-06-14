import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../shared/Header';
import { StatusBadge } from '../shared/StatusBadge';
import { ArrowLeft, Calendar, MapPin, CheckCircle, FileText, Pencil, X, Check } from 'lucide-react';
import { Participant } from '../../context/AppContext';

export function MyActivityDetailPage({ enrollmentId }: { enrollmentId: string }) {
  const { currentUser, enrollments, activities, navigate, updateEnrollment } = useApp();
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<{
    contactName: string;
    adults: number;
    children: number;
    note: string;
    participants: Participant[];
  } | null>(null);
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-2xl mx-auto px-4 pt-16 text-center">
          <p className="text-muted-foreground mb-4">请先登录查看报名详情</p>
          <button onClick={() => navigate({ page: 'login', redirect: { page: 'my-history' } })} className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm">
            去登录
          </button>
        </div>
      </div>
    );
  }
  const enrollment = enrollments.find(e => e.id === enrollmentId);
  if (!enrollment) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-2xl mx-auto px-4 pt-16 text-center text-muted-foreground">报名记录不存在</div>
      </div>
    );
  }
  const activity = activities.find(a => a.id === enrollment.activityId);
  if (!activity) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-2xl mx-auto px-4 pt-16 text-center text-muted-foreground">活动不存在</div>
      </div>
    );
  }
  const startEdit = () => {
    setEditForm({
      contactName: enrollment.contactName,
      adults: enrollment.adults,
      children: enrollment.children,
      note: enrollment.note,
      participants: enrollment.participants ? [...enrollment.participants] : [],
    });
    setEditing(true);
  };
  const cancelEdit = () => {
    setEditing(false);
    setEditForm(null);
  };
  const saveEdit = async () => {
    if (!editForm) return;
    await updateEnrollment(enrollmentId, {
      contactName: editForm.contactName,
      adults: editForm.adults,
      children: editForm.children,
      note: editForm.note,
      participants: editForm.participants,
      amount: activity.price * (editForm.adults + editForm.children * 0.5),
    });
    setEditing(false);
    setEditForm(null);
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
    if (!editForm) return;
    const ps = [...editForm.participants];
    ps[idx] = { ...ps[idx], [field]: value };
    setEditForm({ ...editForm, participants: ps });
  };
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-2xl mx-auto px-4 pt-4 pb-24">
        <button
          onClick={() => navigate({ page: 'my-history' })}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm transition-colors mb-4"
        >
          <ArrowLeft size={14} /> 返回报名记录
        </button>
        <h1 className="text-foreground mb-5">报名详情</h1>
        {/* 活动信息 */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden mb-4">
          <div className="h-36 bg-muted overflow-hidden">
            <img src={activity.imageUrl} alt={activity.name} className="w-full h-full object-cover" />
          </div>
          <div className="p-4">
            <div className="flex items-start justify-between gap-2 mb-3">
              <h3 className="text-foreground font-medium leading-snug">{activity.name}</h3>
              <StatusBadge status={activity.status} />
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar size={13} className="shrink-0" />
                <span>{activity.startDate}{activity.endDate !== activity.startDate && ` 至 ${activity.endDate}`}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin size={13} className="shrink-0" />
                <span>{activity.location}</span>
              </div>
            </div>
          </div>
        </div>
        {/* 报名信息 */}
        <div className="bg-card rounded-2xl p-4 border border-border mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-foreground font-medium">报名信息</h3>
            {!editing ? (
              <button onClick={startEdit} className="flex items-center gap-1 text-primary text-sm hover:text-primary/80">
                <Pencil size={13} /> 修改
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={cancelEdit} className="flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground">
                  <X size={13} /> 取消
                </button>
                <button onClick={saveEdit} className="flex items-center gap-1 text-primary text-sm hover:text-primary/80">
                  <Check size={13} /> 保存
                </button>
              </div>
            )}
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">报名状态</span>
              <StatusBadge status={enrollment.status} />
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">报名时间</span>
              <span className="text-foreground">{enrollment.enrolledAt}</span>
            </div>
            {editing ? (
              <>
                <div>
                  <label className="block text-muted-foreground mb-1.5">联系人昵称</label>
                  <input
                    className="w-full px-3 py-2.5 bg-input-background rounded-xl border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    value={editForm!.contactName}
                    onChange={e => setEditForm({ ...editForm!, contactName: e.target.value })}
                    placeholder="请输入联系人昵称"
                  />
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">联系手机</span>
                  <span className="text-foreground">{enrollment.contactPhone}</span>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-muted-foreground mb-1.5">成人人数</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const newAdults = Math.max(0, editForm!.adults - 1);
                          setEditForm({ ...editForm!, adults: newAdults, participants: rebuildParticipants(newAdults, editForm!.children, editForm!.participants) });
                        }}
                        className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-foreground hover:bg-muted"
                      >-</button>
                      <span className="text-foreground font-medium w-6 text-center">{editForm!.adults}</span>
                      <button
                        onClick={() => {
                          const newAdults = editForm!.adults + 1;
                          setEditForm({ ...editForm!, adults: newAdults, participants: rebuildParticipants(newAdults, editForm!.children, editForm!.participants) });
                        }}
                        className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-foreground hover:bg-muted"
                      >+</button>
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-muted-foreground mb-1.5">儿童人数</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const newChildren = Math.max(0, editForm!.children - 1);
                          setEditForm({ ...editForm!, children: newChildren, participants: rebuildParticipants(editForm!.adults, newChildren, editForm!.participants) });
                        }}
                        className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-foreground hover:bg-muted"
                      >-</button>
                      <span className="text-foreground font-medium w-6 text-center">{editForm!.children}</span>
                      <button
                        onClick={() => {
                          const newChildren = editForm!.children + 1;
                          setEditForm({ ...editForm!, children: newChildren, participants: rebuildParticipants(editForm!.adults, newChildren, editForm!.participants) });
                        }}
                        className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-foreground hover:bg-muted"
                      >+</button>
                    </div>
                  </div>
                </div>
                {editForm!.participants.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">参与者明细</span>
                    <div className="mt-2 space-y-2">
                      {editForm!.participants.map((p, idx) => (
                        <div key={idx} className="bg-input-background rounded-xl p-3 border border-border">
                          <div className="text-xs font-medium text-muted-foreground mb-2">{p.name || (idx < editForm!.adults ? `成人${idx + 1}` : `儿童${idx - editForm!.adults + 1}`)}</div>
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
                  </div>
                )}
                <div>
                  <label className="block text-muted-foreground mb-1.5">备注</label>
                  <textarea
                    className="w-full px-3 py-2.5 bg-input-background rounded-xl border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                    rows={4}
                    value={editForm!.note}
                    onChange={e => setEditForm({ ...editForm!, note: e.target.value })}
                    placeholder="特殊需求、过敏信息等"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">联系人昵称</span>
                  <span className="text-foreground">{enrollment.contactName || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">联系手机</span>
                  <span className="text-foreground">{enrollment.contactPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">人数</span>
                  <span className="text-foreground">{enrollment.adults}成人 {enrollment.children}儿童</span>
                </div>
                {enrollment.participants && enrollment.participants.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">参与者明细</span>
                    <div className="mt-2 space-y-1.5">
                      {enrollment.participants.map((p, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs bg-muted rounded-lg px-3 py-2">
                          <span className="font-medium text-foreground">{p.name || (idx < enrollment.adults ? `成人${idx + 1}` : `儿童${idx - enrollment.adults + 1}`)}</span>
                          {p.gender && <span className="text-muted-foreground">{p.gender}</span>}
                          {p.age && <span className="text-muted-foreground">{p.age}岁</span>}
                          {p.note && <span className="text-muted-foreground">· {p.note}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {enrollment.note && (
                  <div>
                    <span className="text-muted-foreground">备注</span>
                    <p className="text-foreground mt-1 text-xs bg-muted rounded-lg px-3 py-2">{enrollment.note}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        {/* 签到记录 */}
        <div className="bg-card rounded-2xl p-4 border border-border mb-4">
          <h3 className="text-foreground font-medium mb-3 flex items-center gap-2">
            <CheckCircle size={16} /> 签到记录
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">签到状态</span>
              <StatusBadge status={enrollment.checkInStatus} />
            </div>
            {enrollment.checkInTime && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">签到时间</span>
                <span className="text-foreground">{enrollment.checkInTime}</span>
              </div>
            )}
            {enrollment.checkOutTime && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">离场时间</span>
                <span className="text-foreground">{enrollment.checkOutTime}</span>
              </div>
            )}
          </div>
        </div>
        {/* 管理员备注 */}
        {enrollment.adminNote && (
          <div className="bg-card rounded-2xl p-4 border border-border mb-4">
            <h3 className="text-foreground font-medium mb-3 flex items-center gap-2">
              <FileText size={16} /> 管理员备注
            </h3>
            <p className="text-sm text-foreground/80 bg-blue-50 rounded-lg px-3 py-2">{enrollment.adminNote}</p>
          </div>
        )}
      </div>
    </div>
  );
}
