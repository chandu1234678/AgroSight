import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import api from '../services/api'

const History = () => {
  const [scans, setScans] = useState([])

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const response = await api.get('/scan/history')
      setScans(response.data)
    } catch (error) {
      console.error('Failed to fetch history', error)
    }
  }

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <h1>Scan History</h1>
        <div style={styles.list}>
          {scans.map((scan) => (
            <div key={scan.id} style={styles.card}>
              <img src={scan.image_url} alt="Scan" style={styles.image} />
              <div>
                <p><strong>{scan.disease}</strong></p>
                <p>Confidence: {(scan.confidence * 100).toFixed(2)}%</p>
                <p>Date: {new Date(scan.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: { padding: '2rem' },
  list: { display: 'grid', gap: '1rem', marginTop: '1rem' },
  card: { display: 'flex', gap: '1rem', background: 'white', padding: '1rem', borderRadius: '8px' },
  image: { width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }
}

export default History
