import { useApp } from '../../context/AppContext';
import { Header } from '../shared/Header';
import { StatusBadge } from '../shared/StatusBadge';
import { ArrowLeft, Calendar, MapPin, Users, Clock, CheckCircle, LogOut, FileText } from 'lucide-react';

export function MyActivityDetailPage({ enrollmentId }: { enrollmentId: string }) {
  const { currentUser, enrollments, activities, navigate } = useApp();
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
          <h3 className="text-foreground font-medium mb-3">报名信息</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">报名状态</span>
              <StatusBadge status={enrollment.status} />
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">报名时间</span>
              <span className="text-foreground">{enrollment.enrolledAt}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">联系人</span>
              <span className="text-foreground">{enrollment.contactName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">联系电话</span>
              <span className="text-foreground">{enrollment.contactPhone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">人数</span>
              <span className="text-foreground">{enrollment.adults}成人 {enrollment.children}儿童</span>
            </div>
            {enrollment.note && (
              <div>
                <span className="text-muted-foreground">备注</span>
                <p className="text-foreground mt-1 text-xs bg-muted rounded-lg px-3 py-2">{enrollment.note}</p>
              </div>
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
