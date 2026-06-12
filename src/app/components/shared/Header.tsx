import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LogOut, User, Menu, X, LayoutDashboard } from 'lucide-react';

export function Header() {
  const { currentUser, navigate, logout } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-border shadow-sm">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <button
          onClick={() => navigate({ page: 'home' })}
          className="flex items-center gap-2 group"
        >
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-white text-xs font-bold">云</span>
          </div>
          <span className="text-sm font-semibold text-foreground">两小云房</span>
        </button>

        {currentUser ? (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary text-xs font-medium">
                  {currentUser.name.charAt(0)}
                </span>
              </div>
              <span className="text-sm text-foreground hidden sm:block">{currentUser.nickname}</span>
              {menuOpen ? <X size={14} className="text-muted-foreground" /> : <Menu size={14} className="text-muted-foreground" />}
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-10 w-48 bg-white rounded-xl shadow-lg border border-border py-1 z-50">
                {currentUser.role === 'admin' && (
                  <button
                    onClick={() => { navigate({ page: 'admin-dashboard' }); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <LayoutDashboard size={15} className="text-primary" />
                    管理后台
                  </button>
                )}
                <button
                  onClick={() => { navigate({ page: 'my-history' }); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <User size={15} className="text-muted-foreground" />
                  我的报名
                </button>
                <div className="border-t border-border my-1" />
                <button
                  onClick={() => { logout(); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-red-50 transition-colors"
                >
                  <LogOut size={15} />
                  退出登录
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate({ page: 'login' })}
              className="px-3 py-1.5 text-sm text-primary hover:bg-secondary rounded-lg transition-colors"
            >
              登录
            </button>
            <button
              onClick={() => navigate({ page: 'register' })}
              className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              注册
            </button>
          </div>
        )}
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
      )}
    </header>
  );
}
