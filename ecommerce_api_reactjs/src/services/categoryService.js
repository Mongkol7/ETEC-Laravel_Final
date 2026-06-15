import api from '../api/axios'

export const getCategories = () => api.get('/user/categories')
export const getCategory = (id) => api.get(`/user/categories/${id}`)
export const createCategory = (payload) => api.post('/admin/categories', payload)
export const updateCategory = (id, payload) => api.put(`/admin/categories/${id}`, payload)
export const deleteCategory = (id) => api.delete(`/admin/categories/${id}`)
