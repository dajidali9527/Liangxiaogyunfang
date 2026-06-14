import { useState } from 'react';
import { useApp, Route } from '../../context/AppContext';
import { Header } from '../shared/Header';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

function LoginForm({ redirect }: { redirect?: Route }) {
  const { login, navigate } = useApp();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!phone || !password) { setError('请填写账号和密码'); return; }
    setLoading(true);
    const result = await login(phone, password);
    setLoading(false);
    if (result.success) {
      navigate(redirect || { page: 'home' });
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-foreground mb-1.5">账号/手机号</label>
        <input
          type="text"
          className="w-full px-4 py-3 bg-input-background rounded-xl border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          placeholder="手机号或用户名"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
        />
      </div>
      <div>
        <label className="block text-sm text-foreground mb-1.5">密码</label>
        <div className="relative">
          <input
            type={showPwd ? 'text' : 'password'}
            className="w-full px-4 py-3 bg-input-background rounded-xl border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all pr-10"
            placeholder="请输入密码"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
          <button
            type="button"
            onClick={() => setShowPwd(!showPwd)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {error && <p className="text-destructive text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

      <button
        onClick={handleLogin}
        disabled={loading}
        className="w-full py-3.5 bg-primary text-white rounded-xl font-medium text-sm hover:bg-primary/90 disabled:opacity-60 transition-all"
      >
        {loading ? '登录中...' : '登录'}
      </button>

      <div className="bg-secondary rounded-xl p-3 text-xs text-muted-foreground space-y-1">
        <p className="font-medium text-foreground/70">管理员账号</p>
        <p>用户名：liangxiaoyunfang / 密码：admin123</p>
      </div>
    </div>
  );
}

function RegisterForm() {
  const { register, navigate } = useApp();
  const [form, setForm] = useState({ phone: '', email: '', password: '', confirmPwd: '', nickname: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const handleRegister = async () => {
    setError('');
    if (!form.phone || !form.password) { setError('请填写手机号和密码'); return; }
    if (!/^1[3-9]\d{9}$/.test(form.phone)) { setError('请输入有效的手机号'); return; }
    if (form.password.length < 6) { setError('密码至少6位'); return; }
    if (form.password !== form.confirmPwd) { setError('两次密码不一致'); return; }
    setLoading(true);
    const result = await register({ name: form.nickname || form.phone, phone: form.phone, email: form.email, password: form.password, nickname: form.nickname });
    setLoading(false);
    if (result.success) {
      navigate({ page: 'home' });
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-foreground mb-1.5">手机号 *</label>
        <input
          type="tel"
          className="w-full px-4 py-3 bg-input-background rounded-xl border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          placeholder="请输入11位手机号"
          value={form.phone}
          onChange={set('phone')}
        />
      </div>
      <div>
        <label className="block text-sm text-foreground mb-1.5">昵称（可选）</label>
        <input
          className="w-full px-4 py-3 bg-input-background rounded-xl border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          placeholder="如：小明爸爸"
          value={form.nickname}
          onChange={set('nickname')}
        />
      </div>
      <div>
        <label className="block text-sm text-foreground mb-1.5">邮箱（可选）</label>
        <input
          type="email"
          className="w-full px-4 py-3 bg-input-background rounded-xl border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          placeholder="请输入邮箱"
          value={form.email}
          onChange={set('email')}
        />
      </div>
      <div>
        <label className="block text-sm text-foreground mb-1.5">密码 *</label>
        <div className="relative">
          <input
            type={showPwd ? 'text' : 'password'}
            className="w-full px-4 py-3 bg-input-background rounded-xl border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary pr-10"
            placeholder="至少6位"
            value={form.password}
            onChange={set('password')}
          />
          <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
      <div>
        <label className="block text-sm text-foreground mb-1.5">确认密码 *</label>
        <input
          type="password"
          className="w-full px-4 py-3 bg-input-background rounded-xl border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          placeholder="再次输入密码"
          value={form.confirmPwd}
          onChange={set('confirmPwd')}
        />
      </div>

      {error && <p className="text-destructive text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

      <button
        onClick={handleRegister}
        disabled={loading}
        className="w-full py-3.5 bg-primary text-white rounded-xl font-medium text-sm hover:bg-primary/90 disabled:opacity-60 transition-all"
      >
        {loading ? '注册中...' : '立即注册'}
      </button>
    </div>
  );
}

export function AuthPage({ mode = 'login', redirect }: { mode?: 'login' | 'register'; redirect?: Route }) {
  const { navigate } = useApp();
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-md mx-auto px-4 pt-8 pb-24">
        <button
          onClick={() => navigate({ page: 'home' })}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm transition-colors mb-6"
        >
          <ArrowLeft size={14} /> 返回首页
        </button>
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">登录</h2>
            <LoginForm redirect={redirect} />
          </div>
        </div>
      </div>
    </div>
  );
}
