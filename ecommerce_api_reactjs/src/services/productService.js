import api from '../api/axios'

const unwrapData = (response) => response.data?.data
  ?? response.data?.products
  ?? response.data?.product
  ?? response.data?.categories
  ?? response.data?.category
  ?? response.data

export const getAllProducts = async () => {
  const response = await api.get('/admin/products')
  return unwrapData(response)
}

export const getProducts = getAllProducts

export const getPublicProducts = async () => {
  const response = await api.get('/products')
  return unwrapData(response)
}

export const getPublicProduct = async (id) => {
  const response = await api.get(`/products/${id}`)
  return unwrapData(response)
}

export const getProduct = async (id) => {
  const response = await api.get(`/admin/products/${id}`)
  return unwrapData(response)
}

export const createProduct = async (payload) => {
  const response = await api.post('/admin/products', payload)
  return unwrapData(response)
}

export const updateProduct = async (id, payload) => {
  if (payload instanceof FormData) {
    if (!payload.has('_method')) {
      payload.append('_method', 'put')
    }

    const response = await api.post(`/admin/products/${id}`, payload)
    return unwrapData(response)
  }

  const response = await api.put(`/admin/products/${id}`, payload)
  return unwrapData(response)
}

export const deleteProduct = async (id) => {
  const response = await api.delete(`/admin/products/${id}`)
  return unwrapData(response)
}

export const getAllCategories = async () => {
  const response = await api.get('/admin/categories')
  return unwrapData(response)
}

export const getPublicCategories = async () => {
  const response = await api.get('/categories')
  return unwrapData(response)
}
