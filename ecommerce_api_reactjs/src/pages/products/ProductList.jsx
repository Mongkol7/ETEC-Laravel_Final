import React, { useState, useEffect } from 'react'
import { getAllProducts, createProduct, updateProduct, deleteProduct, getAllCategories } from '../../services/productService'
import Loading from '../../components/common/Loading'

const ProductList = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [selectedImagePreviews, setSelectedImagePreviews] = useState([])
  const [formData, setFormData] = useState({
    category_id: '', name: '', slug: '', description: '', price: '', stock: '', images: []
  })

  // 1. Inject Styles
  useEffect(() => {
    const style = document.createElement('style')
    style.id = 'products-custom'
    style.textContent = `
      .page-container { animation: fadeIn 0.4s ease-out; font-family: 'DM Sans', sans-serif; }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

      .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
      .page-heading { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
      .page-title { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; color: #fff; margin: 0; }
      .total-products-badge { display: inline-flex; align-items: center; gap: 8px; min-height: 34px; padding: 7px 12px; border-radius: 999px; border: 1px solid rgba(0,255,140,0.22); background: rgba(0,255,140,0.08); color: rgba(255,255,255,0.78); font-size: 13px; font-weight: 600; }
      .total-products-badge strong { color: #00ff8c; font-size: 15px; }
      
      .btn-primary { background: linear-gradient(135deg, rgba(0,255,140,0.1) 0%, rgba(0,201,255,0.1) 100%); border: 1px solid rgba(0,255,140,0.3); color: #00ff8c; padding: 10px 20px; border-radius: 10px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
      .btn-primary:hover { background: #00ff8c; color: #050508; box-shadow: 0 4px 16px rgba(0,255,140,0.3); }
      .btn-primary:disabled, .btn-cancel:disabled, .btn-icon:disabled { opacity: 0.65; cursor: not-allowed; transform: none; box-shadow: none; }

      .glass-card { background: rgba(255,255,255,0.02); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 24px; overflow-x: auto; }

      /* Table Styles */
      .data-table { width: 100%; border-collapse: collapse; font-size: 14px; min-width: 800px; }
      .data-table th { text-align: left; color: rgba(255,255,255,0.3); font-weight: 500; padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.05); }
      .data-table td { padding: 16px; color: rgba(255,255,255,0.7); border-bottom: 1px solid rgba(255,255,255,0.03); vertical-align: middle; }
      .row-number { width: 64px; color: rgba(255,255,255,0.36) !important; font-weight: 700; }
      
      .product-cell { display: flex; align-items: center; gap: 16px; }
      .product-img { width: 48px; height: 48px; border-radius: 8px; object-fit: cover; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); }
      .product-placeholder { width: 48px; height: 48px; border-radius: 8px; background: rgba(0,201,255,0.1); color: #00c9ff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; }
      
      .stock-badge { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
      .stock-in { background: rgba(0,255,140,0.1); color: #00ff8c; }
      .stock-low { background: rgba(255,145,0,0.1); color: #ff9100; }
      .stock-out { background: rgba(255,71,87,0.1); color: #ff4757; }

      .action-btns { display: flex; gap: 8px; }
      .btn-icon { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.5); width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
      .btn-icon:hover { color: #fff; border-color: rgba(255,255,255,0.2); background: rgba(255,255,255,0.1); }
      .btn-delete:hover { color: #ff4757; border-color: rgba(255,71,87,0.3); background: rgba(255,71,87,0.1); }
      .btn-edit:hover { color: #00c9ff; border-color: rgba(0,201,255,0.3); background: rgba(0,201,255,0.1); }

      /* Modal Styles */
      .modal-overlay { position: fixed; inset: 0; background: rgba(5,5,8,0.8); backdrop-filter: blur(8px); z-index: 2000; display: flex; align-items: center; justify-content: center; opacity: 0; pointer-events: none; transition: opacity 0.3s; }
      .modal-overlay.open { opacity: 1; pointer-events: auto; }
      .modal-content { background: #0b0b10; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 32px; width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; transform: translateY(20px); transition: transform 0.3s; box-shadow: 0 24px 64px rgba(0,0,0,0.5); }
      .modal-overlay.open .modal-content { transform: translateY(0); }
      
      /* Custom Scrollbar for Modal */
      .modal-content::-webkit-scrollbar { width: 6px; }
      .modal-content::-webkit-scrollbar-track { background: transparent; }
      .modal-content::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }

      .form-row { display: flex; gap: 16px; margin-bottom: 16px; }
      .form-group { flex: 1; margin-bottom: 16px; }
      .form-row .form-group { margin-bottom: 0; }
      
      .form-label { display: block; font-size: 12px; color: rgba(255,255,255,0.5); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
      .form-input, .form-select, .form-textarea { width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 12px 16px; border-radius: 12px; color: #fff; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
      .form-textarea { resize: vertical; min-height: 100px; }
      .form-input:focus, .form-select:focus, .form-textarea:focus { outline: none; border-color: #00ff8c; background: rgba(255,255,255,0.05); }
      .form-select option { background: #0b0b10; }

      .image-preview-section { margin-top: 14px; }
      .image-preview-title { margin: 0 0 10px; color: rgba(255,255,255,0.48); font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
      .image-preview-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(92px, 1fr)); gap: 10px; }
      .image-preview-item { position: relative; overflow: hidden; aspect-ratio: 1 / 1; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.04); }
      .image-preview-item img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .image-preview-label { position: absolute; left: 6px; bottom: 6px; max-width: calc(100% - 12px); padding: 3px 6px; border-radius: 999px; background: rgba(5,5,8,0.76); color: rgba(255,255,255,0.78); font-size: 10px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      
      .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 32px; }
      .btn-cancel { background: transparent; border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.6); padding: 10px 20px; border-radius: 10px; cursor: pointer; transition: all 0.2s; }
      .btn-cancel:hover { background: rgba(255,255,255,0.05); color: #fff; }
    `
    document.head.appendChild(style)
    return () => { const s = document.getElementById('products-custom'); if (s) s.remove() }
  }, [])

  // 2. Fetch Data
  const loadData = async () => {
    setLoading(true)
    try {
      const [productsData, categoriesData] = await Promise.all([
        getAllProducts(),
        getAllCategories().catch(() => []) // Catch in case categories endpoint isn't ready
      ])
      setProducts(Array.isArray(productsData) ? productsData : [])
      setCategories(Array.isArray(categoriesData) ? categoriesData : [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    return () => {
      selectedImagePreviews.forEach((preview) => URL.revokeObjectURL(preview.url))
    }
  }, [selectedImagePreviews])

  // 3. Form Handlers
  const handleOpenModal = (product = null) => {
    selectedImagePreviews.forEach((preview) => URL.revokeObjectURL(preview.url))
    setSelectedImagePreviews([])

    if (product) {
      setEditingProduct(product)
      setFormData({
        category_id: product.category_id,
        name: product.name,
        slug: product.slug,
        description: product.description || '',
        price: product.price,
        stock: product.stock,
        images: [] // Reset images for editing (backend destroys old if new ones provided)
      })
    } else {
      setEditingProduct(null)
      setFormData({
        category_id: categories.length > 0 ? categories[0].id : '',
        name: '', slug: '', description: '', price: '', stock: '', images: []
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingProduct(null)
    selectedImagePreviews.forEach((preview) => URL.revokeObjectURL(preview.url))
    setSelectedImagePreviews([])
  }

  const handleChange = (e) => {
    const { name, value, files } = e.target
    
    if (name === 'images') {
      // Convert FileList to Array
      const nextImages = Array.from(files)
      selectedImagePreviews.forEach((preview) => URL.revokeObjectURL(preview.url))
      setSelectedImagePreviews(nextImages.map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
      })))
      setFormData(prev => ({ ...prev, images: nextImages }))
    } else if (name === 'name' && !editingProduct) {
      // Auto-generate slug when typing name (only for new products)
      const autoSlug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      setFormData(prev => ({ ...prev, name: value, slug: autoSlug }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (saving) return
    
    const submitData = new FormData()
    submitData.append('category_id', formData.category_id)
    submitData.append('name', formData.name)
    submitData.append('slug', formData.slug)
    submitData.append('description', formData.description)
    submitData.append('price', formData.price)
    submitData.append('stock', formData.stock)

    // Append multiple images
    if (formData.images && formData.images.length > 0) {
      formData.images.forEach((file) => {
        submitData.append('images[]', file) // Backend expects images[] array
      })
    }

    try {
      setSaving(true)
      if (editingProduct) {
        // Laravel requires _method: PUT when sending FormData
        submitData.append('_method', 'put')
        await updateProduct(editingProduct.id, submitData)
      } else {
        await createProduct(submitData)
      }
      loadData()
      handleCloseModal()
    } catch (error) {
      console.error('Error saving product:', error)
      alert(error.response?.data?.message || 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (deletingId) return

    if (window.confirm('Are you sure you want to delete this product? All attached images will be destroyed.')) {
      try {
        setDeletingId(id)
        await deleteProduct(id)
        loadData()
      } catch (error) {
        console.error('Error deleting product:', error)
      } finally {
        setDeletingId(null)
      }
    }
  }

  // Icons
  const EditIcon = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
  const DeleteIcon = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>

  const rawExistingImages = editingProduct
    ? editingProduct.product_image || editingProduct.product_images || editingProduct.images || []
    : []
  const existingImages = Array.isArray(rawExistingImages)
    ? rawExistingImages
    : rawExistingImages
      ? [rawExistingImages]
      : []

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-heading">
          <h1 className="page-title">Inventory</h1>
          <span className="total-products-badge">
            Total products <strong>{products.length}</strong>
          </span>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()}>+ Add Product</button>
      </div>

      <div className="glass-card">
        {loading ? (
          <Loading label="Loading products..." variant="page" />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th className="row-number">#</th>
                <th>Product</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Category ID</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => {
                // Check if stock is low or out
                const stockStatus = product.stock > 10 ? 'stock-in' : (product.stock > 0 ? 'stock-low' : 'stock-out')
                const stockLabel = product.stock > 10 ? 'In Stock' : (product.stock > 0 ? 'Low Stock' : 'Out of Stock')
                // Safely grab the first image if it exists
                const mainImage = product.product_image && product.product_image.length > 0 
                                  ? product.product_image[0].image_url : null;

                return (
                  <tr key={product.id}>
                    <td className="row-number">{index + 1}</td>
                    <td>
                      <div className="product-cell">
                        {mainImage ? (
                          <img src={mainImage} alt={product.name} className="product-img" />
                        ) : (
                          <div className="product-placeholder">{product.name.charAt(0).toUpperCase()}</div>
                        )}
                        <div>
                          <strong style={{ color: '#fff', fontWeight: 600, display: 'block', marginBottom: '4px' }}>{product.name}</strong>
                          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>/{product.slug}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: '#00ff8c', fontWeight: 600 }}>${parseFloat(product.price).toFixed(2)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className={`stock-badge ${stockStatus}`}>{stockLabel}</span>
                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>({product.stock})</span>
                      </div>
                    </td>
                    <td>{product.category_id}</td>
                    <td>
                      <div className="action-btns" style={{ justifyContent: 'flex-end' }}>
                        <button className="btn-icon btn-edit" onClick={() => handleOpenModal(product)} title="Edit">
                          <EditIcon />
                        </button>
                        <button className="btn-icon btn-delete" onClick={() => handleDelete(product.id)} title="Delete" disabled={Boolean(deletingId)}>
                          {deletingId === product.id ? <Loading label="" size={14} /> : <DeleteIcon />}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {products.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '32px 0' }}>No products found in inventory.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Sliding Glass Modal for Products */}
      <div className={`modal-overlay ${isModalOpen ? 'open' : ''}`}>
        <div className="modal-content">
          <h2 style={{ fontFamily: 'Syne, sans-serif', color: '#fff', marginTop: 0, marginBottom: '24px' }}>
            {editingProduct ? 'Edit Product' : 'Create New Product'}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Product Name</label>
              <input type="text" name="name" className="form-input" required value={formData.name} onChange={handleChange} placeholder="e.g. Mechanical Keyboard" />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">URL Slug</label>
                <input type="text" name="slug" className="form-input" required value={formData.slug} onChange={handleChange} placeholder="mechanical-keyboard" />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select name="category_id" className="form-select" required value={formData.category_id} onChange={handleChange}>
                  <option value="" disabled>Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name || `Category ${cat.id}`}</option>
                  ))}
                  {/* Fallback if categories fail to load */}
                  {categories.length === 0 && <option value="1">Fallback Category 1</option>}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Price ($)</label>
                <input type="number" step="0.01" name="price" className="form-input" required value={formData.price} onChange={handleChange} placeholder="99.99" />
              </div>
              <div className="form-group">
                <label className="form-label">Stock Quantity</label>
                <input type="number" name="stock" className="form-input" required value={formData.stock} onChange={handleChange} placeholder="50" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea name="description" className="form-textarea" value={formData.description} onChange={handleChange} placeholder="Detailed product description..."></textarea>
            </div>

            <div className="form-group">
              <label className="form-label">Product Images {editingProduct && <span style={{textTransform:'none', opacity:0.5}}>(Uploading new replaces old)</span>}</label>
              <input type="file" name="images" className="form-input" accept="image/*" multiple onChange={handleChange} style={{ padding: '9px 16px' }} />
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '6px' }}>You can select multiple images by holding Ctrl/Cmd.</div>

              {existingImages.length > 0 && (
                <div className="image-preview-section">
                  <p className="image-preview-title">Current images</p>
                  <div className="image-preview-grid">
                    {existingImages.map((image, index) => (
                      <div className="image-preview-item" key={image.id || image.public_id || image.image_url || index}>
                        <img src={image.image_url || image.url || image} alt={`${formData.name || 'Product'} image ${index + 1}`} />
                        <span className="image-preview-label">Current {index + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedImagePreviews.length > 0 && (
                <div className="image-preview-section">
                  <p className="image-preview-title">New selected images</p>
                  <div className="image-preview-grid">
                    {selectedImagePreviews.map((preview, index) => (
                      <div className="image-preview-item" key={preview.url}>
                        <img src={preview.url} alt={`Selected product image ${index + 1}`} />
                        <span className="image-preview-label">{preview.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={handleCloseModal} disabled={saving}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? (
                  <Loading label={editingProduct ? 'Saving...' : 'Publishing...'} />
                ) : (
                  editingProduct ? 'Save Changes' : 'Publish Product'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ProductList
