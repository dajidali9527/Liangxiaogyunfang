import { ReactNode } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { HomePage } from './components/pages/HomePage';
import { ActivityDetailPage } from './components/pages/ActivityDetailPage';
import { AuthPage } from './components/pages/AuthPage';
import { MyHistoryPage } from './components/pages/MyHistoryPage';
import { RegisterConfirmPage } from './components/pages/RegisterConfirmPage';
import { MyActivityDetailPage } from './components/pages/MyActivityDetailPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminActivitiesPage } from './components/admin/AdminActivitiesPage';
import { AdminRosterPage } from './components/admin/AdminRosterPage';
import { AdminUsersPage } from './components/admin/AdminUsersPage';
import { AdminStatsPage } from './components/admin/AdminStatsPage';
import { AdminLayout } from './components/admin/AdminLayout';
import { Lock } from 'lucide-react';

function Router() {
  const { route, currentUser } = useApp();

  const AdminGuard = ({ children }: { children: ReactNode }) => {
    if (!currentUser || currentUser.role !== 'admin') {
      return (
        <AdminLayout>
          <div className="flex flex-col items-center justify-center h-full py-24 text-center px-4">
            <Lock size={40} className="text-muted-foreground mb-4" />
            <h2 className="text-foreground mb-2">需要管理员权限</h2>
            <p className="text-muted-foreground text-sm">请使用管理员账号登录</p>
          </div>
        </AdminLayout>
      );
    }
    return <>{children}</>;
  };

  switch (route.page) {
    case 'home':
      return <HomePage />;
    case 'activity-detail':
      return <ActivityDetailPage activityId={route.id} />;
    case 'login':
      return <AuthPage mode="login" redirect={route.redirect} />;
    case 'register':
      return <AuthPage mode="register" />;
    case 'my-history':
      return <MyHistoryPage />;
    case 'my-activity-detail':
      return <MyActivityDetailPage enrollmentId={route.enrollmentId} />;
    case 'register-confirm':
      return <RegisterConfirmPage activityId={route.activityId} enrollData={route.enrollData} />;
    case 'admin-dashboard':
      return <AdminGuard><AdminDashboard /></AdminGuard>;
    case 'admin-activities':
      return <AdminGuard><AdminActivitiesPage /></AdminGuard>;
    case 'admin-activity-detail':
      return <AdminGuard><AdminRosterPage activityId={route.activityId} /></AdminGuard>;
    case 'admin-users':
      return <AdminGuard><AdminUsersPage /></AdminGuard>;
    case 'admin-stats':
      return <AdminGuard><AdminStatsPage /></AdminGuard>;
    default:
      return <HomePage />;
  }
}

export default function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  );
}
