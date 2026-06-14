import { useApp } from '../../context/AppContext';
import { Header } from '../shared/Header';
import { ArrowLeft, CheckCircle, Calendar, MapPin, Users, Clock, AlertCircle } from 'lucide-react';
import { EnrollData } from '../../context/AppContext';

export function RegisterConfirmPage({ activityId, enrollData }: { activityId: string; enrollData: EnrollData }) {
  const { activities, enroll, navigate } = useApp();
  const activity = activities.find(a => a.id === activityId);
  if (!activity) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-2xl mx-auto px-4 pt-16 text-center text-muted-foreground">活动不存在</div>
      </div>
    );
  }
  const autoPassword = enrollData.contactPhone.slice(-6);
  const handleConfirm = async () => {
    const result = await enroll(activityId, enrollData);
    if (result.success) {
      navigate({ page: 'my-history' });
    }
  };
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-2xl mx-auto px-4 pt-4 pb-24">
        <button
          onClick={() => navigate({ page: 'activity-detail', id: activityId })}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm transition-colors mb-4"
        >
          <ArrowLeft size={14} /> 返回修改
        </button>
        <h1 className="text-foreground mb-5">确认报名信息</h1>
        {/* 活动信息 */}
        <div className="bg-card rounded-2xl p-4 border border-border mb-4">
          <h3 className="text-foreground font-medium mb-3">{activity.name}</h3>
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
        {/* 报名信息 */}
        <div className="bg-card rounded-2xl p-4 border border-border mb-4">
          <h3 className="text-foreground font-medium mb-3">报名信息</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">联系人</span>
              <span className="text-foreground">{enrollData.contactName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">联系电话</span>
              <span className="text-foreground">{enrollData.contactPhone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">成人人数</span>
              <span className="text-foreground">{enrollData.adults} 人</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">儿童人数</span>
              <span className="text-foreground">{enrollData.children} 人</span>
            </div>
            {enrollData.participants.length > 0 && (
              <div>
                <span className="text-muted-foreground">参与者明细</span>
                <div className="mt-2 space-y-1.5">
                  {enrollData.participants.map((p, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs bg-input-background rounded-lg px-2.5 py-1.5">
                      <span className="font-medium text-foreground">{p.name || (idx < enrollData.adults ? `成人${idx + 1}` : `儿童${idx - enrollData.adults + 1}`)}</span>
                      {p.gender && <span className="text-muted-foreground">{p.gender}</span>}
                      {p.age && <span className="text-muted-foreground">{p.age}岁</span>}
                      {p.note && <span className="text-muted-foreground">· {p.note}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {enrollData.note && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">备注</span>
                <span className="text-foreground text-right max-w-[60%]">{enrollData.note}</span>
              </div>
            )}
          </div>
        </div>
        {/* 自动创建账号提示 */}
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 mb-6">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="text-amber-600 mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="text-amber-700 font-medium mb-1">账号信息</p>
              <p className="text-amber-600">报名后将自动创建账号并登录：</p>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between">
                  <span className="text-amber-600">登录账号</span>
                  <span className="text-amber-800 font-medium">{enrollData.contactPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-600">默认密码</span>
                  <span className="text-amber-800 font-medium">{autoPassword}</span>
                </div>
              </div>
              <p className="text-amber-600 text-xs mt-2">请妥善保管您的账号信息，登录后可修改密码</p>
            </div>
          </div>
        </div>
        {/* 操作按钮 */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate({ page: 'activity-detail', id: activityId })}
            className="flex-1 py-3.5 rounded-xl border border-border text-foreground text-sm hover:bg-muted transition-colors"
          >
            返回修改
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-3.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            确认报名
          </button>
        </div>
      </div>
    </div>
  );
}
