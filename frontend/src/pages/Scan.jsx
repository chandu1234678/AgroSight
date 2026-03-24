import { useState } from 'react'
import Navbar from '../components/Navbar'
import api from '../services/api'

const Scan = () => {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    setFile(selectedFile)
    setPreview(URL.createObjectURL(selectedFile))
    setResult(null)
  }

  const handleUpload = async () => {
    if (!file) return

    setLoading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await api.post('/scan/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setResult(response.data)
    } catch (error) {
      console.error('Upload failed', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <h1>Scan Plant</h1>
        <div style={styles.uploadCard}>
          <input type="file" accept="image/*" onChange={handleFileChange} />
          {preview && <img src={preview} alt="Preview" style={styles.preview} />}
          <button onClick={handleUpload} disabled={!file || loading} style={styles.button}>
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
        {result && (
          <div style={styles.result}>
            <h2>Results</h2>
            <p><strong>Disease:</strong> {result.disease}</p>
            <p><strong>Confidence:</strong> {(result.confidence * 100).toFixed(2)}%</p>
            <p><strong>Severity:</strong> {result.severity}</p>
            <p><strong>Recommendation:</strong> {result.recommendation}</p>
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: { padding: '2rem' },
  uploadCard: { background: 'white', padding: '2rem', borderRadius: '8px', marginTop: '1rem' },
  preview: { maxWidth: '400px', marginTop: '1rem', borderRadius: '8px' },
  button: { padding: '0.75rem 2rem', background: '#2d5016', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '1rem' },
  result: { background: 'white', padding: '2rem', borderRadius: '8px', marginTop: '2rem' }
}

export default Scan
