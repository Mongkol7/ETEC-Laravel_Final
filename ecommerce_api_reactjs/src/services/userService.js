import api from '../api/axios'

const unwrapData = (response) => response.data?.data ?? response.data

export const getAllUsers = async () => {
  const response = await api.get('/admin/users')
  return unwrapData(response)
}

export const getUser = async (id) => {
  const response = await api.get(`/admin/users/${id}`)
  return unwrapData(response)
}

export const createUser = async (payload) => {
  const response = await api.post('/admin/users', payload)
  return unwrapData(response)
}

export const updateUser = async (id, payload) => {
  if (payload instanceof FormData) {
    if (!payload.has('_method')) {
      payload.append('_method', 'put')
    }

    const response = await api.post(`/admin/users/${id}`, payload)
    return unwrapData(response)
  }

  const response = await api.put(`/admin/users/${id}`, payload)

  return unwrapData(response)
}

export const deleteUser = async (id) => {
  const response = await api.delete(`/admin/users/${id}`)
  return unwrapData(response)
}
