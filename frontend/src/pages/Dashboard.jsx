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
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard/stats')
      const data = response.data
      
      // Map API response to component state
      setStats({
        totalScans: data.total_scans || 0,
        mostCommonDisease: data.most_common_disease || 'N/A',
        recentScans: data.recent_scans || []
      })
      setError(null)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      setError('Unable to load dashboard data')
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
            <div>
              <h1>🌾 Dashboard</h1>
              <p>Welcome back! Here's your plant health overview.</p>
            </div>
            <button onClick={() => navigate('/scan')} style={styles.quickScanButton}>
              📸 Quick Scan
            </button>
          </div>

          {error && (
            <div style={styles.errorBanner}>
              <span>⚠️ {error}</span>
              <button onClick={fetchDashboardData} style={styles.retryButton}>Retry</button>
            </div>
          )}

          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>📊</div>
              <div>
                <h3>{loading ? '...' : stats.totalScans}</h3>
                <p>Total Scans</p>
              </div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statIcon}>🦠</div>
              <div>
                <h3>{loading ? '...' : stats.mostCommonDisease}</h3>
                <p>Most Common Disease</p>
              </div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statIcon}>✅</div>
              <div>
                <h3>{loading ? '...' : stats.recentScans.length}</h3>
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
            <div style={styles.loadingState}>
              <div style={styles.spinner}></div>
              <p>Loading recent scans...</p>
            </div>
          ) : stats.recentScans && stats.recentScans.length > 0 ? (
            <div style={styles.recentScans}>
              <h2>Recent Scans</h2>
              <div style={styles.scansList}>
                {stats.recentScans.map((scan, index) => (
                  <div key={scan.id || index} style={styles.scanCard}>
                    <div style={styles.scanInfo}>
                      <strong>{scan.disease || 'Unknown'}</strong>
                      <span style={styles.confidence}>
                        {scan.confidence ? `${(scan.confidence * 100).toFixed(1)}%` : 'N/A'}
                      </span>
                    </div>
                    <small>
                      {scan.created_at 
                        ? new Date(scan.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })
                        : 'N/A'
                      }
                    </small>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>🌱</div>
              <h3>No scans yet</h3>
              <p>Start by scanning your first plant to detect diseases</p>
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
  main: { flex: 1, padding: '2rem', marginLeft: '250px', marginTop: '60px', maxWidth: '1400px' },
  header: { 
    marginBottom: '2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  quickScanButton: {
    padding: '0.75rem 1.5rem',
    background: '#2d5016',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500'
  },
  errorBanner: {
    padding: '1rem',
    background: '#ffebee',
    color: '#c62828',
    borderRadius: '6px',
    marginBottom: '1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  retryButton: {
    padding: '0.5rem 1rem',
    background: '#c62828',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
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
    gap: '1rem',
    transition: 'transform 0.2s',
    cursor: 'pointer'
  },
  statIcon: { fontSize: '2.5rem' },
  actions: { display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' },
  primaryButton: { 
    padding: '0.75rem 1.5rem', 
    background: '#2d5016', 
    color: 'white', 
    border: 'none', 
    borderRadius: '6px', 
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'background 0.2s'
  },
  secondaryButton: { 
    padding: '0.75rem 1.5rem', 
    background: 'white', 
    color: '#2d5016', 
    border: '2px solid #2d5016', 
    borderRadius: '6px', 
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'all 0.2s'
  },
  loadingState: {
    textAlign: 'center',
    padding: '3rem',
    background: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #2d5016',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 1rem'
  },
  recentScans: { 
    background: 'white', 
    padding: '1.5rem', 
    borderRadius: '8px', 
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
  },
  scansList: { display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' },
  scanCard: { 
    padding: '1rem', 
    background: '#f9f9f9', 
    borderRadius: '6px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'transform 0.2s',
    cursor: 'pointer'
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
    padding: '4rem 2rem', 
    background: 'white', 
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '1rem'
  }
}

export default Dashboard
