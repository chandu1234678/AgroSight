import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}>Loading...</div>
      </div>
    )
  }

  return user ? children : <Navigate to="/login" />
}

const styles = {
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: '#f5f5f5'
  },
  spinner: {
    fontSize: '1.2rem',
    color: '#2d5016'
  }
}

export default PrivateRoute
