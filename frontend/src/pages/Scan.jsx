import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import api from '../services/api'

const Scan = () => {
  const navigate = useNavigate()
  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      setPreview(URL.createObjectURL(file))
      setResult(null)
      setError('')
    }
  }

  const handleScan = async () => {
    if (!selectedFile) {
      setError('Please select an image first')
      return
    }

    setLoading(true)
    setError('')

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const response = await api.post('/scan/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setResult(response.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to scan image. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const resetScan = () => {
    setSelectedFile(null)
    setPreview(null)
    setResult(null)
    setError('')
  }

  return (
    <div style={styles.container}>
      <Navbar />
      <div style={styles.content}>
        <Sidebar />
        <main style={styles.main}>
          <div style={styles.header}>
            <h1>📸 Scan Plant</h1>
            <p>Upload a photo of your plant leaf to detect diseases</p>
          </div>

          <div style={styles.scanContainer}>
            {!result ? (
              <>
                <div style={styles.uploadArea}>
                  {preview ? (
                    <div style={styles.previewContainer}>
                      <img src={preview} alt="Preview" style={styles.preview} />
                      <button onClick={resetScan} style={styles.changeButton}>
                        Change Image
                      </button>
                    </div>
                  ) : (
                    <label style={styles.uploadLabel}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        style={styles.fileInput}
                      />
                      <div style={styles.uploadPrompt}>
                        <span style={styles.uploadIcon}>📁</span>
                        <p>Click to upload or drag and drop</p>
                        <small>PNG, JPG up to 10MB</small>
                      </div>
                    </label>
                  )}
                </div>

                {error && <div style={styles.error}>{error}</div>}

                {selectedFile && (
                  <button 
                    onClick={handleScan} 
                    style={styles.scanButton}
                    disabled={loading}
                  >
                    {loading ? 'Analyzing...' : '🔍 Analyze Plant'}
                  </button>
                )}
              </>
            ) : (
              <div style={styles.resultContainer}>
                <div style={styles.resultHeader}>
                  <h2>Analysis Results</h2>
                  <button onClick={resetScan} style={styles.newScanButton}>
                    New Scan
                  </button>
                </div>

                <div style={styles.resultGrid}>
                  <div style={styles.resultCard}>
                    <h3>Disease Detected</h3>
                    <p style={styles.diseaseName}>{result.disease || 'Unknown'}</p>
                  </div>

                  <div style={styles.resultCard}>
                    <h3>Confidence</h3>
                    <p style={styles.confidence}>
                      {result.confidence ? `${(result.confidence * 100).toFixed(1)}%` : 'N/A'}
                    </p>
                  </div>

                  {result.severity_level && (
                    <div style={styles.resultCard}>
                      <h3>Severity</h3>
                      <p style={styles.severity}>{result.severity_level}</p>
                    </div>
                  )}
                </div>

                {result.solution && (
                  <div style={styles.treatmentSection}>
                    <h3>Treatment Recommendations</h3>
                    <div style={styles.treatments}>
                      <div style={styles.treatmentCard}>
                        <h4>🌿 Organic Treatment</h4>
                        <p>{result.solution.organic || 'Not available'}</p>
                      </div>
                      <div style={styles.treatmentCard}>
                        <h4>🧪 Chemical Treatment</h4>
                        <p>{result.solution.chemical || 'Not available'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {result.prevention && result.prevention.length > 0 && (
                  <div style={styles.preventionSection}>
                    <h3>Prevention Tips</h3>
                    <ul style={styles.preventionList}>
                      {result.prevention.map((tip, index) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div style={styles.chatPrompt}>
                  <p>Need more help or have questions about this disease?</p>
                  <button 
                    onClick={() => navigate('/chat', { state: { disease: result.disease } })}
                    style={styles.chatButton}
                  >
                    💬 Continue Chat with AI Assistant
                  </button>
                </div>
              </div>
            )}
          </div>
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
  scanContainer: { 
    background: 'white', 
    padding: '2rem', 
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  uploadArea: { 
    marginBottom: '1.5rem'
  },
  uploadLabel: { 
    display: 'block',
    cursor: 'pointer'
  },
  fileInput: { display: 'none' },
  uploadPrompt: { 
    border: '2px dashed #ddd',
    borderRadius: '8px',
    padding: '3rem',
    textAlign: 'center',
    transition: 'all 0.2s'
  },
  uploadIcon: { fontSize: '3rem', display: 'block', marginBottom: '1rem' },
  previewContainer: { 
    textAlign: 'center'
  },
  preview: { 
    maxWidth: '100%',
    maxHeight: '400px',
    borderRadius: '8px',
    marginBottom: '1rem'
  },
  changeButton: { 
    padding: '0.5rem 1rem',
    background: '#f0f0f0',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  error: { 
    padding: '1rem',
    background: '#ffebee',
    color: '#c62828',
    borderRadius: '4px',
    marginBottom: '1rem'
  },
  scanButton: { 
    width: '100%',
    padding: '1rem',
    background: '#2d5016',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1.1rem',
    fontWeight: '500',
    cursor: 'pointer'
  },
  resultContainer: { 
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  resultHeader: { 
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  newScanButton: { 
    padding: '0.5rem 1rem',
    background: '#2d5016',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  resultGrid: { 
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem'
  },
  resultCard: { 
    padding: '1.5rem',
    background: '#f9f9f9',
    borderRadius: '6px'
  },
  diseaseName: { 
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#2d5016',
    marginTop: '0.5rem'
  },
  confidence: { 
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#2d5016',
    marginTop: '0.5rem'
  },
  severity: { 
    fontSize: '1.25rem',
    fontWeight: 'bold',
    textTransform: 'capitalize',
    marginTop: '0.5rem'
  },
  treatmentSection: { 
    padding: '1.5rem',
    background: '#f9f9f9',
    borderRadius: '6px'
  },
  treatments: { 
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1rem',
    marginTop: '1rem'
  },
  treatmentCard: { 
    padding: '1rem',
    background: 'white',
    borderRadius: '4px',
    border: '1px solid #e0e0e0'
  },
  preventionSection: { 
    padding: '1.5rem',
    background: '#f9f9f9',
    borderRadius: '6px'
  },
  preventionList: { 
    marginTop: '1rem',
    paddingLeft: '1.5rem',
    lineHeight: '1.8'
  },
  chatPrompt: {
    padding: '1.5rem',
    background: '#e8f5e9',
    borderRadius: '6px',
    textAlign: 'center'
  },
  chatButton: {
    marginTop: '1rem',
    padding: '0.75rem 1.5rem',
    background: '#2d5016',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer'
  }
}

export default Scan
