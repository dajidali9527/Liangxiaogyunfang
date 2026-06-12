import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from './AdminLayout';
import { StatusBadge } from '../shared/StatusBadge';
import { Search, ChevronRight, UserX, UserCheck, Calendar } from 'lucide-react';

export function AdminUsersPage() {
  const { users, enrollments, activities, navigate, updateUser } = useApp();
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return !search || u.name.includes(q) || u.phone.includes(q) || u.email.includes(q) || u.nickname.includes(q);
  });

  const getEnrollCount = (userId: string) =>
    enrollments.filter(e => e.userId === userId && e.status !== '已取消').length;

  const getUserEnrollments = (userId: string) =>
    enrollments.filter(e => e.userId === userId).map(e => ({
      ...e,
      activity: activities.find(a => a.id === e.activityId),
    })).filter(e => e.activity);

  const toggleStatus = (userId: string, current: 'active' | 'disabled') => {
    const msg = current === 'active' ? '确定要禁用此用户？' : '确定要恢复此用户？';
    if (confirm(msg)) {
      updateUser(userId, { status: current === 'active' ? 'disabled' : 'active' });
    }
  };

  const selectedUserData = selectedUser ? users.find(u => u.id === selectedUser) : null;
  const selectedUserEnrollments = selectedUser ? getUserEnrollments(selectedUser) : [];

  return (
    <AdminLayout>
      <div className="p-6 space-y-5 max-w-5xl">
        <div className="flex items-center justify-between">
          <h1 className="text-foreground">用户管理</h1>
          <span className="text-sm text-muted-foreground">{users.filter(u => u.role === 'user').length} 位用户</span>
        </div>

        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="搜索姓名、手机号或邮箱..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-card rounded-xl border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="space-y-2">
          {filtered.map(u => {
            const count = getEnrollCount(u.id);
            return (
              <div key={u.id} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 p-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    u.role === 'admin' ? 'bg-primary' : 'bg-primary/10'
                  }`}>
                    <span className={`font-medium text-sm ${u.role === 'admin' ? 'text-white' : 'text-primary'}`}>
                      {u.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-foreground font-medium text-sm">{u.name}</span>
                      {u.nickname !== u.name && <span className="text-muted-foreground text-xs">({u.nickname})</span>}
                      {u.role === 'admin' && <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-xs rounded">管理员</span>}
                      <StatusBadge status={u.status} />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{u.phone}</span>
                      <span>·</span>
                      <span>{count} 次报名</span>
                      <span>·</span>
                      <span>注册 {u.registeredAt}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => toggleStatus(u.id, u.status)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          u.status === 'active'
                            ? 'text-muted-foreground hover:text-destructive hover:bg-red-50'
                            : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={u.status === 'active' ? '禁用用户' : '恢复用户'}
                      >
                        {u.status === 'active' ? <UserX size={15} /> : <UserCheck size={15} />}
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedUser(selectedUser === u.id ? null : u.id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-secondary transition-colors"
                    >
                      <ChevronRight size={15} className={`transition-transform ${selectedUser === u.id ? 'rotate-90' : ''}`} />
                    </button>
                  </div>
                </div>

                {selectedUser === u.id && (
                  <div className="border-t border-border px-4 py-3 bg-muted/30">
                    <h4 className="text-sm text-foreground mb-2">活动参与记录</h4>
                    {selectedUserEnrollments.length === 0 ? (
                      <p className="text-muted-foreground text-xs">暂无报名记录</p>
                    ) : (
                      <div className="space-y-2">
                        {selectedUserEnrollments.map(e => (
                          <div key={e.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                            <div>
                              <div className="text-sm text-foreground">{e.activity?.name}</div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                <Calendar size={10} />
                                {e.activity?.startDate} · {e.adults}成人 {e.children}儿童
                              </div>
                            </div>
                            <div className="flex gap-1.5 shrink-0">
                              <StatusBadge status={e.status} />
                              <StatusBadge status={e.checkInStatus} />
                              <StatusBadge status={e.paymentStatus} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}
