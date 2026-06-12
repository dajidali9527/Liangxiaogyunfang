import { useApp } from '../../context/AppContext';
import { Header } from '../shared/Header';
import { StatusBadge } from '../shared/StatusBadge';
import { ArrowLeft, Calendar, MapPin, Users, CheckCircle, DollarSign, Clock } from 'lucide-react';

export function MyHistoryPage() {
  const { currentUser, enrollments, activities, navigate } = useApp();

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-2xl mx-auto px-4 pt-16 text-center">
          <p className="text-muted-foreground mb-4">请先登录查看报名记录</p>
          <button onClick={() => navigate({ page: 'login', redirect: { page: 'my-history' } })} className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm">
            去登录
          </button>
        </div>
      </div>
    );
  }

  const myEnrollments = enrollments.filter(e => e.userId === currentUser.id);
  const withActivity = myEnrollments.map(e => ({
    enrollment: e,
    activity: activities.find(a => a.id === e.activityId),
  })).filter(x => x.activity);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-2xl mx-auto px-4 pt-4 pb-24">
        <button
          onClick={() => navigate({ page: 'home' })}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm transition-colors mb-4"
        >
          <ArrowLeft size={14} /> 返回首页
        </button>

        <div className="flex items-center justify-between mb-5">
          <h1 className="text-foreground">我的报名记录</h1>
          <span className="text-sm text-muted-foreground">共 {withActivity.length} 条</span>
        </div>

        {withActivity.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <div className="text-4xl mb-3">📋</div>
            <p>暂无报名记录</p>
            <button onClick={() => navigate({ page: 'home' })} className="mt-4 text-primary text-sm hover:underline">
              去浏览活动
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {withActivity.map(({ enrollment: e, activity: a }) => (
              <div
                key={e.id}
                onClick={() => navigate({ page: 'activity-detail', id: a!.id })}
                className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md cursor-pointer transition-all group"
              >
                <div className="flex gap-0">
                  <div className="w-28 h-28 shrink-0 overflow-hidden bg-muted">
                    <img
                      src={a!.imageUrl}
                      alt={a!.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1 p-3 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h4 className="text-foreground leading-snug text-sm line-clamp-2">{a!.name}</h4>
                      <StatusBadge status={e.status} />
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-2">
                      <Calendar size={11} />
                      <span>{a!.startDate}</span>
                      <MapPin size={11} className="ml-1" />
                      <span className="truncate">{a!.location.split('·')[0].trim()}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <CheckCircle size={11} className={e.checkInStatus === '已签到' || e.checkInStatus === '已离场' ? 'text-emerald-500' : 'text-muted-foreground'} />
                        <StatusBadge status={e.checkInStatus} />
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign size={11} className={e.paymentStatus === '已确认' ? 'text-emerald-500' : 'text-muted-foreground'} />
                        <StatusBadge status={e.paymentStatus} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border-t border-border px-4 py-2.5 flex items-center justify-between bg-muted/30">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Users size={11} />{e.adults}大{e.children}小</span>
                    <span className="flex items-center gap-1"><Clock size={11} />报名于 {e.enrolledAt.split(' ')[0]}</span>
                  </div>
                  <span className="text-accent text-xs font-semibold">¥{e.amount}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
