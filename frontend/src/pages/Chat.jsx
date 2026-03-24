import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import api from '../services/api'

const Chat = () => {
  const location = useLocation()
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I\'m your AI farming assistant. Ask me anything about plant diseases, treatments, or farming tips!' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (location.state?.disease) {
      setMessages([{
        role: 'assistant',
        content: `I see you've detected ${location.state.disease}. How can I help you with this disease? I can provide more information about treatment, prevention, or answer any questions you have.`
      }])
    }
  }, [location.state])

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await api.post('/chat', { message: input })
      const assistantMessage = { 
        role: 'assistant', 
        content: response.data.response || 'Sorry, I couldn\'t process that.' 
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I\'m having trouble connecting. Please try again.' 
      }])
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
            <h1>💬 AI Chat Assistant</h1>
            <p>Get instant answers about plant diseases and farming</p>
          </div>

          <div style={styles.chatContainer}>
            <div style={styles.messagesArea}>
              {messages.map((msg, index) => (
                <div 
                  key={index} 
                  style={{
                    ...styles.message,
                    ...(msg.role === 'user' ? styles.userMessage : styles.assistantMessage)
                  }}
                >
                  <div style={styles.messageIcon}>
                    {msg.role === 'user' ? '👤' : '🤖'}
                  </div>
                  <div style={styles.messageContent}>{msg.content}</div>
                </div>
              ))}
              {loading && (
                <div style={{...styles.message, ...styles.assistantMessage}}>
                  <div style={styles.messageIcon}>🤖</div>
                  <div style={styles.messageContent}>Thinking...</div>
                </div>
              )}
            </div>

            <form onSubmit={sendMessage} style={styles.inputForm}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about plant diseases, treatments, or farming tips..."
                style={styles.input}
                disabled={loading}
              />
              <button type="submit" style={styles.sendButton} disabled={loading}>
                Send
              </button>
            </form>
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
  chatContainer: { 
    background: 'white', 
    borderRadius: '8px', 
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    height: 'calc(100vh - 250px)',
    display: 'flex',
    flexDirection: 'column'
  },
  messagesArea: { 
    flex: 1, 
    padding: '1.5rem', 
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  message: { 
    display: 'flex', 
    gap: '1rem',
    maxWidth: '80%'
  },
  userMessage: { 
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse'
  },
  assistantMessage: { 
    alignSelf: 'flex-start'
  },
  messageIcon: { 
    fontSize: '1.5rem',
    flexShrink: 0
  },
  messageContent: { 
    padding: '0.75rem 1rem',
    borderRadius: '12px',
    background: '#f0f0f0',
    lineHeight: '1.5'
  },
  inputForm: { 
    display: 'flex', 
    gap: '1rem',
    padding: '1.5rem',
    borderTop: '1px solid #e0e0e0'
  },
  input: { 
    flex: 1,
    padding: '0.75rem 1rem',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '1rem'
  },
  sendButton: { 
    padding: '0.75rem 2rem',
    background: '#2d5016',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500'
  }
}

export default Chat
