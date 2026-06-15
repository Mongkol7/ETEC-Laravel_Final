import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';

function AdminLayout() {
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'layout-custom';
    style.textContent = `
      /* 1. This fixes the white screen issue! */
      body {
        margin: 0;
        background: #050508; 
        color: #fff;
        font-family: 'DM Sans', sans-serif;
      }

      .admin-layout {
        display: flex;
        min-height: 100vh;
      }

      .admin-main {
        flex: 1;
        /* Offset by the Sidebar's 260px width */
        margin-left: 260px; 
        display: flex;
        flex-direction: column;
        min-height: 100vh;
      }

      .outlet-container {
        /* Clear the fixed 72px Navbar */
        margin-top: 72px; 
        padding: 32px;
        /* flex: 1 pushes the footer to the bottom of the screen */
        flex: 1; 
      }
    `;
    document.head.appendChild(style);
    return () => {
      const s = document.getElementById('layout-custom');
      if (s) s.remove();
    };
  }, []);

  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-main">
        <Navbar />

        {/* Added this wrapper so the content doesn't hide behind the fixed Navbar */}
        <div className="outlet-container">
          <Outlet />
          {/* outlet is a placeholder for the child components(like dashboard,users,analytics,settings) */}
        </div>

        <Footer />
      </main>
    </div>
  );
}

export default AdminLayout;
