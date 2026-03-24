import { Link, useLocation } from 'react-router-dom';

const SideNavBar = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/dashboard', icon: 'dashboard', label: 'Dashboard', filled: true },
    { path: '/chat', icon: 'chat_bubble', label: 'Chat' },
    { path: '/scan', icon: 'shutter_speed', label: 'Scan' },
    { path: '/history', icon: 'history', label: 'History' },
    { path: '/profile', icon: 'person', label: 'Profile' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full z-40 bg-surface-container-low font-headline text-sm tracking-wide h-screen w-64 hidden md:flex flex-col">
      <div className="px-6 py-8">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined filled text-on-primary">eco</span>
          </div>
          <div>
            <h1 className="text-2xl font-black text-primary">AgroSight</h1>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-[0.2em]">Editorial Intelligence</p>
          </div>
        </div>
        
        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 py-3 px-4 rounded-lg mx-2 transition-all group ${
                  isActive
                    ? 'text-primary bg-surface-variant'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant'
                }`}
              >
                <span className={`material-symbols-outlined ${isActive && item.filled ? 'filled' : ''}`}>
                  {item.icon}
                </span>
                <span className={isActive ? 'font-semibold' : ''}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="mt-8 px-2">
          <Link
            to="/scan"
            className="w-full py-3 px-4 bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold rounded-md flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform active:scale-95"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            New Scan
          </Link>
        </div>
      </div>
      
      <div className="mt-auto px-6 py-8 space-y-2">
        <Link to="/settings" className="flex items-center gap-4 py-2 px-4 text-on-surface-variant hover:text-on-surface transition-all">
          <span className="material-symbols-outlined">settings</span>
          <span>Settings</span>
        </Link>
        <a href="#" className="flex items-center gap-4 py-2 px-4 text-on-surface-variant hover:text-on-surface transition-all">
          <span className="material-symbols-outlined">help_outline</span>
          <span>Help</span>
        </a>
      </div>
    </aside>
  );
};

export default SideNavBar;
