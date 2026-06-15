import { Navigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import Loading from '../components/common/Loading'

const AdminRoute = ({ children }) => {
  const { user, token, isInitializing } = useAuth()

  if (isInitializing) {
    return <Loading label="Checking access..." variant="screen" />
  }

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

export default AdminRoute
