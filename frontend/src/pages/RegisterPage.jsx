import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await register({
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background font-body text-on-surface min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Texture */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-secondary/5 blur-[100px]"></div>
      </div>

      {/* Main Content Container */}
      <main className="w-full max-w-[1200px] grid md:grid-cols-2 gap-0 glass-effect rounded-xl overflow-hidden z-10 ambient-glow">
        {/* Left Side: Editorial Branding & Visual */}
        <div className="hidden md:flex flex-col justify-between p-12 bg-surface-container-low relative overflow-hidden">
          <div className="z-10">
            <div className="flex items-center gap-3 mb-16">
              <span className="material-symbols-outlined text-primary text-3xl">shutter_speed</span>
              <span className="font-headline text-2xl font-black tracking-tight text-on-surface">AgroSight</span>
            </div>
            <h1 className="font-headline text-5xl font-extrabold leading-[1.1] mb-6 text-on-surface">
              Cultivating <span className="text-primary italic">Intelligence</span> in every acre.
            </h1>
            <p className="text-on-surface-variant text-lg leading-relaxed max-w-md">
              Join the global network of digital agronomists using editorial-grade data to transform agricultural productivity.
            </p>
          </div>
          <div className="z-10 mt-12 flex items-center gap-4">
            <span className="text-on-surface-variant font-medium tracking-wide">Trusted by 12,000+ Agronomists</span>
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div className="p-8 md:p-16 flex flex-col justify-center bg-surface">
          <header className="mb-10">
            <h2 className="font-headline text-3xl font-bold text-on-surface mb-2">Create Account</h2>
            <p className="text-on-surface-variant font-body">Begin your journey with the digital agronomist.</p>
          </header>

          {error && (
            <div className="mb-6 p-4 bg-error-container/20 border border-error/20 rounded-md text-error text-sm">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-secondary-fixed-dim tracking-wide" htmlFor="full_name">Full Name</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">person</span>
                <input
                  className="w-full pl-12 pr-4 py-3 bg-surface-container-highest rounded-lg border-none text-on-surface placeholder:text-outline/50 focus:ring-2 focus:ring-primary/30 transition-all outline-none"
                  id="full_name"
                  name="full_name"
                  placeholder="Arthur Miller"
                  type="text"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-secondary-fixed-dim tracking-wide" htmlFor="email">Email Address</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">mail</span>
                <input
                  className="w-full pl-12 pr-4 py-3 bg-surface-container-highest rounded-lg border-none text-on-surface placeholder:text-outline/50 focus:ring-2 focus:ring-primary/30 transition-all outline-none"
                  id="email"
                  name="email"
                  placeholder="name@company.com"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Password Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-secondary-fixed-dim tracking-wide" htmlFor="password">Password</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">lock</span>
                  <input
                    className="w-full pl-12 pr-4 py-3 bg-surface-container-highest rounded-lg border-none text-on-surface placeholder:text-outline/50 focus:ring-2 focus:ring-primary/30 transition-all outline-none"
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-secondary-fixed-dim tracking-wide" htmlFor="confirmPassword">Confirm Password</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">shield</span>
                  <input
                    className="w-full pl-12 pr-4 py-3 bg-surface-container-highest rounded-lg border-none text-on-surface placeholder:text-outline/50 focus:ring-2 focus:ring-primary/30 transition-all outline-none"
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="••••••••"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <button
              className="w-full py-4 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold rounded-md hover:scale-[1.02] active:scale-95 transition-all duration-200 shadow-lg shadow-primary/10 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </form>

          <footer className="mt-10 text-center">
            <p className="text-on-surface-variant">
              Already have an account? 
              <Link className="text-primary font-semibold hover:underline ml-1" to="/login">Log in</Link>
            </p>
          </footer>

          {/* Accessibility Footer */}
          <div className="mt-auto pt-10 flex justify-center gap-6 text-[10px] text-outline/40 uppercase tracking-[0.2em]">
            <span>Secure SSL Encryption</span>
            <span>GDPR Compliant</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RegisterPage;
