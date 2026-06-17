import React, { useState, useEffect } from 'react'
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../services/categoryService'
import Loading from '../../components/common/Loading'
import ConfirmModal from '../../components/common/ConfirmModal'
import { useToast } from '../../contexts/ToastContext'

const CategoryList = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const { showToast } = useToast()
  
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [formData, setFormData] = useState({
    name: '', slug: '', description: ''
  })

  // 1. Inject Styles
  useEffect(() => {
    const style = document.createElement('style')
    style.id = 'categories-custom'
    style.textContent = `
      .page-container { animation: fadeIn 0.4s ease-out; font-family: 'DM Sans', sans-serif; }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

      .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
      .page-heading { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
      .page-title { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; color: #fff; margin: 0; }
      .total-badge { display: inline-flex; align-items: center; gap: 8px; min-height: 34px; padding: 7px 12px; border-radius: 999px; border: 1px solid rgba(0,255,140,0.22); background: rgba(0,255,140,0.08); color: rgba(255,255,255,0.78); font-size: 13px; font-weight: 600; }
      .total-badge strong { color: #00ff8c; font-size: 15px; }
      
      .btn-primary { background: linear-gradient(135deg, rgba(0,255,140,0.1) 0%, rgba(0,201,255,0.1) 100%); border: 1px solid rgba(0,255,140,0.3); color: #00ff8c; padding: 10px 20px; border-radius: 10px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
      .btn-primary:hover { background: #00ff8c; color: #050508; box-shadow: 0 4px 16px rgba(0,255,140,0.3); }
      .btn-primary:disabled { opacity: 0.65; cursor: not-allowed; }

      .glass-card { background: rgba(255,255,255,0.02); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 24px; overflow-x: auto; }

      /* Table Styles */
      .data-table { width: 100%; border-collapse: collapse; font-size: 14px; min-width: 600px; }
      .data-table th { text-align: left; color: rgba(255,255,255,0.3); font-weight: 500; padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.05); }
      .data-table td { padding: 16px; color: rgba(255,255,255,0.7); border-bottom: 1px solid rgba(255,255,255,0.03); vertical-align: middle; }
      .row-number { width: 64px; color: rgba(255,255,255,0.36) !important; font-weight: 700; }
      
      .action-btns { display: flex; gap: 8px; }
      .btn-icon { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.5); width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
      .btn-icon:hover { color: #fff; border-color: rgba(255,255,255,0.2); background: rgba(255,255,255,0.1); }
      .btn-delete:hover { color: #ff4757; border-color: rgba(255,71,87,0.3); background: rgba(255,71,87,0.1); }
      .btn-edit:hover { color: #00c9ff; border-color: rgba(0,201,255,0.3); background: rgba(0,201,255,0.1); }

      /* Modal Styles */
      .modal-overlay { position: fixed; inset: 0; background: rgba(5,5,8,0.8); backdrop-filter: blur(8px); z-index: 2000; display: flex; align-items: center; justify-content: center; opacity: 0; pointer-events: none; transition: opacity 0.3s; }
      .modal-overlay.open { opacity: 1; pointer-events: auto; }
      .modal-content { background: #0b0b10; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 32px; width: 100%; max-width: 500px; transform: translateY(20px); transition: transform 0.3s; box-shadow: 0 24px 64px rgba(0,0,0,0.5); }
      .modal-overlay.open .modal-content { transform: translateY(0); }
      
      .form-group { margin-bottom: 20px; }
      .form-label { display: block; font-size: 12px; color: rgba(255,255,255,0.5); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
      .form-input, .form-textarea { width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 12px 16px; border-radius: 12px; color: #fff; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
      .form-textarea { resize: vertical; min-height: 80px; }
      .form-input:focus, .form-textarea:focus { outline: none; border-color: #00ff8c; background: rgba(255,255,255,0.05); }

      .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 32px; }
      .btn-cancel { background: transparent; border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.6); padding: 10px 20px; border-radius: 10px; cursor: pointer; transition: all 0.2s; }
      .btn-cancel:hover { background: rgba(255,255,255,0.05); color: #fff; }
    `
    document.head.appendChild(style)
    return () => { const s = document.getElementById('categories-custom'); if (s) s.remove() }
  }, [])

  // 2. Fetch Data
  const loadCategories = async () => {
    setLoading(true)
    try {
      const response = await getCategories()
      // API returns { status, message, categories, total }
      setCategories(response.data.categories || [])
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      showToast('Failed to load categories', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  // 3. Form Handlers
  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category)
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || ''
      })
    } else {
      setEditingCategory(null)
      setFormData({
        name: '', slug: '', description: ''
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingCategory(null)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'name' && !editingCategory) {
      // Auto-generate slug when typing name (only for new categories)
      const autoSlug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      setFormData(prev => ({ ...prev, name: value, slug: autoSlug }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (saving) return
    
    try {
      setSaving(true)
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData)
        showToast('Category updated successfully', 'success')
      } else {
        await createCategory(formData)
        showToast('Category created successfully', 'success')
      }
      loadCategories()
      handleCloseModal()
    } catch (error) {
      console.error('Error saving category:', error)
      showToast(error.response?.data?.message || 'Failed to save category', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    setDeletingId(id)
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    try {
      await deleteCategory(deletingId)
      showToast('Category deleted successfully', 'success')
      loadCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
      showToast('Failed to delete category', 'error')
    } finally {
      setDeleteModalOpen(false)
      setDeletingId(null)
    }
  }

  // Icons
  const EditIcon = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
  const DeleteIcon = () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-heading">
          <h1 className="page-title">Categories</h1>
          <span className="total-badge">
            Total categories <strong>{categories.length}</strong>
          </span>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()}>+ Add Category</button>
      </div>

      <div className="glass-card">
        {loading ? (
          <Loading label="Loading categories..." variant="page" />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th className="row-number">#</th>
                <th>Name</th>
                <th>Slug</th>
                <th>Description</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category, index) => (
                <tr key={category.id}>
                  <td className="row-number">{index + 1}</td>
                  <td>
                    <strong style={{ color: '#fff', fontWeight: 600 }}>{category.name}</strong>
                  </td>
                  <td style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>{category.slug}</td>
                  <td>
                    <span style={{ fontSize: '13px', opacity: 0.8 }}>
                      {category.description || <em style={{ opacity: 0.3 }}>No description</em>}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns" style={{ justifyContent: 'flex-end' }}>
                      <button className="btn-icon btn-edit" onClick={() => handleOpenModal(category)} title="Edit">
                        <EditIcon />
                      </button>
                      <button className="btn-icon btn-delete" onClick={() => handleDelete(category.id)} title="Delete">
                        <DeleteIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '32px 0' }}>No categories found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmModal 
        open={deleteModalOpen}
        title="Delete Category"
        message="Are you sure you want to delete this category? This might affect products linked to it."
        onCancel={() => { setDeleteModalOpen(false); setDeletingId(null); }}
        onConfirm={confirmDelete}
        confirmText="Delete"
      />

      {/* Modal for Categories */}
      <div className={`modal-overlay ${isModalOpen ? 'open' : ''}`}>
        <div className="modal-content">
          <h2 style={{ fontFamily: 'Syne, sans-serif', color: '#fff', marginTop: 0, marginBottom: '24px' }}>
            {editingCategory ? 'Edit Category' : 'Create New Category'}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Category Name</label>
              <input type="text" name="name" className="form-input" required value={formData.name} onChange={handleChange} placeholder="e.g. Laptops" />
            </div>

            <div className="form-group">
              <label className="form-label">URL Slug</label>
              <input type="text" name="slug" className="form-input" required value={formData.slug} onChange={handleChange} placeholder="laptops" />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea name="description" className="form-textarea" required value={formData.description} onChange={handleChange} placeholder="Brief description of this category..."></textarea>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={handleCloseModal} disabled={saving}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? <Loading label="Saving..." /> : (editingCategory ? 'Update Category' : 'Create Category')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CategoryList
