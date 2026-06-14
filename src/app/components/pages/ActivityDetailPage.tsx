import { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../shared/StatusBadge';
import { Header } from '../shared/Header';
import { ArrowLeft, MapPin, Calendar, Users, Clock, CheckCircle, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { EnrollData, Participant } from '../../context/AppContext';

export function ActivityDetailPage({ activityId }: { activityId: string }) {
  const { activities, enrollments, currentUser, navigate, enroll } = useApp();
  const activity = activities.find(a => a.id === activityId);
  const [enrolling, setEnrolling] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [enrollForm, setEnrollForm] = useState<EnrollData>({
    adults: 0,
    children: 0,
    contactName: '',
    contactPhone: '',
    note: '',
    participants: [],
  });
  const [enrollResult, setEnrollResult] = useState<{ success: boolean; message: string; autoCreated?: boolean; password?: string } | null>(null);
  const [currentImage, setCurrentImage] = useState(0);
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
    setEnrollForm(p => {
      const ps = [...p.participants];
      ps[idx] = { ...ps[idx], [field]: value };
      return { ...p, participants: ps };
    });
  };
  const mapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!mapRef.current || !activity) return;
    const AMap = (window as any).AMap;
    if (!AMap) return;
    const map = new AMap.Map(mapRef.current, {
      zoom: 16,
      center: [119.074442, 26.772955],
      resizeEnable: true,
    });
    return () => { map.destroy(); };
  }, [activity]);

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

  // 图片轮播
  const allImages = activity.images.length > 0 ? activity.images : activity.featuredPosters;
  const prevImage = () => setCurrentImage(i => (i > 0 ? i - 1 : allImages.length - 1));
  const nextImage = () => setCurrentImage(i => (i < allImages.length - 1 ? i + 1 : 0));

  // 匿名报名：点击立即报名直接打开报名表单，不再强制登录
  const handleEnrollClick = () => {
    if (canEnroll) setEnrolling(true);
  };

  const handleEnroll = async () => {
    const result = await enroll(activityId, enrollForm);
    setEnrollResult(result);
    if (result.success) setEnrolling(false);
  };

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

        {/* Hero image / 海报轮播 */}
        <div className="relative h-56 mt-3 overflow-hidden bg-muted">
          <img src={allImages[currentImage]} alt={activity.name} className="w-full h-full object-cover transition-all duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          {allImages.length > 1 && (
            <>
              <button onClick={prevImage} className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors">
                <ChevronLeft size={16} />
              </button>
              <button onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors">
                <ChevronRight size={16} />
              </button>
              <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex gap-1.5">
                {allImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImage(i)}
                    className={`w-2 h-2 rounded-full transition-all ${i === currentImage ? 'bg-white w-5' : 'bg-white/50'}`}
                  />
                ))}
              </div>
            </>
          )}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-2 mb-2">
              {activity.isFeatured && <span className="px-2 py-0.5 bg-primary text-white text-xs rounded-full font-medium">专题活动</span>}
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
            <div>
              <div className="flex items-start gap-3 mb-2">
                <MapPin size={16} className="text-primary mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5">活动地点</div>
                  <div className="text-sm text-foreground">{activity.location}</div>
                </div>
              </div>
              <div ref={mapRef} className="w-full h-40 rounded-xl overflow-hidden border border-border" />
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
          </div>

          {/* Description */}
          <div className="bg-card rounded-2xl p-4 border border-border">
            <h3 className="text-foreground mb-3">活动介绍</h3>
            <div className="space-y-4">
              {activity.description.map((block, i) => {
                if (block.type === 'image' && block.src) {
                  return (
                    <div key={i}>
                      <img
                        src={block.src}
                        alt={block.caption || ''}
                        className="w-full rounded-xl"
                      />
                      {block.caption && (
                        <p className="text-xs text-muted-foreground text-center mt-1.5">{block.caption}</p>
                      )}
                    </div>
                  );
                }
                const lines = (block.content || '').split('\n');
                return (
                  <div key={i} className="text-sm text-foreground/80 leading-relaxed space-y-1.5">
                    {lines.map((line, j) => (
                      <p key={j} className={line.startsWith('•') ? 'pl-2' : ''}>
                        {line || '\u00A0'}
                      </p>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 视频介绍 */}
          {activity.videoUrl && (
            <div className="bg-card rounded-2xl p-4 border border-border">
              <h3 className="text-foreground mb-2">视频介绍</h3>
              {activity.videoUrl.includes('bilibili') || activity.videoUrl.includes('youtube') || activity.videoUrl.includes('v.qq') ? (
                <iframe src={activity.videoUrl} className="w-full aspect-video rounded-xl" allowFullScreen title="活动视频" />
              ) : (
                <a
                  href={activity.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary text-sm hover:underline"
                >
                  <Play size={14} /> 查看活动视频
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border px-4 py-3 z-30">
        <div className="max-w-2xl mx-auto">
          {enrollResult?.success && (
            <div className="bg-emerald-50 rounded-xl px-4 py-3 mb-3 text-sm">
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle size={16} />
                {enrollResult.message}
                <button className="ml-auto text-primary underline" onClick={() => navigate({ page: 'my-history' })}>
                  查看报名
                </button>
              </div>
              {enrollResult.autoCreated && enrollResult.password && (
                <div className="mt-2 text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                  已为您自动创建账号并登录，手机号：{enrollForm.contactPhone}，默认密码：{enrollResult.password}，请妥善保管！
                </div>
              )}
            </div>
          )}
          {!enrollResult?.success && myEnrollment && (
            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 rounded-xl px-4 py-3 mb-3 text-sm">
              <CheckCircle size={16} />
              您已报名此活动
              <button className="ml-auto text-primary underline" onClick={() => navigate({ page: 'my-activity-detail', enrollmentId: myEnrollment.id })}>
                查看详情
              </button>
            </div>
          )}
          {!enrollResult?.success && !myEnrollment && (
            <button
              onClick={handleEnrollClick}
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

      {/* Enroll dialog - 匿名报名，不强制登录 */}
      {enrolling && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEnrolling(false)} />
          <div className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <h2 className="text-foreground mb-1">确认报名</h2>
              <p className="text-muted-foreground text-sm mb-5">{activity.name}</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-foreground mb-1.5">联系手机 *</label>
                  <input
                    className="w-full px-3 py-2.5 bg-input-background rounded-xl border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    value={enrollForm.contactPhone}
                    onChange={e => setEnrollForm(p => ({ ...p, contactPhone: e.target.value }))}
                    placeholder="请输入手机号"
                  />
                  {!currentUser && (
                    <p className="text-xs text-muted-foreground mt-1">报名后将自动创建账号并登录，密码为手机号后6位</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-foreground mb-1.5">联系人昵称</label>
                  <input
                    className="w-full px-3 py-2.5 bg-input-background rounded-xl border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    value={enrollForm.contactName}
                    onChange={e => setEnrollForm(p => ({ ...p, contactName: e.target.value }))}
                    placeholder="请输入联系人昵称"
                  />
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-sm text-foreground mb-1.5">成人人数</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const newAdults = Math.max(0, enrollForm.adults - 1);
                          const ps = [...enrollForm.participants];
                          if (ps.length > newAdults + enrollForm.children) ps.splice(newAdults, 1);
                          setEnrollForm(p => ({ ...p, adults: newAdults, participants: rebuildParticipants(newAdults, p.children, ps) }));
                        }}
                        className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-foreground hover:bg-muted"
                      >-</button>
                      <span className="text-foreground font-medium w-6 text-center">{enrollForm.adults}</span>
                      <button
                        onClick={() => {
                          const newAdults = enrollForm.adults + 1;
                          setEnrollForm(p => ({ ...p, adults: newAdults, participants: rebuildParticipants(newAdults, p.children, p.participants) }));
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
                          const newChildren = Math.max(0, enrollForm.children - 1);
                          const ps = [...enrollForm.participants];
                          if (ps.length > enrollForm.adults + newChildren) ps.splice(enrollForm.adults + newChildren, 1);
                          setEnrollForm(p => ({ ...p, children: newChildren, participants: rebuildParticipants(p.adults, newChildren, ps) }));
                        }}
                        className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-foreground hover:bg-muted"
                      >-</button>
                      <span className="text-foreground font-medium w-6 text-center">{enrollForm.children}</span>
                      <button
                        onClick={() => {
                          const newChildren = enrollForm.children + 1;
                          setEnrollForm(p => ({ ...p, children: newChildren, participants: rebuildParticipants(p.adults, newChildren, p.participants) }));
                        }}
                        className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-foreground hover:bg-muted"
                      >+</button>
                    </div>
                  </div>
                </div>
                {enrollForm.participants.length > 0 && (
                  <div className="space-y-3">
                    {enrollForm.participants.map((p, idx) => (
                      <div key={idx} className="bg-input-background rounded-xl p-3 border border-border">
                        <div className="text-xs font-medium text-muted-foreground mb-2">{p.name || (idx < enrollForm.adults ? `成人${idx + 1}` : `儿童${idx - enrollForm.adults + 1}`)}</div>
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
                    className="w-full px-3 py-2.5 bg-input-background rounded-xl border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                    rows={4}
                    value={enrollForm.note}
                    onChange={e => setEnrollForm(p => ({ ...p, note: e.target.value }))}
                    placeholder="特殊需求、过敏信息等"
                  />
                </div>
                {enrollResult && !enrollResult.success && (
                  <p className="text-destructive text-sm bg-red-50 px-3 py-2 rounded-lg">{enrollResult.message}</p>
                )}
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={e => setAgreed(e.target.checked)}
                    className="mt-1 accent-primary"
                  />
                  <span className="text-sm text-muted-foreground">
                    我已阅读并同意
                    <button
                      type="button"
                      onClick={() => setShowPrivacy(true)}
                      className="text-primary underline hover:text-primary/80"
                    >
                      个人信息使用说明
                    </button>
                  </span>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setEnrolling(false)}
                    className="flex-1 py-3 rounded-xl border border-border text-foreground text-sm hover:bg-muted transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleEnroll}
                    disabled={!enrollForm.contactPhone || !agreed || (enrollForm.adults + enrollForm.children === 0)}
                    className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${
                      enrollForm.contactPhone && agreed && (enrollForm.adults + enrollForm.children > 0)
                        ? 'bg-primary text-white hover:bg-primary/90'
                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                    }`}
                  >
                    确认报名
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 个人信息使用说明弹窗 */}
      {showPrivacy && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowPrivacy(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-sm mx-4 p-6 shadow-2xl">
            <h3 className="text-foreground font-semibold mb-3">个人信息使用说明</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              本次报名仅收集昵称（可选）、手机号、邮箱（可选），仅用于活动通知与签到，不会向任何第三方共享。
            </p>
            <button
              onClick={() => setShowPrivacy(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              我知道了
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
