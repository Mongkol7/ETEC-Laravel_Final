import React, { useState, useEffect } from 'react';
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} from '../../services/userService'
import Loading from '../../components/common/Loading'

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [notice, setNotice] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    image: null,
  });

  // 1. Inject Styles
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'users-custom';
    style.textContent = `
      .page-container { animation: fadeIn 0.4s ease-out; font-family: 'DM Sans', sans-serif; }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

      .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
      .page-heading { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
      .page-title { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; color: #fff; margin: 0; }
      .total-users-badge { display: inline-flex; align-items: center; gap: 8px; min-height: 34px; padding: 7px 12px; border-radius: 999px; border: 1px solid rgba(0,255,140,0.22); background: rgba(0,255,140,0.08); color: rgba(255,255,255,0.78); font-size: 13px; font-weight: 600; }
      .total-users-badge strong { color: #00ff8c; font-size: 15px; }
      
      .btn-primary { background: linear-gradient(135deg, rgba(0,255,140,0.1) 0%, rgba(0,201,255,0.1) 100%); border: 1px solid rgba(0,255,140,0.3); color: #00ff8c; padding: 10px 20px; border-radius: 10px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
      .btn-primary:hover { background: #00ff8c; color: #050508; box-shadow: 0 4px 16px rgba(0,255,140,0.3); }
      .btn-primary:disabled, .btn-danger:disabled, .btn-cancel:disabled { opacity: 0.65; cursor: not-allowed; transform: none; box-shadow: none; }

      .glass-card { background: rgba(255,255,255,0.02); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 24px; overflow-x: auto; }

      /* Table Styles */
      .data-table { width: 100%; border-collapse: collapse; font-size: 14px; min-width: 600px; }
      .data-table th { text-align: left; color: rgba(255,255,255,0.3); font-weight: 500; padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.05); }
      .data-table td { padding: 16px; color: rgba(255,255,255,0.7); border-bottom: 1px solid rgba(255,255,255,0.03); vertical-align: middle; }
      .row-number { width: 64px; color: rgba(255,255,255,0.36) !important; font-weight: 700; }
      
      .user-cell { display: flex; align-items: center; gap: 12px; }
      .avatar-img { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); }
      .avatar-placeholder { width: 36px; height: 36px; border-radius: 50%; background: rgba(0,255,140,0.1); color: #00ff8c; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; }
      
      .role-badge { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
      .role-admin { background: rgba(162,0,255,0.1); color: #a200ff; }
      .role-user { background: rgba(0,201,255,0.1); color: #00c9ff; }

      .action-btns { display: flex; gap: 8px; }
      .btn-icon { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.5); width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
      .btn-icon:hover { color: #fff; border-color: rgba(255,255,255,0.2); background: rgba(255,255,255,0.1); }
      .btn-delete:hover { color: #ff4757; border-color: rgba(255,71,87,0.3); background: rgba(255,71,87,0.1); }
      .btn-edit:hover { color: #00c9ff; border-color: rgba(0,201,255,0.3); background: rgba(0,201,255,0.1); }

      /* Modal Styles */
      .modal-overlay { position: fixed; inset: 0; background: rgba(5,5,8,0.8); backdrop-filter: blur(8px); z-index: 2000; display: flex; align-items: center; justify-content: center; opacity: 0; pointer-events: none; transition: opacity 0.3s; }
      .modal-overlay.open { opacity: 1; pointer-events: auto; }
      .modal-content { background: #0b0b10; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 32px; width: 100%; max-width: 480px; transform: translateY(20px); transition: transform 0.3s; box-shadow: 0 24px 64px rgba(0,0,0,0.5); }
      .modal-overlay.open .modal-content { transform: translateY(0); }
      
      .form-group { margin-bottom: 16px; }
      .form-label { display: block; font-size: 12px; color: rgba(255,255,255,0.5); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
      .form-input, .form-select { width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 12px 16px; border-radius: 12px; color: #fff; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
      .form-input:focus, .form-select:focus { outline: none; border-color: #00ff8c; background: rgba(255,255,255,0.05); }
      .form-select option { background: #0b0b10; }
      .profile-preview { margin-top: 14px; display: flex; align-items: center; gap: 14px; padding: 12px; border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; background: rgba(255,255,255,0.03); }
      .profile-preview-img { width: 72px; height: 72px; border-radius: 50%; object-fit: cover; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.05); flex-shrink: 0; }
      .profile-preview-placeholder { width: 72px; height: 72px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(0,255,140,0.16); background: rgba(0,255,140,0.08); color: #00ff8c; font-size: 22px; font-weight: 800; flex-shrink: 0; }
      .profile-preview-title { margin: 0 0 4px; color: rgba(255,255,255,0.78); font-size: 13px; font-weight: 700; }
      .profile-preview-copy { margin: 0; color: rgba(255,255,255,0.42); font-size: 12px; line-height: 1.45; }
      
      .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
      .btn-cancel { background: transparent; border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.6); padding: 10px 20px; border-radius: 10px; cursor: pointer; transition: all 0.2s; }
      .btn-cancel:hover { background: rgba(255,255,255,0.05); color: #fff; }
      .btn-danger { background: linear-gradient(135deg, rgba(255,71,87,0.9) 0%, rgba(255,107,122,0.95) 100%); border: 1px solid rgba(255,71,87,0.35); color: #fff; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: 600; transition: all 0.2s; }
      .btn-danger:hover { transform: translateY(-1px); box-shadow: 0 10px 24px rgba(255,71,87,0.22); }

      .toast-stack {
        position: fixed;
        top: 92px;
        right: 24px;
        z-index: 2200;
        display: flex;
        flex-direction: column;
        gap: 12px;
        pointer-events: none;
      }

      .toast-card {
        width: min(380px, calc(100vw - 32px));
        display: flex;
        gap: 14px;
        align-items: flex-start;
        padding: 14px 16px;
        border-radius: 16px;
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(11,11,16,0.92);
        backdrop-filter: blur(18px);
        box-shadow: 0 18px 48px rgba(0,0,0,0.35);
        pointer-events: auto;
        animation: toastIn 0.25s ease-out;
      }

      .toast-success {
        border-color: rgba(0,255,140,0.22);
        box-shadow: 0 18px 48px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,255,140,0.08) inset;
      }

      .toast-error {
        border-color: rgba(255,71,87,0.24);
        box-shadow: 0 18px 48px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,71,87,0.08) inset;
      }

      .toast-icon {
        width: 38px;
        height: 38px;
        border-radius: 12px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .toast-success .toast-icon {
        background: rgba(0,255,140,0.12);
        color: #00ff8c;
      }

      .toast-error .toast-icon {
        background: rgba(255,71,87,0.12);
        color: #ff6b7a;
      }

      .toast-copy { flex: 1; min-width: 0; }
      .toast-title {
        margin: 0 0 4px;
        color: #fff;
        font-size: 14px;
        font-weight: 700;
      }

      .toast-message {
        margin: 0;
        color: rgba(255,255,255,0.62);
        font-size: 13px;
        line-height: 1.5;
      }

      .toast-close {
        background: transparent;
        border: none;
        color: rgba(255,255,255,0.36);
        cursor: pointer;
        padding: 2px;
        line-height: 1;
        transition: color 0.2s ease;
      }

      .toast-close:hover { color: rgba(255,255,255,0.82); }

      @keyframes toastIn {
        from { opacity: 0; transform: translateY(-12px) scale(0.98); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
    `;
    document.head.appendChild(style);
    return () => {
      const s = document.getElementById('users-custom');
      if (s) s.remove();
    };
  }, []);

  useEffect(() => {
    if (!notice) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setNotice(null);
    }, 3500);

    return () => window.clearTimeout(timer);
  }, [notice]);

  const showNotice = (type, message) => {
    setNotice({
      type,
      message,
      title: type === 'success' ? 'Success' : 'Something went wrong',
    });
  };

  // 2. Fetch Data
  const fetchUsers = async (showErrorNotice = true) => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      const nextUsers = Array.isArray(data)
        ? data
        : Array.isArray(data?.users)
          ? data.users
          : Array.isArray(data?.user)
            ? data.user
            : [];

      setUsers(nextUsers);
      return nextUsers;
    } catch (error) {
      console.error('Failed to fetch users:', error);
      if (showErrorNotice) {
        showNotice('error', 'Unable to load users right now.');
      }
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview?.isObjectUrl) {
        URL.revokeObjectURL(imagePreview.url);
      }
    };
  }, [imagePreview]);

  // 3. Form Handlers
  const handleOpenModal = (user = null) => {
    if (imagePreview?.isObjectUrl) {
      URL.revokeObjectURL(imagePreview.url);
    }

    if (user) {
      setEditingUser(user);
      setImagePreview(user.image_url ? {
        url: user.image_url,
        label: 'Current profile image',
        isObjectUrl: false,
      } : null);
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role || 'user',
        image: null,
      });
    } else {
      setEditingUser(null);
      setImagePreview(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'user',
        image: null,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    if (imagePreview?.isObjectUrl) {
      URL.revokeObjectURL(imagePreview.url);
    }
    setImagePreview(null);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      const file = files?.[0] || null;

      if (imagePreview?.isObjectUrl) {
        URL.revokeObjectURL(imagePreview.url);
      }

      setImagePreview(file ? {
        url: URL.createObjectURL(file),
        label: file.name,
        isObjectUrl: true,
      } : editingUser?.image_url ? {
        url: editingUser.image_url,
        label: 'Current profile image',
        isObjectUrl: false,
      } : null);
      setFormData((prev) => ({ ...prev, image: file }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    // We MUST use FormData because we are sending a file (image)
    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('email', formData.email);
    submitData.append('role', formData.role);

    if (formData.password) submitData.append('password', formData.password);
    if (formData.image) submitData.append('image', formData.image);

    try {
      setSaving(true);
      if (editingUser) {
        await updateUser(editingUser.id, submitData);
      } else {
        await createUser(submitData);
      }

      await fetchUsers(false);
      handleCloseModal();

      window.setTimeout(() => {
        showNotice(
          'success',
          editingUser ? 'User updated successfully.' : 'User created successfully.',
        );
      }, 180);
    } catch (error) {
      console.error('Error saving user:', error);
      showNotice('error', error.response?.data?.message || 'Failed to save user.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (deleting) return;

    try {
      setDeleting(true);
      await deleteUser(id);
      await fetchUsers(false);
      showNotice('success', 'User deleted successfully.');
    } catch (error) {
      console.error('Error deleting user:', error);
      showNotice('error', error.response?.data?.message || 'Failed to delete user.');
    } finally {
      setDeleting(false);
    }
  };

  // Icons
  const EditIcon = () => (
    <svg
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
  );
  const DeleteIcon = () => (
    <svg
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
  );

  return (
    <div className="page-container">
      {notice && (
        <div className="toast-stack">
          <div className={`toast-card ${notice.type === 'success' ? 'toast-success' : 'toast-error'}`}>
            <div className="toast-icon">
              {notice.type === 'success' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5"></path>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              )}
            </div>

            <div className="toast-copy">
              <p className="toast-title">{notice.title}</p>
              <p className="toast-message">{notice.message}</p>
            </div>

            <button
              type="button"
              className="toast-close"
              onClick={() => setNotice(null)}
              aria-label="Close notification"
            >
              x
            </button>
          </div>
        </div>
      )}

      <div className="page-header">
        <div className="page-heading">
          <h1 className="page-title">User Management</h1>
          <span className="total-users-badge">
            Total users <strong>{users.length}</strong>
          </span>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          + Add User
        </button>
      </div>

      <div className="glass-card">
        {loading ? (
          <Loading label="Loading users..." variant="page" />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th className="row-number">#</th>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.id}>
                  <td className="row-number">{index + 1}</td>
                  <td>
                    <div className="user-cell">
                      {user.image_url ? (
                        <img
                          src={user.image_url}
                          alt={user.name}
                          className="avatar-img"
                        />
                      ) : (
                        <div className="avatar-placeholder">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <strong style={{ color: '#fff', fontWeight: 600 }}>
                        {user.name}
                      </strong>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span
                      className={`role-badge ${user.role === 'admin' ? 'role-admin' : 'role-user'}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <div
                      className="action-btns"
                      style={{ justifyContent: 'flex-end' }}
                    >
                      <button
                        className="btn-icon btn-edit"
                        onClick={() => handleOpenModal(user)}
                        title="Edit"
                      >
                        <EditIcon />
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => setDeleteTarget(user)}
                        title="Delete"
                      >
                        <DeleteIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    style={{ textAlign: 'center', padding: '32px 0' }}
                  >
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Sliding Glass Modal */}
      <div className={`modal-overlay ${isModalOpen ? 'open' : ''}`}>
        <div className="modal-content">
          <h2
            style={{
              fontFamily: 'Syne, sans-serif',
              color: '#fff',
              marginTop: 0,
              marginBottom: '24px',
            }}
          >
            {editingUser ? 'Edit User' : 'Create New User'}
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="user-name">Full Name</label>
              <input
                id="user-name"
                type="text"
                name="name"
                className="form-input"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="user-email">Email Address</label>
              <input
                id="user-email"
                type="email"
                name="email"
                className="form-input"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="user-password">
                Password{' '}
                {editingUser && (
                  <span style={{ textTransform: 'none', opacity: 0.5 }}>
                    (Leave blank to keep current)
                  </span>
                )}
              </label>
              <input
                id="user-password"
                type="password"
                name="password"
                className="form-input"
                required={!editingUser}
                minLength="3"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="user-role">System Role</label>
              <select
                id="user-role"
                name="role"
                className="form-select"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="user">Standard User</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="user-image">
                Profile Image{' '}
                {editingUser && (
                  <span style={{ textTransform: 'none', opacity: 0.5 }}>
                    (Optional)
                  </span>
                )}
              </label>
              <input
                id="user-image"
                type="file"
                name="image"
                className="form-input"
                accept="image/*"
                onChange={handleChange}
                style={{ padding: '9px 16px' }}
              />
              <div className="profile-preview">
                {imagePreview?.url ? (
                  <img
                    src={imagePreview.url}
                    alt={`${formData.name || 'User'} profile preview`}
                    className="profile-preview-img"
                  />
                ) : (
                  <div className="profile-preview-placeholder">
                    {(formData.name || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="profile-preview-title">
                    {imagePreview?.isObjectUrl ? 'New selected image' : imagePreview?.label || 'No profile image selected'}
                  </p>
                  <p className="profile-preview-copy">
                    {imagePreview?.isObjectUrl
                      ? imagePreview.label
                      : editingUser?.image_url
                        ? 'This is the image currently saved for this user.'
                        : 'Choose an image file to preview it before saving.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-cancel"
                disabled={saving}
                onClick={handleCloseModal}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? (
                  <Loading label={editingUser ? 'Saving...' : 'Creating...'} />
                ) : (
                  editingUser ? 'Save Changes' : 'Create User'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className={`modal-overlay ${deleteTarget ? 'open' : ''}`}>
        <div className="modal-content">
          <h2
            style={{
              fontFamily: 'Syne, sans-serif',
              color: '#fff',
              marginTop: 0,
              marginBottom: '12px',
            }}
          >
            Delete user?
          </h2>

          <p
            style={{
              color: 'rgba(255,255,255,0.62)',
              lineHeight: 1.6,
              marginBottom: '24px',
            }}
          >
            This will permanently remove{' '}
            <strong style={{ color: '#fff' }}>{deleteTarget?.name}</strong> from the system.
          </p>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-cancel"
              disabled={deleting}
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-danger"
              disabled={deleting}
              onClick={async () => {
                const id = deleteTarget?.id;
                if (id) {
                  await handleDelete(id);
                }
                setDeleteTarget(null);
              }}
            >
              {deleting ? <Loading label="Deleting..." /> : 'Delete User'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserList;
