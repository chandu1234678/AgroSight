import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="font-body text-on-surface min-h-screen flex flex-col bg-background">
      {/* Top Navigation Bar */}
      <header className="bg-background flex justify-between items-center w-full px-6 h-16 fixed top-0 z-50">
        <Link to="/" className="text-xl font-bold tracking-tight text-on-surface font-headline">AgroSight</Link>
        <div className="hidden md:flex items-center gap-6">
          <span className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors cursor-pointer">Help</span>
          <span className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors cursor-pointer">Privacy</span>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 pt-16 pb-8 bg-surface-container-low relative overflow-hidden">
        {/* Abstract Organic Background Decorations */}
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[30%] bg-secondary/5 rounded-full blur-[100px]"></div>

        <div className="w-full max-w-[440px] z-10">
          {/* Login Card */}
          <div className="bg-surface-container-highest rounded-xl p-8 md:p-10 shadow-[0_40px_60px_-15px_rgba(0,0,0,0.3)] border-t border-outline-variant/10">
            {/* Brand Anchor */}
            <div className="mb-10 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                <span className="material-symbols-outlined filled text-primary text-3xl">shutter_speed</span>
              </div>
              <h1 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight mb-2">Welcome Back</h1>
              <p className="text-on-surface-variant text-sm leading-relaxed">Enter your credentials to access your editorial intelligence dashboard.</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-error-container/20 border border-error/20 rounded-md text-error text-sm">
                {error}
              </div>
            )}

            {/* Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="block text-[11px] font-semibold uppercase tracking-widest text-secondary-fixed-dim px-1" htmlFor="email">Email Address</label>
                <div className="relative group">
                  <input
                    className="w-full bg-surface-container-lowest border-none rounded-md px-4 py-3.5 text-on-surface placeholder:text-outline/50 focus:ring-2 focus:ring-primary/30 transition-all duration-300 outline-none"
                    id="email"
                    name="email"
                    placeholder="name@company.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="block text-[11px] font-semibold uppercase tracking-widest text-secondary-fixed-dim" htmlFor="password">Password</label>
                  <a className="text-[11px] font-bold text-primary hover:text-primary-fixed-dim transition-colors" href="#">Forgot password?</a>
                </div>
                <div className="relative group">
                  <input
                    className="w-full bg-surface-container-lowest border-none rounded-md px-4 py-3.5 text-on-surface placeholder:text-outline/50 focus:ring-2 focus:ring-primary/30 transition-all duration-300 outline-none"
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors p-1"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold py-4 rounded-md shadow-lg shadow-primary/10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>
              </div>
            </form>

            {/* Divider */}
            <div className="relative my-8 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant/15"></div>
              </div>
              <span className="relative bg-surface-container-highest px-4 text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">New to AgroSight?</span>
            </div>

            <div className="text-center">
              <Link className="inline-flex items-center text-sm font-medium text-on-surface hover:text-primary transition-colors group" to="/register">
                Register here
                <span className="material-symbols-outlined ml-1 text-base group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </Link>
            </div>
          </div>

          {/* Footer Metadata */}
          <footer className="mt-8 text-center space-y-4">
            <div className="flex justify-center gap-4">
              <div className="w-1.5 h-1.5 rounded-full bg-primary/40"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-secondary/40"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-outline-variant/40"></div>
            </div>
            <p className="text-[10px] font-medium text-on-surface-variant/60 tracking-wider">
              © 2024 AGROSIGHT SYSTEMS. EDITORIAL INTELLIGENCE FOR PRECISION AGRICULTURE.
            </p>
          </footer>
        </div>
      </main>

      {/* Contextual Aesthetic Element: Data Visualization Hint */}
      <div className="hidden lg:block fixed right-12 bottom-12 w-64 p-6 glass-effect rounded-xl shadow-2xl z-20">
        <div className="flex items-center gap-3 mb-4">
          <span className="material-symbols-outlined text-primary filled">analytics</span>
          <span className="text-xs font-bold uppercase tracking-widest text-on-surface">Live Network</span>
        </div>
        <div className="space-y-3">
          <div className="h-1.5 w-full bg-surface-container-low rounded-full overflow-hidden">
            <div className="h-full bg-primary w-2/3"></div>
          </div>
          <div className="h-1.5 w-full bg-surface-container-low rounded-full overflow-hidden">
            <div className="h-full bg-secondary w-1/2"></div>
          </div>
          <div className="h-1.5 w-full bg-surface-container-low rounded-full overflow-hidden">
            <div className="h-full bg-primary-fixed-dim w-3/4"></div>
          </div>
        </div>
        <p className="text-[10px] text-on-surface-variant mt-4 leading-relaxed italic">
          "Scanning 4.2M data points across Pacific Northwest regions..."
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
