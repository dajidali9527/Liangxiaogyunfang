import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from './AdminLayout';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend,
} from 'recharts';

const COLORS = ['#1a6db5', '#f07c28', '#27a86b', '#9b5de5', '#e03a3a'];
const CHECKIN_LABELS: Record<string, string> = { '未签到': '未签到', '已签到': '已签到', '已离场': '已离场' };
const PAYMENT_LABELS: Record<string, string> = { '未确认': '未确认', '已确认': '已确认', '已减免': '已减免', '已退款': '已退款' };

export function AdminStatsPage() {
  const { activities, fetchStats } = useApp();
  const [statsData, setStatsData] = useState<any>(null);
  useEffect(() => {
    (async () => {
      const data = await fetchStats();
      if (data) setStatsData(data);
    })();
  }, []);
  const kpi = statsData?.kpi;
  const actStats = statsData?.activities || [];
  const checkInDist = statsData?.checkInDist || [];
  const paymentDist = statsData?.paymentDist || [];
  const topUsers = statsData?.topUsers || [];
  // 各活动报名/签到/收费柱状图
  const enrollByActivity = actStats
    .filter((a: any) => a.status !== '草稿')
    .map((a: any) => ({
      name: a.name.length > 10 ? a.name.slice(0, 10) + '…' : a.name,
      报名: a.enrolled || a._count?.enrollments || 0,
      签到: a.checkedIn || 0,
      收费确认: a.paidConfirmed || 0,
    }));
  // 签到饼图
  const checkinData = checkInDist.map((d: any) => ({
    name: CHECKIN_LABELS[d.checkInStatus] || d.checkInStatus,
    value: d._count,
  }));
  // 收费饼图
  const paymentData = paymentDist.map((d: any) => ({
    name: PAYMENT_LABELS[d.paymentStatus] || d.paymentStatus,
    value: d._count,
  })).filter((d: any) => d.value > 0);
  // 报名趋势 - 按月统计
  const enrollments = statsData?.enrollments || [];
  const trend = (() => {
    const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    const year = new Date().getFullYear();
    const counts: Record<string, number> = {};
    months.forEach((m, i) => {
      const key = `${year}-${String(i + 1).padStart(2, '0')}`;
      counts[key] = enrollments.filter((e: any) => e.enrolledAt?.startsWith(key)).length;
    });
    return months.map((m, i) => {
      const key = `${year}-${String(i + 1).padStart(2, '0')}`;
      return { month: m, 报名: counts[key] };
    });
  })();
  return (
    <AdminLayout>
      <div className="p-6 space-y-6 max-w-5xl">
        <h1 className="text-foreground">统计分析</h1>
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: '总报名人数', value: kpi?.totalEnrollments ?? 0, suffix: '人', color: 'text-primary' },
            { label: '已签到率', value: kpi?.checkInRate ?? 0, suffix: '%', color: 'text-emerald-600' },
            { label: '收费确认率', value: kpi?.paymentRate ?? 0, suffix: '%', color: 'text-accent' },
            { label: '已确认金额', value: `¥${kpi?.confirmedAmount ?? 0}`, suffix: '', color: 'text-purple-600' },
          ].map(k => (
            <div key={k.label} className="bg-card rounded-2xl p-4 border border-border shadow-sm">
              <div className={`text-2xl font-bold ${k.color}`}>{k.value}{k.suffix}</div>
              <div className="text-xs text-muted-foreground mt-1">{k.label}</div>
            </div>
          ))}
        </div>
        {/* Enrollment by activity */}
        {enrollByActivity.length > 0 && (
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
        )}
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Check-in pie */}
          {checkinData.length > 0 && (
            <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
              <h3 className="text-foreground mb-4">签到情况分布</h3>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={checkinData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                    {checkinData.map((_: any, i: number) => <Cell key={i} fill={i === 0 ? '#27a86b' : i === 1 ? '#e8f0f8' : '#1a6db5'} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', fontSize: 12 }} />
                  <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          {/* Payment pie */}
          {paymentData.length > 0 && (
            <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
              <h3 className="text-foreground mb-4">收费状态分布</h3>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={paymentData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                    {paymentData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', fontSize: 12 }} />
                  <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        {/* Top users */}
        {topUsers.length > 0 && (
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="text-foreground">活跃用户 TOP 5</h3>
            </div>
            <div className="divide-y divide-border">
              {topUsers.map((t: any, i: number) => (
                <div key={t.userId} className="flex items-center gap-4 px-5 py-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    i === 0 ? 'bg-amber-400 text-white' : i === 1 ? 'bg-gray-300 text-white' : i === 2 ? 'bg-orange-300 text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-foreground text-sm">{t.user?.name || t.user?.nickname || '未知'}</div>
                    <div className="text-muted-foreground text-xs">{t.user?.phone || ''}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-primary text-sm font-medium">{t._count} 次</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
