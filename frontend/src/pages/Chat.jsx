import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import api from '../services/api'

const Chat = () => {
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const response = await api.get('/chat/history')
      setMessages(response.data)
    } catch (error) {
      console.error('Failed to fetch chat history', error)
    }
  }

  const handleSend = async () => {
    if (!query.trim()) return

    setLoading(true)
    try {
      const response = await api.post('/chat/ask', { query, use_detailed: false })
      setMessages([response.data, ...messages])
      setQuery('')
    } catch (error) {
      console.error('Failed to send message', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <h1>AI Assistant</h1>
        <div style={styles.chatBox}>
          {messages.map((msg, idx) => (
            <div key={idx} style={styles.message}>
              <p><strong>You:</strong> {msg.query}</p>
              <p><strong>AI:</strong> {msg.response}</p>
            </div>
          ))}
        </div>
        <div style={styles.inputBox}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about plant diseases..."
            style={styles.input}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button onClick={handleSend} disabled={loading} style={styles.button}>
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: { padding: '2rem' },
  chatBox: { background: 'white', padding: '1rem', borderRadius: '8px', height: '400px', overflowY: 'auto', marginTop: '1rem' },
  message: { padding: '1rem', borderBottom: '1px solid #eee' },
  inputBox: { display: 'flex', gap: '1rem', marginTop: '1rem' },
  input: { flex: 1, padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' },
  button: { padding: '0.75rem 2rem', background: '#2d5016', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }
}

export default Chat
