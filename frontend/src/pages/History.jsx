import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import api from '../services/api'

const History = () => {
  const navigate = useNavigate()
  const [scans, setScans] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const response = await api.get('/scan/history')
      setScans(response.data)
    } catch (error) {
      console.error('Failed to fetch history:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredScans = scans.filter(scan => {
    const matchesSearch = scan.disease?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || 
      (filter === 'high' && scan.confidence > 0.8) ||
      (filter === 'medium' && scan.confidence >= 0.6 && scan.confidence <= 0.8) ||
      (filter === 'low' && scan.confidence < 0.6)
    return matchesSearch && matchesFilter
  })

  const getSeverityColor = (confidence) => {
    if (confidence > 0.8) return '#4caf50'
    if (confidence >= 0.6) return '#ff9800'
    return '#f44336'
  }

  return (
    <div style={styles.container}>
      <Navbar />
      <div style={styles.content}>
        <Sidebar />
        <main style={styles.main}>
          <div style={styles.header}>
            <div>
              <h1>📜 Scan History</h1>
              <p>View all your previous plant disease scans</p>
            </div>
            <button onClick={() => navigate('/scan')} style={styles.newScanButton}>
              📸 New Scan
            </button>
          </div>

          <div style={styles.controls}>
            <input
              type="text"
              placeholder="Search by disease name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
            <div style={styles.filters}>
              <button 
                onClick={() => setFilter('all')}
                style={{...styles.filterButton, ...(filter === 'all' && styles.activeFilter)}}
              >
                All
              </button>
              <button 
                onClick={() => setFilter('high')}
                style={{...styles.filterButton, ...(filter === 'high' && styles.activeFilter)}}
              >
                High Confidence
              </button>
              <button 
                onClick={() => setFilter('medium')}
                style={{...styles.filterButton, ...(filter === 'medium' && styles.activeFilter)}}
              >
                Medium
              </button>
              <button 
                onClick={() => setFilter('low')}
                style={{...styles.filterButton, ...(filter === 'low' && styles.activeFilter)}}
              >
                Low
              </button>
            </div>
          </div>

          {loading ? (
            <div style={styles.loadingState}>
              <div style={styles.spinner}></div>
              <p>Loading scan history...</p>
            </div>
          ) : filteredScans.length > 0 ? (
            <div style={styles.historyGrid}>
              {filteredScans.map((scan) => (
                <div key={scan.id} style={styles.scanCard}>
                  {scan.image_url && (
                    <div style={styles.imageContainer}>
                      <img src={scan.image_url} alt={scan.disease} style={styles.scanImage} />
                    </div>
                  )}
                  <div style={styles.scanDetails}>
                    <h3>{scan.disease || 'Unknown Disease'}</h3>
                    <div style={styles.scanMeta}>
                      <span 
                        style={{
                          ...styles.confidenceBadge,
                          background: getSeverityColor(scan.confidence || 0)
                        }}
                      >
                        {scan.confidence ? `${(scan.confidence * 100).toFixed(1)}%` : 'N/A'} Confidence
                      </span>
                      <span style={styles.date}>
                        {scan.created_at 
                          ? new Date(scan.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })
                          : 'N/A'
                        }
                      </span>
                    </div>
                    {scan.severity && (
                      <p style={styles.severity}>
                        Severity: <strong>{scan.severity}</strong>
                      </p>
                    )}
                    <button 
                      onClick={() => navigate(`/scan/${scan.id}`)}
                      style={styles.viewButton}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>🔍</div>
              <h3>No scans found</h3>
              <p>{searchTerm ? 'Try a different search term' : 'Start scanning plants to build your history'}</p>
              <button onClick={() => navigate('/scan')} style={styles.primaryButton}>
                Start Scanning
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
  newScanButton: {
    padding: '0.75rem 1.5rem',
    background: '#2d5016',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500'
  },
  controls: {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    marginBottom: '2rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  searchInput: {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '1rem',
    marginBottom: '1rem'
  },
  filters: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap'
  },
  filterButton: {
    padding: '0.5rem 1rem',
    background: '#f5f5f5',
    border: '1px solid #ddd',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'all 0.2s'
  },
  activeFilter: {
    background: '#2d5016',
    color: 'white',
    borderColor: '#2d5016'
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
  historyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem'
  },
  scanCard: {
    background: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s',
    cursor: 'pointer'
  },
  imageContainer: {
    width: '100%',
    height: '200px',
    overflow: 'hidden',
    background: '#f5f5f5'
  },
  scanImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  scanDetails: {
    padding: '1.5rem'
  },
  scanMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '0.5rem',
    marginBottom: '1rem'
  },
  confidenceBadge: {
    padding: '0.25rem 0.75rem',
    color: 'white',
    borderRadius: '12px',
    fontSize: '0.875rem',
    fontWeight: '500'
  },
  date: {
    fontSize: '0.875rem',
    color: '#666'
  },
  severity: {
    fontSize: '0.9rem',
    color: '#666',
    marginBottom: '1rem'
  },
  viewButton: {
    width: '100%',
    padding: '0.75rem',
    background: '#2d5016',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
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
  },
  primaryButton: {
    marginTop: '1rem',
    padding: '0.75rem 1.5rem',
    background: '#2d5016',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500'
  }
}

export default History
