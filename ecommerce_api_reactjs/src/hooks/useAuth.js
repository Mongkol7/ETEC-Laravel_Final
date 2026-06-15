import { useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'
//useAuth.js : for use auth context in components
function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}

export default useAuth
