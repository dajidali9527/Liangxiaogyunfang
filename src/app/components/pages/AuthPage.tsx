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
    if (!phone || !password) { setError('请填写手机号和密码'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 300));
    const result = login(phone, password);
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
        <label className="block text-sm text-foreground mb-1.5">手机号</label>
        <input
          type="tel"
          className="w-full px-4 py-3 bg-input-background rounded-xl border border-border text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          placeholder="请输入手机号"
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
        <p className="font-medium text-foreground/70">测试账号</p>
        <p>管理员：13800000000 / admin123</p>
        <p>普通用户：13811111111 / test123</p>
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
    await new Promise(r => setTimeout(r, 300));
    const result = register({ name: form.nickname || form.phone, phone: form.phone, email: form.email, password: form.password, nickname: form.nickname });
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
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(mode);

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
          {/* Tabs */}
          <div className="flex border-b border-border">
            {(['login', 'register'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'text-primary border-b-2 border-primary -mb-px'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab === 'login' ? '登录' : '注册账号'}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'login' ? <LoginForm redirect={redirect} /> : <RegisterForm />}
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-4">
          {activeTab === 'login' ? (
            <>还没有账号？<button onClick={() => setActiveTab('register')} className="text-primary hover:underline">立即注册</button></>
          ) : (
            <>已有账号？<button onClick={() => setActiveTab('login')} className="text-primary hover:underline">立即登录</button></>
          )}
        </p>
      </div>
    </div>
  );
}
