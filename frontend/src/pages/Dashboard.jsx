import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import api from '../services/api'

const Dashboard = () => {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard/stats')
      setStats(response.data)
    } catch (error) {
      console.error('Failed to fetch stats', error)
    }
  }

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <h1>Dashboard</h1>
        {stats ? (
          <div style={styles.grid}>
            <div style={styles.card}>
              <h3>Total Scans</h3>
              <p style={styles.number}>{stats.total_scans}</p>
            </div>
            <div style={styles.card}>
              <h3>Most Common Disease</h3>
              <p style={styles.text}>{stats.most_common_disease}</p>
            </div>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: { padding: '2rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '2rem' },
  card: { background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
  number: { fontSize: '3rem', fontWeight: 'bold', color: '#2d5016', margin: 0 },
  text: { fontSize: '1.5rem', color: '#555', margin: 0 }
}

export default Dashboard
