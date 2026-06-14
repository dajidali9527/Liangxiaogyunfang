import { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from './AdminLayout';
import { StatusBadge } from '../shared/StatusBadge';
import { Plus, Search, Calendar, MapPin, Users, ChevronRight, X, Edit2, Star, Upload, Link, Trash2 } from 'lucide-react';
import { Activity, ActivityStatus } from '../../data/mock';

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
  description: [],
  imageUrl: '',
  payee: '两小云房',
  tags: [],
  isFeatured: false,
  featuredPosters: [],
  featuredDescription: '',
  images: [],
  videoUrl: '',
};

// 图片输入组件：支持上传和外链
function ImageInput({ value, onChange, label }: {
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      onChange(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };
  return (
    <div>
      <label className="block text-sm text-foreground mb-1.5">{label}</label>
      <div className="flex gap-2">
        <input
          className="flex-1 px-3 py-2.5 bg-input-background rounded-xl border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="输入图片外链URL"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-2.5 bg-secondary text-foreground rounded-xl text-sm hover:bg-muted shrink-0"
        >
          <Upload size={13} /> 上传
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
      {value && (
        <div className="mt-2 w-20 h-20 rounded-xl overflow-hidden border border-border bg-muted">
          <img src={value} alt="预览" className="w-full h-full object-cover" />
        </div>
      )}
    </div>
  );
}

export function AdminActivitiesPage() {
  const { activities, enrollments, navigate, updateActivity, addActivity, deleteActivity } = useApp();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [tagInput, setTagInput] = useState('');
  const [imageInput, setImageInput] = useState('');
  const [posterInput, setPosterInput] = useState('');
  const [formError, setFormError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const galleryFileRef = useRef<HTMLInputElement>(null);
  const posterFileRef = useRef<HTMLInputElement>(null);

  const filtered = activities.filter(a =>
    !search || a.name.includes(search) || a.location.includes(search)
  );

  const openCreate = () => {
    setEditingId(null);
    setForm(INITIAL_FORM);
    setTagInput('');
    setImageInput('');
    setPosterInput('');
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (a: Activity) => {
    setEditingId(a.id);
    setForm({
      name: a.name, status: a.status, startDate: a.startDate, endDate: a.endDate,
      location: a.location, price: a.price, capacity: a.capacity,
      enrollDeadline: a.enrollDeadline, enrollStartDate: a.enrollStartDate,
      description: a.description, imageUrl: a.imageUrl, payee: a.payee, tags: [...a.tags],
      isFeatured: a.isFeatured, featuredPosters: [...a.featuredPosters], featuredDescription: a.featuredDescription,
      images: [...a.images], videoUrl: a.videoUrl,
    });
    setTagInput('');
    setImageInput('');
    setPosterInput('');
    setFormError('');
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.startDate || !form.location) {
      setFormError('请填写必填项：活动名称、开始日期、活动地点');
      return;
    }
    setFormError('');
    if (form.isFeatured && form.status === '报名中') {
      const existingFeatured = activities.find(a =>
        a.isFeatured && a.status === '报名中' && a.id !== editingId
      );
      if (existingFeatured) {
        setFormError('当前已有专题活动，请先取消后再设置新的专题活动。');
        return;
      }
    }
    if (editingId) {
      await updateActivity(editingId, form);
      setShowForm(false);
    } else {
      const result = await addActivity({
        ...form,
        id: `act-${Date.now()}`,
        enrolled: 0,
        createdAt: new Date().toISOString().split('T')[0],
      });
      if (result.success) {
        setShowForm(false);
      } else {
        setFormError(result.message || '创建失败，请重试');
      }
    }
  };

  const handleClose = async (id: string) => {
    if (confirm('确定要关闭此活动？\n\n关闭后：\n· 用户无法继续报名\n· 无法进行签到操作\n· 无法进行收费确认\n\n此操作不可撤销，请确认。')) {
      await updateActivity(id, { status: '已关闭' });
    }
  };
  const handlePublish = async (id: string) => {
    if (confirm('确定要发布此活动？\n\n发布后活动将对用户可见，用户可以开始报名。')) {
      await updateActivity(id, { status: '报名中' });
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

  const addImageByUrl = () => {
    if (imageInput.trim() && !form.images.includes(imageInput.trim())) {
      setForm(p => ({ ...p, images: [...p.images, imageInput.trim()] }));
      setImageInput('');
    }
  };

  const addImageByFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        setForm(p => ({ ...p, images: [...p.images, dataUrl] }));
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const addPosterByUrl = () => {
    if (posterInput.trim() && !form.featuredPosters.includes(posterInput.trim())) {
      setForm(p => ({ ...p, featuredPosters: [...p.featuredPosters, posterInput.trim()] }));
      setPosterInput('');
    }
  };

  const addPosterByFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        setForm(p => ({ ...p, featuredPosters: [...p.featuredPosters, dataUrl] }));
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
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
            return (
              <div key={a.id} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="flex gap-0">
                  <div className="w-24 h-24 shrink-0 bg-muted overflow-hidden">
                    <img src={a.imageUrl || 'https://images.unsplash.com/photo-1441974231-7444f18907db?w=200&h=200&fit=crop'} alt={a.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 p-4 min-w-0">
                    <div className="flex items-start gap-2 justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-foreground text-sm font-medium leading-snug">{a.name}</h4>
                        {a.isFeatured && a.status === '报名中' && (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 text-amber-600 text-xs rounded">
                            <Star size={10} /> 专题
                          </span>
                        )}
                      </div>
                      <StatusBadge status={a.status} />
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground mb-2">
                      <span className="flex items-center gap-1"><Calendar size={11} />{a.startDate}</span>
                      <span className="flex items-center gap-1"><MapPin size={11} />{a.location.split('·')[0].trim()}</span>
                      <span className="flex items-center gap-1"><Users size={11} />{a.enrolled}/{a.capacity} 人</span>
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
                      {a.status === '草稿' && (
                        <>
                          <span className="text-muted-foreground">·</span>
                          <button
                            onClick={() => handlePublish(a.id)}
                            className="text-xs text-primary hover:underline font-medium"
                          >
                            发布
                          </button>
                          <span className="text-muted-foreground">·</span>
                          <button
                            onClick={() => setDeleteConfirm({ id: a.id, name: a.name })}
                            className="flex items-center gap-1 text-xs text-destructive hover:underline"
                          >
                            <Trash2 size={11} /> 删除
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
              {formError && (
                <div className="mb-4 text-sm text-destructive bg-red-50 px-3 py-2 rounded-lg">{formError}</div>
              )}
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
                {/* 专题活动设置 */}
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <label className="text-sm text-foreground font-medium">专题活动</label>
                      <p className="text-xs text-muted-foreground mt-0.5">设为专题活动后将在首页优先展示</p>
                    </div>
                    <button
                      onClick={() => setForm(p => ({ ...p, isFeatured: !p.isFeatured }))}
                      className={`relative w-11 h-6 rounded-full transition-colors ${form.isFeatured ? 'bg-primary' : 'bg-muted'}`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isFeatured ? 'left-5.5' : 'left-0.5'}`} />
                    </button>
                  </div>
                  {form.isFeatured && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-foreground mb-1">专题活动海报</label>
                        <div className="flex gap-2 mb-2 flex-wrap">
                          {form.featuredPosters.map((img, i) => (
                            <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-border bg-muted group">
                              <img src={img} alt={`海报${i + 1}`} className="w-full h-full object-cover" />
                              <button
                                onClick={() => setForm(p => ({ ...p, featuredPosters: p.featuredPosters.filter((_, idx) => idx !== i) }))}
                                className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X size={10} />
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input
                            className="flex-1 px-3 py-2 bg-input-background rounded-xl border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30"
                            value={posterInput}
                            onChange={e => setPosterInput(e.target.value)}
                            placeholder="输入图片URL后按添加"
                            onKeyDown={e => e.key === 'Enter' && addPosterByUrl()}
                          />
                          <button onClick={addPosterByUrl} className="flex items-center gap-1 px-3 py-2 bg-secondary text-foreground rounded-xl text-sm hover:bg-muted shrink-0">
                            <Link size={13} /> 外链
                          </button>
                          <button
                            onClick={() => posterFileRef.current?.click()}
                            className="flex items-center gap-1 px-3 py-2 bg-secondary text-foreground rounded-xl text-sm hover:bg-muted shrink-0"
                          >
                            <Upload size={13} /> 上传
                          </button>
                          <input ref={posterFileRef} type="file" accept="image/*" multiple className="hidden" onChange={addPosterByFile} />
                        </div>
                      </div>
                    </div>
                  )}
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
                <div>
                  <label className="block text-sm text-foreground mb-1.5">人数上限</label>
                  <input type="number" className="w-full px-3 py-2.5 bg-input-background rounded-xl border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30" value={form.capacity} onChange={set('capacity')} />
                </div>
                {/* 封面图 */}
                <ImageInput
                  label="封面图"
                  value={form.imageUrl}
                  onChange={v => setForm(p => ({ ...p, imageUrl: v }))}
                />
                {/* 活动图集 */}
                <div>
                  <label className="block text-sm text-foreground mb-1.5">活动图集</label>
                  <div className="flex gap-2 mb-2 flex-wrap">
                    {form.images.map((img, i) => (
                      <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-border bg-muted group">
                        <img src={img} alt={`图集${i + 1}`} className="w-full h-full object-cover" />
                        <button
                          onClick={() => setForm(p => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }))}
                          className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 px-3 py-2 bg-input-background rounded-xl border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30"
                      value={imageInput}
                      onChange={e => setImageInput(e.target.value)}
                      placeholder="输入图片URL后按添加"
                      onKeyDown={e => e.key === 'Enter' && addImageByUrl()}
                    />
                    <button onClick={addImageByUrl} className="flex items-center gap-1 px-3 py-2 bg-secondary text-foreground rounded-xl text-sm hover:bg-muted shrink-0">
                      <Link size={13} /> 外链
                    </button>
                    <button
                      onClick={() => galleryFileRef.current?.click()}
                      className="flex items-center gap-1 px-3 py-2 bg-secondary text-foreground rounded-xl text-sm hover:bg-muted shrink-0"
                    >
                      <Upload size={13} /> 上传
                    </button>
                    <input ref={galleryFileRef} type="file" accept="image/*" multiple className="hidden" onChange={addImageByFile} />
                  </div>
                </div>
                {/* 视频链接 */}
                <div>
                  <label className="block text-sm text-foreground mb-1.5">视频链接</label>
                  <input
                    className="w-full px-3 py-2.5 bg-input-background rounded-xl border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    value={form.videoUrl}
                    onChange={set('videoUrl')}
                    placeholder="B站/YouTube嵌入链接或外链，留空则不显示"
                  />
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
                  <label className="block text-sm text-foreground mb-1.5">活动介绍（图文混排）</label>
                  <div className="space-y-2">
                    {form.description.map((block, i) => (
                      <div key={i} className="flex gap-2 items-start">
                        {block.type === 'text' ? (
                          <textarea
                            className="flex-1 px-3 py-2.5 bg-input-background rounded-xl border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                            rows={3}
                            value={block.content || ''}
                            onChange={e => {
                              const newDesc = [...form.description];
                              newDesc[i] = { ...newDesc[i], content: e.target.value };
                              setForm(p => ({ ...p, description: newDesc }));
                            }}
                            placeholder="输入文字内容"
                          />
                        ) : (
                          <div className="flex-1 space-y-1.5">
                            <ImageInput
                              value={block.src || ''}
                              onChange={v => {
                                const newDesc = [...form.description];
                                newDesc[i] = { ...newDesc[i], src: v };
                                setForm(p => ({ ...p, description: newDesc }));
                              }}
                              label="图片"
                            />
                            <input
                              className="w-full px-3 py-2 bg-input-background rounded-xl border border-border text-xs outline-none focus:ring-2 focus:ring-primary/30"
                              value={block.caption || ''}
                              onChange={e => {
                                const newDesc = [...form.description];
                                newDesc[i] = { ...newDesc[i], caption: e.target.value };
                                setForm(p => ({ ...p, description: newDesc }));
                              }}
                              placeholder="图片说明（可选）"
                            />
                          </div>
                        )}
                        <button
                          onClick={() => setForm(p => ({ ...p, description: p.description.filter((_, idx) => idx !== i) }))}
                          className="p-1.5 text-muted-foreground hover:text-destructive"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setForm(p => ({ ...p, description: [...p.description, { type: 'text', content: '' }] }))}
                        className="px-3 py-1.5 bg-secondary text-foreground rounded-xl text-xs hover:bg-muted"
                      >
                        + 文字
                      </button>
                      <button
                        onClick={() => setForm(p => ({ ...p, description: [...p.description, { type: 'image', src: '', caption: '' }] }))}
                        className="px-3 py-1.5 bg-secondary text-foreground rounded-xl text-xs hover:bg-muted"
                      >
                        + 图片
                      </button>
                    </div>
                  </div>
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
      {/* 删除确认弹窗 */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-2xl w-full max-w-sm mx-4 p-6 shadow-2xl">
            <h3 className="text-foreground font-medium mb-2">确认删除活动</h3>
            <p className="text-sm text-muted-foreground mb-1">
              确定要删除草稿活动「{deleteConfirm.name}」吗？
            </p>
            <p className="text-sm text-destructive mb-5">此操作不可撤销，删除后数据将无法恢复。</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-border text-foreground text-sm hover:bg-muted transition-colors"
              >
                取消
              </button>
              <button
                onClick={async () => {
                  const result = await deleteActivity(deleteConfirm.id);
                  setDeleteConfirm(null);
                  if (!result.success) {
                    alert(result.message);
                  }
                }}
                className="flex-1 py-2.5 rounded-xl bg-destructive text-white text-sm font-medium hover:bg-destructive/90 transition-colors"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
