interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const STATUS_STYLES: Record<string, string> = {
  '报名中': 'bg-emerald-100 text-emerald-700',
  '已满员': 'bg-amber-100 text-amber-700',
  '已结束': 'bg-gray-100 text-gray-500',
  '已关闭': 'bg-red-100 text-red-600',
  '草稿': 'bg-slate-100 text-slate-500',
  '已签到': 'bg-emerald-100 text-emerald-700',
  '未签到': 'bg-amber-100 text-amber-700',
  '已离场': 'bg-blue-100 text-blue-600',
  '已确认': 'bg-emerald-100 text-emerald-700',
  '未确认': 'bg-amber-100 text-amber-700',
  '已减免': 'bg-blue-100 text-blue-600',
  '已退款': 'bg-purple-100 text-purple-600',
  '已报名': 'bg-sky-100 text-sky-700',
  '已取消': 'bg-gray-100 text-gray-500',
  '已移除': 'bg-red-100 text-red-500',
  '已完成': 'bg-emerald-100 text-emerald-700',
  'active': 'bg-emerald-100 text-emerald-700',
  'disabled': 'bg-red-100 text-red-600',
};

const STATUS_LABELS: Record<string, string> = {
  'active': '正常',
  'disabled': '已禁用',
};

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const style = STATUS_STYLES[status] || 'bg-gray-100 text-gray-500';
  const label = STATUS_LABELS[status] || status;
  const sizeClass = size === 'md' ? 'px-3 py-1 text-sm' : 'px-2 py-0.5 text-xs';
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${style} ${sizeClass}`}>
      {label}
    </span>
  );
}
