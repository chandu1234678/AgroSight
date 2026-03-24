import { Link, useLocation } from 'react-router-dom'

const Sidebar = () => {
  const location = useLocation()

  const menuItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/scan', icon: '�', label: 'Scan Plant' },
    { path: '/history', icon: '📜', label: 'History' },
    { path: '/chat', icon: '💬', label: 'AI Chat' },
  ]

  return (
    <aside style={styles.sidebar}>
      <nav style={styles.nav}>
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              ...styles.menuItem,
              ...(location.pathname === item.path ? styles.activeItem : {})
            }}
          >
            <span style={styles.icon}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  )
}

const styles = {
  sidebar: {
    position: 'fixed',
    left: 0,
    top: '60px',
    width: '250px',
    height: 'calc(100vh - 60px)',
    background: 'white',
    borderRight: '1px solid #e0e0e0',
    padding: '1rem 0',
    overflowY: 'auto'
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    padding: '0 1rem'
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    borderRadius: '6px',
    textDecoration: 'none',
    color: '#333',
    transition: 'all 0.2s',
    cursor: 'pointer'
  },
  activeItem: {
    background: '#e8f5e9',
    color: '#2d5016',
    fontWeight: '500'
  },
  icon: {
    fontSize: '1.25rem'
  }
}

export default Sidebar
