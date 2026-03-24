import { Link, useLocation } from 'react-router-dom';

const BottomNavBar = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/dashboard', icon: 'home', label: 'Home' },
    { path: '/chat', icon: 'chat', label: 'Chat' },
    { path: '/scan', icon: 'add_a_photo', label: 'Scan' },
    { path: '/history', icon: 'history', label: 'History' },
    { path: '/profile', icon: 'person', label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-3 md:hidden bg-background/80 backdrop-blur-xl border-t border-outline-variant/15 shadow-[0_-10px_40px_-5px_rgba(0,0,0,0.12)] font-body text-[10px] font-medium">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center transition-transform active:scale-90 ${
              isActive
                ? 'bg-surface-variant text-primary rounded-2xl px-4 py-1'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span className={`material-symbols-outlined ${isActive ? 'filled' : ''}`}>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNavBar;
