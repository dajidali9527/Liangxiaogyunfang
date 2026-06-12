import { ReactNode, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Route } from '../../context/AppContext';
import {
  LayoutDashboard, Calendar, Users, BarChart3, Menu, X, ChevronRight, LogOut, Home,
} from 'lucide-react';

interface NavItem {
  label: string;
  icon: ReactNode;
  route: Route;
}

const NAV_ITEMS: NavItem[] = [
  { label: '概览', icon: <LayoutDashboard size={18} />, route: { page: 'admin-dashboard' } },
  { label: '活动管理', icon: <Calendar size={18} />, route: { page: 'admin-activities' } },
  { label: '用户管理', icon: <Users size={18} />, route: { page: 'admin-users' } },
  { label: '统计分析', icon: <BarChart3 size={18} />, route: { page: 'admin-stats' } },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const { navigate, route, currentUser, logout } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentPage = route.page;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-white font-bold">云</span>
          </div>
          <div>
            <div className="text-sidebar-foreground font-semibold text-sm">两小云房</div>
            <div className="text-sidebar-foreground/50 text-xs">管理后台</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map(item => {
          const active = currentPage === item.route.page;
          return (
            <button
              key={item.route.page}
              onClick={() => { navigate(item.route); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                active
                  ? 'bg-sidebar-primary text-white shadow-sm'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {active && <ChevronRight size={14} className="ml-auto" />}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border space-y-1">
        <button
          onClick={() => navigate({ page: 'home' })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          <Home size={18} />
          <span>返回前台</span>
        </button>
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="w-7 h-7 rounded-full bg-sidebar-primary/30 flex items-center justify-center">
            <span className="text-xs text-sidebar-foreground">{currentUser?.name.charAt(0)}</span>
          </div>
          <span className="flex-1 text-xs text-sidebar-foreground/70">{currentUser?.name}</span>
          <button onClick={logout} className="text-sidebar-foreground/50 hover:text-red-400 transition-colors">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 bg-sidebar shrink-0 fixed left-0 top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed left-0 top-0 h-screen w-56 bg-sidebar z-50 lg:hidden">
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-56 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-border px-4 h-14 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="text-foreground">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white text-xs font-bold">云</span>
            </div>
            <span className="font-semibold text-foreground text-sm">两小云房后台</span>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
