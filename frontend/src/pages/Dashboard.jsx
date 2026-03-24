import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import api from '../services/api'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalScans: 0,
    recentScans: [],
    mostCommonDisease: 'N/A'
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard/stats')
      setStats(response.data)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <Navbar />
      <div style={styles.content}>
        <Sidebar />
        <main style={styles.main}>
          <div style={styles.header}>
            <h1>🌾 Dashboard</h1>
            <p>Welcome back! Here's your plant health overview.</p>
          </div>

          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>📊</div>
              <div>
                <h3>{stats.totalScans}</h3>
                <p>Total Scans</p>
              </div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statIcon}>🦠</div>
              <div>
                <h3>{stats.mostCommonDisease}</h3>
                <p>Most Common Disease</p>
              </div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statIcon}>✅</div>
              <div>
                <h3>{stats.recentScans.length}</h3>
                <p>Recent Scans</p>
              </div>
            </div>
          </div>

          <div style={styles.actions}>
            <button 
              style={styles.primaryButton}
              onClick={() => navigate('/scan')}
            >
              📸 New Scan
            </button>
            <button 
              style={styles.secondaryButton}
              onClick={() => navigate('/history')}
            >
              📜 View History
            </button>
            <button 
              style={styles.secondaryButton}
              onClick={() => navigate('/chat')}
            >
              💬 AI Assistant
            </button>
          </div>

          {loading ? (
            <p>Loading recent scans...</p>
          ) : stats.recentScans.length > 0 ? (
            <div style={styles.recentScans}>
              <h2>Recent Scans</h2>
              <div style={styles.scansList}>
                {stats.recentScans.map((scan, index) => (
                  <div key={index} style={styles.scanCard}>
                    <div style={styles.scanInfo}>
                      <strong>{scan.disease || 'Unknown'}</strong>
                      <span style={styles.confidence}>
                        {scan.confidence ? `${(scan.confidence * 100).toFixed(1)}%` : 'N/A'}
                      </span>
                    </div>
                    <small>{new Date(scan.created_at).toLocaleDateString()}</small>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={styles.emptyState}>
              <p>No scans yet. Start by scanning your first plant!</p>
              <button 
                style={styles.primaryButton}
                onClick={() => navigate('/scan')}
              >
                Start First Scan
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', background: '#f5f5f5' },
  content: { display: 'flex' },
  main: { flex: 1, padding: '2rem', marginLeft: '250px', marginTop: '60px' },
  header: { marginBottom: '2rem' },
  statsGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
    gap: '1.5rem', 
    marginBottom: '2rem' 
  },
  statCard: { 
    background: 'white', 
    padding: '1.5rem', 
    borderRadius: '8px', 
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  statIcon: { fontSize: '2rem' },
  actions: { display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' },
  primaryButton: { 
    padding: '0.75rem 1.5rem', 
    background: '#2d5016', 
    color: 'white', 
    border: 'none', 
    borderRadius: '6px', 
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500'
  },
  secondaryButton: { 
    padding: '0.75rem 1.5rem', 
    background: 'white', 
    color: '#2d5016', 
    border: '2px solid #2d5016', 
    borderRadius: '6px', 
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500'
  },
  recentScans: { background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
  scansList: { display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' },
  scanCard: { 
    padding: '1rem', 
    background: '#f9f9f9', 
    borderRadius: '6px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  scanInfo: { display: 'flex', gap: '1rem', alignItems: 'center' },
  confidence: { 
    padding: '0.25rem 0.75rem', 
    background: '#e8f5e9', 
    color: '#2d5016', 
    borderRadius: '12px',
    fontSize: '0.875rem',
    fontWeight: '500'
  },
  emptyState: { 
    textAlign: 'center', 
    padding: '3rem', 
    background: 'white', 
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  }
}

export default Dashboard
