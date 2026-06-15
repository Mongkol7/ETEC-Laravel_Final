import axios from 'axios'
import { getToken } from '../utils/token'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = getToken()

  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export default api

