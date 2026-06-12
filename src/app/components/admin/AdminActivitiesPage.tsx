import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from './AdminLayout';
import { StatusBadge } from '../shared/StatusBadge';
import { Plus, Search, Calendar, MapPin, Users, ChevronRight, X, Edit2 } from 'lucide-react';
import { Activity, ActivityStatus, ACTIVITIES } from '../../data/mock';

type FormData = Omit<Activity, 'id' | 'enrolled' | 'createdAt'>;

const INITIAL_FORM: FormData = {
  name: '',
  status: '草稿',
  startDate: '',
  endDate: '',
  location: '',
  price: 0,
  capacity: 20,
  enrollDeadline: '',
  enrollStartDate: '',
  description: '',
  imageUrl: '',
  payee: '两小云房',
  tags: [],
};

export function AdminActivitiesPage() {
  const { activities, enrollments, navigate, updateActivity, addActivity } = useApp();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [tagInput, setTagInput] = useState('');

  const filtered = activities.filter(a =>
    !search || a.name.includes(search) || a.location.includes(search)
  );

  const getEnrollCount = (id: string) =>
    enrollments.filter(e => e.activityId === id && e.status !== '已取消' && e.status !== '已移除').length;

  const openCreate = () => {
    setEditingId(null);
    setForm(INITIAL_FORM);
    setTagInput('');
    setShowForm(true);
  };

  const openEdit = (a: Activity) => {
    setEditingId(a.id);
    setForm({
      name: a.name, status: a.status, startDate: a.startDate, endDate: a.endDate,
      location: a.location, price: a.price, capacity: a.capacity,
      enrollDeadline: a.enrollDeadline, enrollStartDate: a.enrollStartDate,
      description: a.description, imageUrl: a.imageUrl, payee: a.payee, tags: [...a.tags],
    });
    setTagInput('');
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name || !form.startDate || !form.location) return;
    if (editingId) {
      updateActivity(editingId, form);
    } else {
      addActivity({
        ...form,
        id: `act-${Date.now()}`,
        enrolled: 0,
        createdAt: new Date().toISOString().split('T')[0],
      });
    }
    setShowForm(false);
  };

  const handleClose = (id: string) => {
    if (confirm('确定要关闭此活动？关闭后用户将无法继续报名。')) {
      updateActivity(id, { status: '已关闭' });
    }
  };

  const set = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: k === 'price' || k === 'capacity' ? Number(e.target.value) : e.target.value }));

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm(p => ({ ...p, tags: [...p.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  const STATUS_OPTIONS: ActivityStatus[] = ['草稿', '报名中', '已满员', '已关闭', '已结束'];

  return (
    <AdminLayout>
      <div className="p-6 space-y-5 max-w-5xl">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-foreground">活动管理</h1>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus size={16} /> 新建活动
          </button>
        </div>

        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索活动名称或地点..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-card rounded-xl border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="space-y-3">
          {filtered.map(a => {
            const count = getEnrollCount(a.id);
            return (
              <div key={a.id} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="flex gap-0">
                  <div className="w-24 h-24 shrink-0 bg-muted overflow-hidden">
                    <img src={a.imageUrl || 'https://images.unsplash.com/photo-1441974231-7444f18907db?w=200&h=200&fit=crop'} alt={a.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 p-4 min-w-0">
                    <div className="flex items-start gap-2 justify-between mb-1">
                      <h4 className="text-foreground text-sm font-medium leading-snug">{a.name}</h4>
                      <StatusBadge status={a.status} />
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground mb-2">
                      <span className="flex items-center gap-1"><Calendar size={11} />{a.startDate}</span>
                      <span className="flex items-center gap-1"><MapPin size={11} />{a.location.split('·')[0].trim()}</span>
                      <span className="flex items-center gap-1"><Users size={11} />{count}/{a.capacity} 人</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate({ page: 'admin-activity-detail', activityId: a.id })}
                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        报名列表 <ChevronRight size={11} />
                      </button>
                      <span className="text-muted-foreground">·</span>
                      <button
                        onClick={() => openEdit(a)}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <Edit2 size={11} /> 编辑
                      </button>
                      {(a.status === '报名中' || a.status === '已满员') && (
                        <>
                          <span className="text-muted-foreground">·</span>
                          <button
                            onClick={() => handleClose(a.id)}
                            className="text-xs text-destructive hover:underline"
                          >
                            关闭活动
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create/Edit form drawer */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-foreground">{editingId ? '编辑活动' : '新建活动'}</h2>
                <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-foreground mb-1.5">活动名称 *</label>
                  <input className="w-full px-3 py-2.5 bg-input-background rounded-xl border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30" value={form.name} onChange={set('name')} placeholder="请输入活动名称" />
                </div>

                <div>
                  <label className="block text-sm text-foreground mb-1.5">活动状态</label>
                  <select className="w-full px-3 py-2.5 bg-input-background rounded-xl border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30" value={form.status} onChange={set('status')}>
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-foreground mb-1.5">开始日期 *</label>
                    <input type="date" className="w-full px-3 py-2.5 bg-input-background rounded-xl border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30" value={form.startDate} onChange={set('startDate')} />
                  </div>
                  <div>
                    <label className="block text-sm text-foreground mb-1.5">结束日期</label>
                    <input type="date" className="w-full px-3 py-2.5 bg-input-background rounded-xl border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30" value={form.endDate} onChange={set('endDate')} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-foreground mb-1.5">活动地点 *</label>
                  <input className="w-full px-3 py-2.5 bg-input-background rounded-xl border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30" value={form.location} onChange={set('location')} placeholder="请输入活动地点" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-foreground mb-1.5">报名开始</label>
                    <input type="date" className="w-full px-3 py-2.5 bg-input-background rounded-xl border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30" value={form.enrollStartDate} onChange={set('enrollStartDate')} />
                  </div>
                  <div>
                    <label className="block text-sm text-foreground mb-1.5">报名截止</label>
                    <input type="date" className="w-full px-3 py-2.5 bg-input-background rounded-xl border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30" value={form.enrollDeadline} onChange={set('enrollDeadline')} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-foreground mb-1.5">人均价格（元）</label>
                    <input type="number" className="w-full px-3 py-2.5 bg-input-background rounded-xl border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30" value={form.price} onChange={set('price')} />
                  </div>
                  <div>
                    <label className="block text-sm text-foreground mb-1.5">人数上限</label>
                    <input type="number" className="w-full px-3 py-2.5 bg-input-background rounded-xl border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30" value={form.capacity} onChange={set('capacity')} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-foreground mb-1.5">封面图URL</label>
                  <input className="w-full px-3 py-2.5 bg-input-background rounded-xl border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30" value={form.imageUrl} onChange={set('imageUrl')} placeholder="https://..." />
                </div>

                <div>
                  <label className="block text-sm text-foreground mb-1.5">收款方</label>
                  <input className="w-full px-3 py-2.5 bg-input-background rounded-xl border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30" value={form.payee} onChange={set('payee')} />
                </div>

                <div>
                  <label className="block text-sm text-foreground mb-1.5">标签</label>
                  <div className="flex gap-2 mb-2 flex-wrap">
                    {form.tags.map(t => (
                      <span key={t} className="flex items-center gap-1 px-2 py-0.5 bg-secondary rounded-full text-xs">
                        {t}
                        <button onClick={() => setForm(p => ({ ...p, tags: p.tags.filter(x => x !== t) }))} className="text-muted-foreground hover:text-foreground">
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 px-3 py-2 bg-input-background rounded-xl border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30"
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      placeholder="输入标签后按添加"
                      onKeyDown={e => e.key === 'Enter' && addTag()}
                    />
                    <button onClick={addTag} className="px-3 py-2 bg-secondary text-foreground rounded-xl text-sm hover:bg-muted">添加</button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-foreground mb-1.5">活动介绍</label>
                  <textarea
                    className="w-full px-3 py-2.5 bg-input-background rounded-xl border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                    rows={4}
                    value={form.description}
                    onChange={set('description')}
                    placeholder="请输入活动介绍"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl border border-border text-foreground text-sm hover:bg-muted transition-colors">
                    取消
                  </button>
                  <button onClick={handleSave} className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
                    {editingId ? '保存修改' : '创建活动'}
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
