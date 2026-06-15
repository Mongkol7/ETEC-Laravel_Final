import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'sidebar-custom';
    style.textContent = `
      .sidebar-glass {
        position: fixed;
        top: 72px; /* Starts exactly below the Navbar */
        left: 0;
        bottom: 0;
        width: 260px;
        background: rgba(5, 5, 8, 0.4) !important;
        backdrop-filter: blur(20px) saturate(160%);
        -webkit-backdrop-filter: blur(20px) saturate(160%);
        border-right: 1px solid rgba(255, 255, 255, 0.06);
        z-index: 900;
        padding: 24px 16px;
        font-family: 'DM Sans', sans-serif;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      /* Custom Scrollbar for sidebar */
      .sidebar-glass::-webkit-scrollbar { width: 4px; }
      .sidebar-glass::-webkit-scrollbar-track { background: transparent; }
      .sidebar-glass::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 4px; }
      .sidebar-glass::-webkit-scrollbar-thumb:hover { background: rgba(0, 255, 140, 0.5); }

      .sidebar-section {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .section-label {
        font-size: 11px;
        font-weight: 700;
        color: rgba(255, 255, 255, 0.3);
        text-transform: uppercase;
        letter-spacing: 1.2px;
        padding-left: 12px;
        margin-bottom: 4px;
      }

      .menu-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 12px;
        border-radius: 10px;
        color: rgba(255, 255, 255, 0.55);
        text-decoration: none;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s ease;
        position: relative;
        border: 1px solid transparent;
      }

      .menu-item svg {
        color: rgba(255, 255, 255, 0.4);
        transition: color 0.2s ease;
      }

      .menu-item:hover {
        background: rgba(255, 255, 255, 0.03);
        color: #fff;
      }

      .menu-item:hover svg {
        color: #00ff8c;
      }

      .menu-item.active {
        background: linear-gradient(90deg, rgba(0, 255, 140, 0.08) 0%, rgba(0, 255, 140, 0) 100%);
        border: 1px solid rgba(0, 255, 140, 0.1);
        color: #fff;
      }

      .menu-item.active svg {
        color: #00ff8c;
      }

      /* Glowing left border for active state */
      .menu-item.active::before {
        content: '';
        position: absolute;
        left: -1px;
        top: 10%;
        height: 80%;
        width: 3px;
        background: #00ff8c;
        border-radius: 0 4px 4px 0;
        box-shadow: 0 0 10px rgba(0, 255, 140, 0.5);
      }

      .pro-card {
        margin-top: auto;
        background: linear-gradient(145deg, rgba(0, 255, 140, 0.05) 0%, rgba(0, 201, 255, 0.05) 100%);
        border: 1px solid rgba(0, 255, 140, 0.15);
        border-radius: 16px;
        padding: 16px;
        text-align: center;
        position: relative;
        overflow: hidden;
      }

      .pro-card::before {
        content: '';
        position: absolute;
        top: -50%; left: -50%;
        width: 200%; height: 200%;
        background: radial-gradient(circle, rgba(0, 255, 140, 0.1) 0%, transparent 50%);
        animation: rotate 10s linear infinite;
        pointer-events: none;
      }

      @keyframes rotate {
        100% { transform: rotate(360deg); }
      }

      .pro-card h4 {
        color: #fff;
        font-family: 'Syne', sans-serif;
        font-size: 15px;
        margin: 0 0 4px 0;
      }

      .pro-card p {
        color: rgba(255, 255, 255, 0.5);
        font-size: 12px;
        margin: 0 0 12px 0;
        line-height: 1.4;
      }

      .pro-btn {
        background: rgba(0, 255, 140, 0.1);
        border: 1px solid rgba(0, 255, 140, 0.3);
        color: #00ff8c;
        width: 100%;
        padding: 6px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;
      }

      .pro-btn:hover {
        background: #00ff8c;
        color: #050508;
        box-shadow: 0 0 16px rgba(0, 255, 140, 0.4);
      }
    `;
    document.head.appendChild(style);
    return () => {
      const s = document.getElementById('sidebar-custom');
      if (s) s.remove();
    };
  }, []);

  // Helper function to check if the path is active
  const isActive = (path) => (location.pathname === path ? 'active' : '');

  // Inline SVGs for the menu
  const Icons = {
    Dashboard: (
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
        <rect x="3" y="3" width="7" height="9" rx="1"></rect>
        <rect x="14" y="3" width="7" height="5" rx="1"></rect>
        <rect x="14" y="12" width="7" height="9" rx="1"></rect>
        <rect x="3" y="16" width="7" height="5" rx="1"></rect>
      </svg>
    ),
    Users: (
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
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    ),
    Products: (
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
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
        <line x1="12" y1="22.08" x2="12" y2="12"></line>
      </svg>
    ),
    Analytics: (
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
        <line x1="18" y1="20" x2="18" y2="10"></line>
        <line x1="12" y1="20" x2="12" y2="4"></line>
        <line x1="6" y1="20" x2="6" y2="14"></line>
      </svg>
    ),
    Settings: (
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
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
      </svg>
    ),
    Security: (
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
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
      </svg>
    ),
  };

  return (
    <aside className="sidebar-glass">
      {/* Main Menu Section */}
      <div className="sidebar-section">
        <span className="section-label">Main Menu</span>
        <Link to="/admin" className={`menu-item ${isActive('/admin')}`}>
          {Icons.Dashboard} Dashboard
        </Link>
        <Link to="/admin/users" className={`menu-item ${isActive('/admin/users')}`}>
          {Icons.Users} User Management
        </Link>
        <Link to="/admin/products" className={`menu-item ${isActive('/admin/products')}`}>
          {Icons.Products} Product Management
        </Link>
        <Link to="/analytics" className={`menu-item ${isActive('/analytics')}`}>
          {Icons.Analytics} Analytics
        </Link>
      </div>

      {/* Configuration Section */}
      <div className="sidebar-section">
        <span className="section-label">Configuration</span>
        <Link to="/settings" className={`menu-item ${isActive('/settings')}`}>
          {Icons.Settings} Settings
        </Link>
        <Link to="/security" className={`menu-item ${isActive('/security')}`}>
          {Icons.Security} Security Logs
        </Link>
      </div>

      {/* Upgrade / Promo Card */}
      <div className="pro-card">
        <h4>MK7 Pro</h4>
        <p>Unlock advanced analytics and custom reporting.</p>
        <button className="pro-btn">Upgrade Now</button>
      </div>
    </aside>
  );
};

export default Sidebar;
