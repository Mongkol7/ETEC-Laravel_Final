import { Navigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import Loading from '../components/common/Loading'

const PrivateRoute = ({ children }) => {
  const { user, token, isInitializing } = useAuth()

  if (isInitializing) {
    return <Loading />
  }

  //if user or token is not found, redirect to login
  if (!user || !token) {
    return <Navigate to="/login" replace />
  }


  return children
}

export default PrivateRoute
