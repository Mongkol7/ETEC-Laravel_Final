import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { getProfile, logout as logoutRequest } from '../services/authService'
import { getToken, removeToken, setToken as saveToken } from '../utils/token'

export const AuthContext = createContext(null)
//AuthContext.jsx : for provide context to children components
// login.jsx : for login user
// register.jsx : for register user
// logout.jsx : for logout user
// authService.js : for api calls
// token.js : for token storage
function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => getToken())
  const [loading, setLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(() => Boolean(getToken()))

  const login = useCallback(({ token: authToken, user: authUser = null }) => {
    if (authToken) {
      saveToken(authToken)
      setToken(authToken)
    }

    setUser(authUser)
  }, [])

  const clearAuth = useCallback(() => {
    removeToken()
    setToken(null)
    setUser(null)
  }, [])

  useEffect(() => {
    let isMounted = true

    const syncAuthUser = async () => {
      if (!token) {
        setIsInitializing(false)
        return
      }

      setIsInitializing(true)

      try {
        const response = await getProfile()

        if (!isMounted) {
          return
        }

        setUser(response.data?.user ?? response.data ?? null)
      } catch (error) {
        if (!isMounted) {
          return
        }

        console.error('Fetch profile error:', error.response?.data || error.message)
        clearAuth()
      } finally {
        if (isMounted) {
          setIsInitializing(false)
        }
      }
    }

    syncAuthUser()

    return () => {
      isMounted = false
    }
  }, [token, clearAuth])

  const logout = useCallback(async () => {
    setLoading(true)

    try {
      await logoutRequest()
      console.log('Logout success')
    } catch (error) {
      console.error('Logout error:', error.response?.data || error.message)
    } finally {
      clearAuth()
      setLoading(false)
    }
  }, [clearAuth])

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isInitializing,
      setUser,
      login,
      logout,
      clearAuth,
      isAuthenticated: Boolean(token),
    }),
    [user, token, loading, isInitializing, login, logout, clearAuth],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
