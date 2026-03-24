import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import api from '../services/api'

const History = () => {
  const [scans, setScans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const response = await api.get('/scan/history')
      setScans(response.data || [])
    } catch (error) {
      console.error('Failed to fetch history:', error)
      setScans([])
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
            <h1>📜 Scan History</h1>
            <p>View all your previous plant disease scans</p>
          </div>

          {loading ? (
            <div style={styles.loading}>Loading history...</div>
          ) : scans.length === 0 ? (
            <div style={styles.emptyState}>
              <p>No scan history yet</p>
              <p>Start by scanning your first plant!</p>
            </div>
          ) : (
            <div style={styles.historyList}>
              {scans.map((scan) => (
                <div key={scan.id} style={styles.historyCard}>
                  <div style={styles.cardHeader}>
                    <h3>{scan.disease || 'Unknown Disease'}</h3>
                    <span style={styles.confidence}>
                      {scan.confidence ? `${(scan.confidence * 100).toFixed(1)}%` : 'N/A'}
                    </span>
                  </div>
                  <div style={styles.cardBody}>
                    <p><strong>Date:</strong> {new Date(scan.created_at).toLocaleString()}</p>
                    <p><strong>Status:</strong> {scan.confidence >= 0.7 ? '✅ Certain' : '⚠️ Uncertain'}</p>
                  </div>
                </div>
              ))}
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
  loading: { textAlign: 'center', padding: '3rem', fontSize: '1.1rem' },
  emptyState: { 
    textAlign: 'center', 
    padding: '3rem', 
    background: 'white', 
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  historyList: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  historyCard: { 
    background: 'white', 
    padding: '1.5rem', 
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  cardHeader: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: '1rem'
  },
  confidence: { 
    padding: '0.25rem 0.75rem', 
    background: '#e8f5e9', 
    color: '#2d5016', 
    borderRadius: '12px',
    fontSize: '0.875rem',
    fontWeight: '500'
  },
  cardBody: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '0.5rem',
    color: '#666'
  }
}

export default History
