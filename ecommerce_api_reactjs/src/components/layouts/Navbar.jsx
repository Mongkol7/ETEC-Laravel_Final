import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import ConfirmModal from '../common/ConfirmModal';


const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const accountName = user?.name || user?.username || user?.email || 'User';
  const initials = accountName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'U';

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'navbar-custom';
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap');

      .navbar-glass {
        position: fixed;
        top: 0; left: 0; right: 0;
        height: 72px;
        background: rgba(5, 5, 8, 0.6) !important;
        backdrop-filter: blur(24px) saturate(160%);
        -webkit-backdrop-filter: blur(24px) saturate(160%);
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        z-index: 1000;
        display: flex;
        align-items: center;
        padding: 0 32px;
        font-family: 'DM Sans', sans-serif;
      }

      /* ── Brand ── */
      .nav-brand {
        font-family: 'Syne', sans-serif;
        font-size: 22px;
        font-weight: 800;
        text-decoration: none;
        letter-spacing: -0.5px;
        color: #fff;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .nav-brand-mark {
        width: 34px;
        height: 34px;
        border-radius: 10px;
        background: linear-gradient(135deg, #00ff8c, #00d4aa);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 16px rgba(0,255,140,.3);
        flex-shrink: 0;
      }

      .nav-brand span {
        background: linear-gradient(135deg, #00ff8c 0%, #00c9ff 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      /* ── Nav links ── */
      .nav-links {
        display: flex;
        align-items: center;
        gap: 32px;
        margin-left: 48px;
      }

      .nav-link-item {
        color: rgba(255, 255, 255, 0.5);
        text-decoration: none;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s ease;
        position: relative;
      }

      .nav-link-item:hover,
      .nav-link-item.active {
        color: #050508;
      }

      .nav-link-item::after {
        content: '';
        position: absolute;
        bottom: -6px;
        left: 0;
        width: 100%;
        height: 2px;
        background: linear-gradient(90deg, #00ff8c, #00c9ff);
        transform: scaleX(0);
        transform-origin: right;
        transition: transform 0.3s ease;
        border-radius: 2px;
      }

      .nav-link-item:hover::after,
      .nav-link-item.active::after {
        transform: scaleX(1);
        transform-origin: left;
      }

      /* ── Right actions ── */
      .nav-actions {
        margin-left: auto;
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .user-profile {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 6px 14px 6px 8px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 20px;
        color: #fff;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        text-decoration: none;
      }

      .user-profile:hover {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(0,255,140,.3);
        color: #fff;
      }

      .avatar {
        width: 26px;
        height: 26px;
        border-radius: 50%;
        background: linear-gradient(135deg, #00ff8c 0%, #00c9ff 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #050508;
        font-weight: 700;
        font-size: 11px;
        flex-shrink: 0;
        box-shadow: 0 2px 8px rgba(0,255,140,.3);
      }

      .logout-btn {
        background: transparent;
        border: none;
        color: rgba(255, 255, 255, 0.4);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 8px;
        border-radius: 9px;
        transition: all 0.2s;
      }

      .logout-btn:hover {
        color: #ff4757;
        background: rgba(255, 71, 87, 0.1);
      }
    `;
    document.head.appendChild(style);
    return () => {
      const s = document.getElementById('navbar-custom');
      if (s) s.remove();
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setShowLogoutModal(false);
  };

  return (
    <nav className="navbar-glass">
      <ConfirmModal 
        open={showLogoutModal}
        title="Logout"
        message="Are you sure you want to logout?"
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        confirmText="Logout"
      />
      {/* Brand / Logo */}
      <a 
        href="#" 
        className="nav-brand" 
        onClick={(e) => {
          e.preventDefault();
          window.location.reload();
        }}
      >
        <div className="nav-brand-mark">
          {/* Phone icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
            <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="2.5" />
          </svg>
        </div>
        MK7<span>.</span>
      </a>

      {/* Navigation Links removed as requested */}
      <div className="nav-links">
      </div>

      {/* Right Actions */}
      <div className="nav-actions">
        <div className="user-profile">
          <div className="avatar">{initials}</div>
          <span>{accountName}</span>
        </div>

        <button className="logout-btn" onClick={() => setShowLogoutModal(true)} title="Logout">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;