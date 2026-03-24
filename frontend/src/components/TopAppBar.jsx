import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

const TopAppBar = ({ title = 'Field Overview', showSearch = true, showBack = true }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';
  const [profileOpen, setProfileOpen] = useState(false);
  const popupRef = useRef(null);

  // Close popup on outside click
  useEffect(() => {
    const handler = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [profileOpen]);

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-outline-variant/10 font-headline antialiased flex justify-between items-center w-full px-4 md:px-6 h-14">
      {/* Left side */}
      <div className="flex items-center gap-1">
        {showBack && !isDashboard && (
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-variant rounded-full transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>
        )}
        <Link
          to="/dashboard"
          className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-variant rounded-full transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-xl">home</span>
        </Link>
        <div className="md:hidden ml-1">
          <span className="text-base font-bold tracking-tight text-on-surface">AgroSight</span>
        </div>
        <div className="hidden md:block ml-1">
          <h2 className="text-base font-bold text-on-surface">{title}</h2>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-1">
        {showSearch && (
          <div className="relative hidden lg:block">
            <input
              className="bg-surface-container-highest rounded-full px-4 py-1.5 text-sm w-52 focus:ring-2 focus:ring-primary/30 placeholder:text-on-surface-variant/50 outline-none border-none"
              placeholder="Search insights..."
              type="text"
            />
            <span className="material-symbols-outlined absolute right-3 top-1.5 text-on-surface-variant text-sm">search</span>
          </div>
        )}

        <button className="p-2 text-on-surface-variant hover:bg-surface-variant rounded-full transition-colors active:scale-95">
          <span className="material-symbols-outlined text-xl">notifications</span>
        </button>

        {/* Profile button + popup */}
        <div className="relative ml-1" ref={popupRef}>
          <button
            onClick={() => setProfileOpen(v => !v)}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all active:scale-95 ring-2 ${
              profileOpen ? 'ring-primary' : 'ring-transparent hover:ring-primary/40'
            } ${user?.name ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant'}`}
          >
            {user?.name ? initials : <span className="material-symbols-outlined text-base">person</span>}
          </button>

          {/* Popup */}
          {profileOpen && (
            <div className="absolute right-0 top-10 w-64 bg-surface-container-low border border-outline-variant/20 rounded-2xl shadow-2xl shadow-black/30 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* User info */}
              <div className="px-4 py-4 border-b border-outline-variant/10 bg-surface-container">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-sm shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-on-surface text-sm truncate">{user?.name || 'User'}</p>
                    <p className="text-xs text-on-surface-variant truncate">{user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Menu items */}
              <div className="py-1.5">
                <Link
                  to="/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-highest transition-colors"
                >
                  <span className="material-symbols-outlined text-base text-on-surface-variant">manage_accounts</span>
                  Edit Profile
                </Link>
                <Link
                  to="/history"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-highest transition-colors"
                >
                  <span className="material-symbols-outlined text-base text-on-surface-variant">history</span>
                  Scan History
                </Link>
                <Link
                  to="/dashboard"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-highest transition-colors"
                >
                  <span className="material-symbols-outlined text-base text-on-surface-variant">dashboard</span>
                  Dashboard
                </Link>
              </div>

              <div className="border-t border-outline-variant/10 py-1.5">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-error/10 transition-colors"
                >
                  <span className="material-symbols-outlined text-base">logout</span>
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopAppBar;
