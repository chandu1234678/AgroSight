import { Link } from 'react-router-dom'

const Sidebar = () => {
  return (
    <aside style={styles.sidebar}>
      <nav>
        <Link to="/dashboard" style={styles.link}>📊 Dashboard</Link>
        <Link to="/scan" style={styles.link}>🔍 Scan</Link>
        <Link to="/history" style={styles.link}>📜 History</Link>
        <Link to="/chat" style={styles.link}>💬 Chat</Link>
      </nav>
    </aside>
  )
}

const styles = {
  sidebar: { width: '200px', background: '#2d5016', color: 'white', padding: '2rem', minHeight: '100vh' },
  link: { display: 'block', color: 'white', textDecoration: 'none', padding: '1rem 0' }
}

export default Sidebar
