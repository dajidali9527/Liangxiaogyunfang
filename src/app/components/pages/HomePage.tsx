import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../shared/StatusBadge';
import { Header } from '../shared/Header';
import { Search, MapPin, Calendar, Users, ChevronRight, Filter } from 'lucide-react';
import { Activity, ActivityStatus } from '../../data/mock';

const STATUS_FILTERS: { label: string; value: ActivityStatus | 'all' }[] = [
  { label: '全部', value: 'all' },
  { label: '报名中', value: '报名中' },
  { label: '已满员', value: '已满员' },
  { label: '已结束', value: '已结束' },
];

function ActivityCard({ activity }: { activity: Activity }) {
  const { navigate } = useApp();
  const isFull = activity.status === '已满员';
  const isEnded = activity.status === '已结束' || activity.status === '已关闭';
  const isDraft = activity.status === '草稿';
  const pct = Math.round((activity.enrolled / activity.capacity) * 100);

  return (
    <div
      className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-md transition-all cursor-pointer group"
      onClick={() => navigate({ page: 'activity-detail', id: activity.id })}
    >
      <div className="relative h-44 overflow-hidden bg-muted">
        <img
          src={activity.imageUrl}
          alt={activity.name}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${isEnded || isDraft ? 'grayscale-[40%]' : ''}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <div className="absolute top-3 left-3">
          <StatusBadge status={activity.status} size="md" />
        </div>
        {activity.tags.length > 0 && (
          <div className="absolute bottom-3 left-3 flex gap-1.5">
            {activity.tags.slice(0, 2).map(tag => (
              <span key={tag} className="px-2 py-0.5 bg-white/20 backdrop-blur-sm text-white text-xs rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-foreground mb-3 leading-snug">{activity.name}</h3>

        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Calendar size={13} className="shrink-0" />
            <span>{activity.startDate}{activity.endDate !== activity.startDate ? ` ~ ${activity.endDate}` : ''}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <MapPin size={13} className="shrink-0" />
            <span className="truncate">{activity.location}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Users size={13} className="shrink-0" />
            <span>{activity.enrolled}/{activity.capacity} 人</span>
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${isFull ? 'bg-amber-400' : 'bg-primary'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-accent font-bold">¥{activity.price}</span>
            <span className="text-muted-foreground text-xs ml-1">/ 人起</span>
          </div>
          <div className="flex items-center gap-1 text-primary text-sm font-medium">
            查看详情 <ChevronRight size={14} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function HomePage() {
  const { activities } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ActivityStatus | 'all'>('all');

  const visible = activities.filter(a => a.status !== '草稿');
  const filtered = visible.filter(a => {
    const matchSearch = !search || a.name.includes(search) || a.location.includes(search);
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-2xl mx-auto px-4 pt-6 pb-24">
        {/* Hero */}
        <div className="mb-6">
          <h1 className="text-foreground mb-1">探索精彩活动</h1>
          <p className="text-muted-foreground text-sm">与孩子一起发现世界，共同成长</p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索活动名称或地点..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-3 bg-card rounded-xl border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
          <Filter size={13} className="text-muted-foreground shrink-0" />
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-sm transition-all ${
                statusFilter === f.value
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-card text-muted-foreground border border-border hover:border-primary/40'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Activity list */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <div className="text-4xl mb-3">🔍</div>
            <p>没有找到相关活动</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(activity => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
