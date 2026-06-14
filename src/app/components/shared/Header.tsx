import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LogOut, User, Menu, X, LayoutDashboard, KeyRound, PenLine } from 'lucide-react';

export function Header() {
  const { currentUser, navigate, logout, changePassword, changeNickname } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [pwdForm, setPwdForm] = useState({ old: '', new: '', confirm: '' });
  const [pwdMsg, setPwdMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [nicknameInput, setNicknameInput] = useState('');
  const [nicknameMsg, setNicknameMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const handleChangePwd = async () => {
    if (!pwdForm.old || !pwdForm.new || !pwdForm.confirm) {
      setPwdMsg({ ok: false, text: '请填写完整' });
      return;
    }
    if (pwdForm.new !== pwdForm.confirm) {
      setPwdMsg({ ok: false, text: '两次新密码不一致' });
      return;
    }
    if (pwdForm.new.length < 6) {
      setPwdMsg({ ok: false, text: '新密码至少6位' });
      return;
    }
    const result = await changePassword(pwdForm.old, pwdForm.new);
    if (result.success) {
      setPwdMsg({ ok: true, text: '密码修改成功' });
      setTimeout(() => {
        setShowPwdModal(false);
        setPwdForm({ old: '', new: '', confirm: '' });
        setPwdMsg(null);
      }, 1200);
    } else {
      setPwdMsg({ ok: false, text: result.message });
    }
  };
  const handleChangeNickname = async () => {
    if (!nicknameInput.trim()) {
      setNicknameMsg({ ok: false, text: '昵称不能为空' });
      return;
    }
    const result = await changeNickname(nicknameInput.trim());
    if (result.success) {
      setNicknameMsg({ ok: true, text: '昵称修改成功' });
      setTimeout(() => {
        setShowNicknameModal(false);
        setNicknameInput('');
        setNicknameMsg(null);
      }, 1200);
    } else {
      setNicknameMsg({ ok: false, text: result.message });
    }
  };

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
                <button
                  onClick={() => { setShowNicknameModal(true); setNicknameInput(currentUser.nickname || ''); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <PenLine size={15} className="text-muted-foreground" />
                  修改昵称
                </button>
                <button
                  onClick={() => { setShowPwdModal(true); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <KeyRound size={15} className="text-muted-foreground" />
                  修改密码
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
              className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              登录
            </button>
          </div>
        )}
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
      )}

      {/* 修改密码弹框 */}
      {showPwdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => { setShowPwdModal(false); setPwdMsg(null); }} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-foreground mb-4">修改密码</h3>
            <div className="space-y-3">
              <input
                type="password"
                className="w-full px-3 py-2.5 bg-input-background rounded-xl border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="原密码"
                value={pwdForm.old}
                onChange={e => setPwdForm({ ...pwdForm, old: e.target.value })}
              />
              <input
                type="password"
                className="w-full px-3 py-2.5 bg-input-background rounded-xl border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="新密码（至少6位）"
                value={pwdForm.new}
                onChange={e => setPwdForm({ ...pwdForm, new: e.target.value })}
              />
              <input
                type="password"
                className="w-full px-3 py-2.5 bg-input-background rounded-xl border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="确认新密码"
                value={pwdForm.confirm}
                onChange={e => setPwdForm({ ...pwdForm, confirm: e.target.value })}
              />
            </div>
            {pwdMsg && (
              <p className={`mt-3 text-sm ${pwdMsg.ok ? 'text-emerald-600' : 'text-destructive'}`}>{pwdMsg.text}</p>
            )}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setShowPwdModal(false); setPwdForm({ old: '', new: '', confirm: '' }); setPwdMsg(null); }}
                className="flex-1 py-2.5 rounded-xl border border-border text-foreground text-sm hover:bg-muted"
              >
                取消
              </button>
              <button
                onClick={handleChangePwd}
                className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90"
              >
                确认修改
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 修改昵称弹框 */}
      {showNicknameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => { setShowNicknameModal(false); setNicknameMsg(null); }} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-foreground mb-4">修改昵称</h3>
            <input
              className="w-full px-3 py-2.5 bg-input-background rounded-xl border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="请输入新昵称"
              value={nicknameInput}
              onChange={e => setNicknameInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleChangeNickname()}
            />
            {nicknameMsg && (
              <p className={`mt-3 text-sm ${nicknameMsg.ok ? 'text-emerald-600' : 'text-destructive'}`}>{nicknameMsg.text}</p>
            )}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setShowNicknameModal(false); setNicknameInput(''); setNicknameMsg(null); }}
                className="flex-1 py-2.5 rounded-xl border border-border text-foreground text-sm hover:bg-muted"
              >
                取消
              </button>
              <button
                onClick={handleChangeNickname}
                className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90"
              >
                确认修改
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
