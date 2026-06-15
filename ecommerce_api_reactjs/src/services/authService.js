import api from '../api/axios'

export const login = (credentials) => api.post('/auth/login', credentials)
export const register = (payload) => api.post('/auth/register', payload)
export const getProfile = () => api.get('/user/profile')
export const logout = () => api.post('/user/logout')
