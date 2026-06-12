import { useApp } from '../../context/AppContext';
import { AdminLayout } from './AdminLayout';
import { Calendar, Users, CheckCircle, DollarSign, Clock, TrendingUp, ChevronRight } from 'lucide-react';
import { StatusBadge } from '../shared/StatusBadge';

export function AdminDashboard() {
  const { activities, enrollments, users, navigate } = useApp();

  const activeActivities = activities.filter(a => a.status === '报名中' || a.status === '已满员');
  const totalEnrollments = enrollments.filter(e => e.status !== '已取消' && e.status !== '已移除');
  const checkedIn = enrollments.filter(e => e.checkInStatus === '已签到' || e.checkInStatus === '已离场');
  const confirmed = enrollments.filter(e => e.paymentStatus === '已确认' || e.paymentStatus === '已减免');
  const pending = enrollments.filter(e => e.paymentStatus === '未确认' && e.status !== '已取消');
  const notCheckedIn = totalEnrollments.filter(e => e.checkInStatus === '未签到');

  const stats = [
    { label: '进行中活动', value: activeActivities.length, icon: <Calendar size={18} />, color: 'text-primary', bg: 'bg-primary/10' },
    { label: '总报名人数', value: totalEnrollments.length, icon: <Users size={18} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: '已签到', value: checkedIn.length, icon: <CheckCircle size={18} />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: '已收费确认', value: confirmed.length, icon: <DollarSign size={18} />, color: 'text-accent', bg: 'bg-orange-50' },
    { label: '待收费确认', value: pending.length, icon: <Clock size={18} />, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: '注册用户', value: users.filter(u => u.role === 'user').length, icon: <TrendingUp size={18} />, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const recentActivities = [...activities]
    .filter(a => a.status !== '草稿')
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  const pendingItems = [
    ...enrollments.filter(e => e.paymentStatus === '未确认' && e.status === '已报名').slice(0, 3).map(e => {
      const a = activities.find(a => a.id === e.activityId);
      const u = users.find(u => u.id === e.userId);
      return { type: '待收费确认', name: u?.name || '', activity: a?.name || '', activityId: e.activityId };
    }),
    ...enrollments.filter(e => e.checkInStatus === '未签到' && e.status === '已报名').slice(0, 2).map(e => {
      const a = activities.find(a => a.id === e.activityId);
      const u = users.find(u => u.id === e.userId);
      return { type: '待签到', name: u?.name || '', activity: a?.name || '', activityId: e.activityId };
    }),
  ].slice(0, 5);

  return (
    <AdminLayout>
      <div className="p-6 space-y-6 max-w-5xl">
        <div>
          <h1 className="text-foreground">运营概览</h1>
          <p className="text-muted-foreground text-sm mt-0.5">今日 2026-06-12</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {stats.map(s => (
            <div key={s.label} className="bg-card rounded-2xl p-4 border border-border shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-xl ${s.bg}`}>
                  <span className={s.color}>{s.icon}</span>
                </div>
              </div>
              <div className={`text-2xl font-bold ${s.color} mb-0.5`}>{s.value}</div>
              <div className="text-muted-foreground text-xs">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          {/* Recent activities */}
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h3 className="text-foreground">最近活动</h3>
              <button onClick={() => navigate({ page: 'admin-activities' })} className="text-primary text-sm flex items-center gap-1 hover:underline">
                全部 <ChevronRight size={13} />
              </button>
            </div>
            <div className="divide-y divide-border">
              {recentActivities.map(a => {
                const count = enrollments.filter(e => e.activityId === a.id && e.status !== '已取消').length;
                return (
                  <button
                    key={a.id}
                    onClick={() => navigate({ page: 'admin-activity-detail', activityId: a.id })}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-muted shrink-0">
                      <img src={a.imageUrl} alt={a.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-foreground truncate">{a.name}</div>
                      <div className="text-xs text-muted-foreground">{a.startDate} · {count} 人报名</div>
                    </div>
                    <StatusBadge status={a.status} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pending tasks */}
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h3 className="text-foreground">待处理事项</h3>
            </div>
            {pendingItems.length === 0 ? (
              <div className="px-4 py-8 text-center text-muted-foreground text-sm">暂无待处理事项 🎉</div>
            ) : (
              <div className="divide-y divide-border">
                {pendingItems.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => navigate({ page: 'admin-activity-detail', activityId: item.activityId })}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${
                      item.type === '待收费确认' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {item.type}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-foreground">{item.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{item.activity}</div>
                    </div>
                    <ChevronRight size={14} className="text-muted-foreground shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
