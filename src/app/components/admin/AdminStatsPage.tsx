import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from './AdminLayout';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend,
} from 'recharts';

const COLORS = ['#1a6db5', '#f07c28', '#27a86b', '#9b5de5', '#e03a3a'];

export function AdminStatsPage() {
  const { activities, fetchStats } = useApp();
  const [statsData, setStatsData] = useState<any>(null);
  useEffect(() => {
    (async () => {
      const data = await fetchStats();
      if (data) setStatsData(data);
    })();
  }, []);
  const enrollments = statsData?.enrollments || [];
  const users = statsData?.users || [];
  // Enrollments per activity
  const enrollByActivity = activities
    .filter(a => a.status !== '草稿')
    .map(a => ({
      name: a.name.length > 10 ? a.name.slice(0, 10) + '…' : a.name,
      报名: enrollments.filter((e: any) => e.activityId === a.id && e.status !== '已取消').length,
      签到: enrollments.filter((e: any) => e.activityId === a.id && (e.checkInStatus === '已签到' || e.checkInStatus === '已离场')).length,
      收费确认: enrollments.filter((e: any) => e.activityId === a.id && (e.paymentStatus === '已确认' || e.paymentStatus === '已减免')).length,
    }));
  // Check-in pie
  const checkinData = [
    { name: '已签到', value: enrollments.filter((e: any) => e.checkInStatus !== '未签到').length },
    { name: '未签到', value: enrollments.filter((e: any) => e.checkInStatus === '未签到' && e.status !== '已取消').length },
  ];
  // Payment pie
  const paymentData = [
    { name: '已确认', value: enrollments.filter((e: any) => e.paymentStatus === '已确认').length },
    { name: '已减免', value: enrollments.filter((e: any) => e.paymentStatus === '已减免').length },
    { name: '未确认', value: enrollments.filter((e: any) => e.paymentStatus === '未确认' && e.status !== '已取消').length },
    { name: '已退款', value: enrollments.filter((e: any) => e.paymentStatus === '已退款').length },
  ].filter(d => d.value > 0);
  // Top users
  const userActivity = users
    .filter((u: any) => u.role === 'user')
    .map((u: any) => ({
      name: u.name,
      nickname: u.nickname,
      count: enrollments.filter((e: any) => e.userId === u.id && e.status !== '已取消').length,
      amount: enrollments.filter((e: any) => e.userId === u.id).reduce((sum: number, e: any) => sum + e.amount, 0),
    }))
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 5);
  // Enrollment trend (simulated monthly)
  const trend = [
    { month: '2月', 报名: 3 },
    { month: '3月', 报名: 5 },
    { month: '4月', 报名: 8 },
    { month: '5月', 报名: 12 },
    { month: '6月', 报名: enrollments.filter((e: any) => e.enrolledAt?.startsWith('2026-06')).length },
  ];
  const totalRevenue = enrollments.filter((e: any) => e.paymentStatus === '已确认').reduce((s: number, e: any) => s + e.amount, 0);
  const checkinRate = enrollments.length > 0
    ? Math.round((enrollments.filter((e: any) => e.checkInStatus !== '未签到').length / enrollments.length) * 100)
    : 0;
  const confirmRate = enrollments.length > 0
    ? Math.round((enrollments.filter((e: any) => e.paymentStatus === '已确认' || e.paymentStatus === '已减免').length / enrollments.length) * 100)
    : 0;
  return (
    <AdminLayout>
      <div className="p-6 space-y-6 max-w-5xl">
        <h1 className="text-foreground">统计分析</h1>
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: '总报名人数', value: enrollments.filter((e: any) => e.status !== '已取消').length, suffix: '人', color: 'text-primary' },
            { label: '已签到率', value: checkinRate, suffix: '%', color: 'text-emerald-600' },
            { label: '收费确认率', value: confirmRate, suffix: '%', color: 'text-accent' },
            { label: '已确认金额', value: `¥${totalRevenue}`, suffix: '', color: 'text-purple-600' },
          ].map(k => (
            <div key={k.label} className="bg-card rounded-2xl p-4 border border-border shadow-sm">
              <div className={`text-2xl font-bold ${k.color}`}>{k.value}{k.suffix}</div>
              <div className="text-xs text-muted-foreground mt-1">{k.label}</div>
            </div>
          ))}
        </div>
        {/* Enrollment by activity */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
          <h3 className="text-foreground mb-4">各活动报名与签到情况</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={enrollByActivity} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6580a0' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6580a0' }} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', fontSize: 12 }} />
              <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="报名" fill="#1a6db5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="签到" fill="#27a86b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="收费确认" fill="#f07c28" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Check-in pie */}
          <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
            <h3 className="text-foreground mb-4">签到情况分布</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={checkinData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                  {checkinData.map((_, i) => <Cell key={i} fill={i === 0 ? '#27a86b' : '#e8f0f8'} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', fontSize: 12 }} />
                <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Payment pie */}
          <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
            <h3 className="text-foreground mb-4">收费状态分布</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={paymentData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                  {paymentData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', fontSize: 12 }} />
                <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Trend */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
          <h3 className="text-foreground mb-4">报名趋势（2026年）</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={trend} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6580a0' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6580a0' }} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', fontSize: 12 }} />
              <Line type="monotone" dataKey="报名" stroke="#1a6db5" strokeWidth={2.5} dot={{ fill: '#1a6db5', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {/* Top users */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-foreground">活跃用户 TOP 5</h3>
          </div>
          <div className="divide-y divide-border">
            {userActivity.map((u: any, i: number) => (
              <div key={u.name} className="flex items-center gap-4 px-5 py-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  i === 0 ? 'bg-amber-400 text-white' : i === 1 ? 'bg-gray-300 text-white' : i === 2 ? 'bg-orange-300 text-white' : 'bg-muted text-muted-foreground'
                }`}>
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="text-foreground text-sm">{u.name}</div>
                  <div className="text-muted-foreground text-xs">{u.nickname}</div>
                </div>
                <div className="text-right">
                  <div className="text-primary text-sm font-medium">{u.count} 次</div>
                  <div className="text-muted-foreground text-xs">¥{u.amount}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
