import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../shared/StatusBadge';
import { Header } from '../shared/Header';
import { ArrowLeft, MapPin, Calendar, Users, Clock, DollarSign, ExternalLink, CheckCircle } from 'lucide-react';
import { EnrollData } from '../../context/AppContext';

export function ActivityDetailPage({ activityId }: { activityId: string }) {
  const { activities, enrollments, currentUser, navigate, enroll } = useApp();
  const activity = activities.find(a => a.id === activityId);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollForm, setEnrollForm] = useState<EnrollData>({
    adults: 1,
    children: 1,
    contactName: currentUser?.name || '',
    contactPhone: currentUser?.phone || '',
    note: '',
  });
  const [enrollResult, setEnrollResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!activity) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-2xl mx-auto px-4 pt-16 text-center text-muted-foreground">活动不存在</div>
      </div>
    );
  }

  const myEnrollment = currentUser
    ? enrollments.find(e => e.activityId === activityId && e.userId === currentUser.id && e.status !== '已取消' && e.status !== '已移除')
    : null;

  const canEnroll = activity.status === '报名中' && !myEnrollment;
  const isFull = activity.status === '已满员';
  const isEnded = activity.status === '已结束' || activity.status === '已关闭';
  const enrollDeadlinePassed = new Date(activity.enrollDeadline) < new Date();
  const totalAmount = activity.price * (enrollForm.adults + enrollForm.children * 0.5);

  const handleEnroll = () => {
    if (!currentUser) {
      navigate({ page: 'login', redirect: { page: 'activity-detail', id: activityId } });
      return;
    }
    const result = enroll(activityId, enrollForm);
    setEnrollResult(result);
    if (result.success) setEnrolling(false);
  };

  const descLines = activity.description.split('\n');

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-2xl mx-auto pb-32">
        {/* Back */}
        <div className="px-4 pt-4">
          <button
            onClick={() => navigate({ page: 'home' })}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            <ArrowLeft size={14} /> 返回列表
          </button>
        </div>

        {/* Hero image */}
        <div className="relative h-56 mt-3 overflow-hidden">
          <img src={activity.imageUrl} alt={activity.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-2 mb-2">
              <StatusBadge status={activity.status} size="md" />
              {activity.tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-white/20 backdrop-blur-sm text-white text-xs rounded-full">
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="text-white leading-tight">{activity.name}</h1>
          </div>
        </div>

        <div className="px-4 pt-5 space-y-5">
          {/* Key info */}
          <div className="bg-card rounded-2xl p-4 border border-border space-y-3">
            <div className="flex items-start gap-3">
              <Calendar size={16} className="text-primary mt-0.5 shrink-0" />
              <div>
                <div className="text-xs text-muted-foreground mb-0.5">活动时间</div>
                <div className="text-sm text-foreground">
                  {activity.startDate}
                  {activity.endDate !== activity.startDate && ` 至 ${activity.endDate}`}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin size={16} className="text-primary mt-0.5 shrink-0" />
              <div>
                <div className="text-xs text-muted-foreground mb-0.5">活动地点</div>
                <div className="text-sm text-foreground">{activity.location}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock size={16} className="text-primary mt-0.5 shrink-0" />
              <div>
                <div className="text-xs text-muted-foreground mb-0.5">报名截止</div>
                <div className={`text-sm ${enrollDeadlinePassed ? 'text-destructive' : 'text-foreground'}`}>
                  {activity.enrollDeadline}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users size={16} className="text-primary mt-0.5 shrink-0" />
              <div className="flex-1">
                <div className="text-xs text-muted-foreground mb-0.5">报名人数</div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-foreground">{activity.enrolled} / {activity.capacity} 人</span>
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isFull ? 'bg-amber-400' : 'bg-primary'}`}
                      style={{ width: `${Math.round((activity.enrolled / activity.capacity) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <DollarSign size={16} className="text-accent mt-0.5 shrink-0" />
              <div>
                <div className="text-xs text-muted-foreground mb-0.5">活动费用</div>
                <div className="text-sm font-semibold text-accent">¥{activity.price} / 人起</div>
                <div className="text-xs text-muted-foreground mt-0.5">收款方：{activity.payee}</div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-card rounded-2xl p-4 border border-border">
            <h3 className="text-foreground mb-3">活动介绍</h3>
            <div className="text-sm text-foreground/80 leading-relaxed space-y-1.5">
              {descLines.map((line, i) => (
                <p key={i} className={line.startsWith('•') ? 'pl-2' : ''}>
                  {line || ' '}
                </p>
              ))}
            </div>
          </div>

          {/* Video link placeholder */}
          <div className="bg-card rounded-2xl p-4 border border-border">
            <h3 className="text-foreground mb-2">相关视频</h3>
            <a
              href="#"
              className="flex items-center gap-2 text-primary text-sm hover:underline"
              onClick={e => e.preventDefault()}
            >
              <ExternalLink size={14} />
              查看活动回顾视频（B站）
            </a>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border px-4 py-3 z-30">
        <div className="max-w-2xl mx-auto">
          {enrollResult?.success && (
            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 rounded-xl px-4 py-3 mb-3 text-sm">
              <CheckCircle size={16} />
              {enrollResult.message}
              <button className="ml-auto text-primary underline" onClick={() => navigate({ page: 'my-history' })}>
                查看报名
              </button>
            </div>
          )}

          {myEnrollment && (
            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 rounded-xl px-4 py-3 mb-3 text-sm">
              <CheckCircle size={16} />
              您已报名此活动
              <button className="ml-auto text-primary underline" onClick={() => navigate({ page: 'my-history' })}>
                查看记录
              </button>
            </div>
          )}

          {!enrollResult?.success && !myEnrollment && (
            <button
              onClick={() => {
                if (!currentUser) {
                  navigate({ page: 'login', redirect: { page: 'activity-detail', id: activityId } });
                  return;
                }
                if (canEnroll) setEnrolling(true);
              }}
              disabled={!canEnroll || isEnded || isFull || enrollDeadlinePassed}
              className={`w-full py-3.5 rounded-xl font-medium text-sm transition-all ${
                canEnroll && !isEnded && !enrollDeadlinePassed
                  ? 'bg-primary text-white hover:bg-primary/90 shadow-sm'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              {isEnded ? '活动已结束' : isFull ? '名额已满' : enrollDeadlinePassed ? '报名已截止' : '立即报名'}
            </button>
          )}
        </div>
      </div>

      {/* Enroll dialog */}
      {enrolling && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEnrolling(false)} />
          <div className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <h2 className="text-foreground mb-1">确认报名</h2>
              <p className="text-muted-foreground text-sm mb-5">{activity.name}</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-foreground mb-1.5">联系人姓名</label>
                  <input
                    className="w-full px-3 py-2.5 bg-input-background rounded-xl border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    value={enrollForm.contactName}
                    onChange={e => setEnrollForm(p => ({ ...p, contactName: e.target.value }))}
                    placeholder="请输入联系人姓名"
                  />
                </div>
                <div>
                  <label className="block text-sm text-foreground mb-1.5">联系手机</label>
                  <input
                    className="w-full px-3 py-2.5 bg-input-background rounded-xl border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    value={enrollForm.contactPhone}
                    onChange={e => setEnrollForm(p => ({ ...p, contactPhone: e.target.value }))}
                    placeholder="请输入手机号"
                  />
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-sm text-foreground mb-1.5">成人人数</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEnrollForm(p => ({ ...p, adults: Math.max(1, p.adults - 1) }))}
                        className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-foreground hover:bg-muted"
                      >-</button>
                      <span className="text-foreground font-medium w-6 text-center">{enrollForm.adults}</span>
                      <button
                        onClick={() => setEnrollForm(p => ({ ...p, adults: p.adults + 1 }))}
                        className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-foreground hover:bg-muted"
                      >+</button>
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm text-foreground mb-1.5">儿童人数</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEnrollForm(p => ({ ...p, children: Math.max(0, p.children - 1) }))}
                        className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-foreground hover:bg-muted"
                      >-</button>
                      <span className="text-foreground font-medium w-6 text-center">{enrollForm.children}</span>
                      <button
                        onClick={() => setEnrollForm(p => ({ ...p, children: p.children + 1 }))}
                        className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-foreground hover:bg-muted"
                      >+</button>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-foreground mb-1.5">备注（可选）</label>
                  <textarea
                    className="w-full px-3 py-2.5 bg-input-background rounded-xl border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                    rows={2}
                    value={enrollForm.note}
                    onChange={e => setEnrollForm(p => ({ ...p, note: e.target.value }))}
                    placeholder="特殊需求、过敏信息等"
                  />
                </div>

                {enrollResult && !enrollResult.success && (
                  <p className="text-destructive text-sm bg-red-50 px-3 py-2 rounded-lg">{enrollResult.message}</p>
                )}

                <div className="bg-secondary rounded-xl p-3 flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">预计费用</span>
                  <span className="font-bold text-accent">¥{totalAmount.toFixed(0)}</span>
                </div>
                <p className="text-xs text-muted-foreground">儿童半价，费用请在活动当天向管理员确认</p>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setEnrolling(false)}
                    className="flex-1 py-3 rounded-xl border border-border text-foreground text-sm hover:bg-muted transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleEnroll}
                    className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    确认报名
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
