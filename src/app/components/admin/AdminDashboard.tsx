import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from './AdminLayout';
import { Calendar, Users, CheckCircle, DollarSign, Clock, TrendingUp, ChevronRight } from 'lucide-react';
import { StatusBadge } from '../shared/StatusBadge';

export function AdminDashboard() {
  const { activities, navigate, fetchDashboard } = useApp();
  const [dashboardData, setDashboardData] = useState<any>(null);
  useEffect(() => {
    (async () => {
      const data = await fetchDashboard();
      if (data) setDashboardData(data);
    })();
  }, []);
  const stats = dashboardData?.stats;
  const recentActivities = dashboardData?.recentActivities || [];
  const pendingItems = dashboardData?.pendingItems || [];
  const statCards = [
    { label: '进行中活动', value: stats?.activeActivities ?? 0, icon: <Calendar size={18} />, color: 'text-primary', bg: 'bg-primary/10' },
    { label: '总报名人数', value: stats?.totalEnrollments ?? 0, icon: <Users size={18} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: '已签到', value: stats?.checkedIn ?? 0, icon: <CheckCircle size={18} />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: '已收费确认', value: stats?.paidConfirmed ?? 0, icon: <DollarSign size={18} />, color: 'text-accent', bg: 'bg-orange-50' },
    { label: '待收费确认', value: stats?.pendingPayment ?? 0, icon: <Clock size={18} />, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: '注册用户', value: stats?.totalUsers ?? 0, icon: <TrendingUp size={18} />, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];
  const displayActivities = recentActivities.length > 0
    ? recentActivities.filter((a: any) => a.status !== '草稿')
    : [...activities].filter(a => a.status !== '草稿').sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  return (
    <AdminLayout>
      <div className="p-6 space-y-6 max-w-5xl">
        <div>
          <h1 className="text-foreground">运营概览</h1>
          <p className="text-muted-foreground text-sm mt-0.5">今日 {new Date().toLocaleDateString('zh-CN')}</p>
        </div>
        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {statCards.map(s => (
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
              {displayActivities.map((a: any) => (
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
                    <div className="text-xs text-muted-foreground">{a.startDate} · {a.enrolled ?? 0} 人报名</div>
                  </div>
                  <StatusBadge status={a.status} />
                </button>
              ))}
            </div>
          </div>
          {/* Pending tasks */}
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h3 className="text-foreground">待处理事项</h3>
            </div>
            {pendingItems.length === 0 ? (
              <div className="px-4 py-8 text-center text-muted-foreground text-sm">暂无待处理事项</div>
            ) : (
              <div className="divide-y divide-border">
                {pendingItems.map((item: any) => {
                  const isPay = item.paymentStatus === '未确认';
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigate({ page: 'admin-activity-detail', activityId: item.activityId })}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                    >
                      <div className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${
                        isPay ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {isPay ? '待收费确认' : '待签到'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-foreground">{item.user?.name || item.user?.nickname || ''}</div>
                        <div className="text-xs text-muted-foreground truncate">{item.activity?.name || ''}</div>
                      </div>
                      <ChevronRight size={14} className="text-muted-foreground shrink-0" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
