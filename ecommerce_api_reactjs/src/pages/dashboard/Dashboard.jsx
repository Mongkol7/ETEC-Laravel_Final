import React, { useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Mock Data for the Chart
const revenueData = [
  { name: 'Jan', revenue: 4000, orders: 2400 },
  { name: 'Feb', revenue: 3000, orders: 1398 },
  { name: 'Mar', revenue: 9800, orders: 4800 },
  { name: 'Apr', revenue: 3908, orders: 3908 },
  { name: 'May', revenue: 14800, orders: 6800 },
  { name: 'Jun', revenue: 18900, orders: 8300 },
];

// Mock Data for Analytics
const topProducts = [
  {
    id: 'PRD-01',
    name: 'Quantum Mechanical Keyboard',
    sales: 428,
    revenue: '$64,200',
    stock: 'In Stock',
  },
  {
    id: 'PRD-02',
    name: 'Neon Desk Mat (XL)',
    sales: 382,
    revenue: '$11,460',
    stock: 'Low Stock',
  },
  {
    id: 'PRD-03',
    name: 'Ergo-Mesh Chair',
    sales: 145,
    revenue: '$50,750',
    stock: 'In Stock',
  },
  {
    id: 'PRD-04',
    name: 'OLED Monitor Light Bar',
    sales: 98,
    revenue: '$8,820',
    stock: 'Out of Stock',
  },
];

const recentUsers = [
  {
    name: 'Alex Mercer',
    role: 'Pro Member',
    time: '2 mins ago',
    color: '#00ff8c',
  },
  {
    name: 'Sarah Jenkins',
    role: 'Basic',
    time: '1 hour ago',
    color: '#00c9ff',
  },
  {
    name: 'Marcus Chen',
    role: 'Enterprise',
    time: '3 hours ago',
    color: '#a200ff',
  },
  {
    name: 'Elena Rostova',
    role: 'Pro Member',
    time: '5 hours ago',
    color: '#ff9100',
  },
];

const Dashboard = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'dashboard-custom';
    style.textContent = `
      .dashboard-container {
        font-family: 'DM Sans', sans-serif;
        display: flex;
        flex-direction: column;
        gap: 24px;
        animation: fadeIn 0.4s ease-out;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* Typography & Headers */
      .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
      .page-title { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; margin: 0; color: #fff; letter-spacing: -0.5px; }
      .page-subtitle { color: rgba(255, 255, 255, 0.4); font-size: 14px; margin-top: 4px; }
      .section-title { font-family: 'Syne', sans-serif; color: #fff; font-size: 18px; font-weight: 700; margin: 0 0 20px 0; }

      .action-btn {
        background: linear-gradient(135deg, rgba(0, 255, 140, 0.1) 0%, rgba(0, 201, 255, 0.1) 100%);
        border: 1px solid rgba(0, 255, 140, 0.3);
        color: #00ff8c;
        padding: 8px 16px;
        border-radius: 10px;
        font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s;
      }
      .action-btn:hover { background: #00ff8c; color: #050508; box-shadow: 0 4px 16px rgba(0, 255, 140, 0.3); }

      /* Glass Cards */
      .glass-card {
        background: rgba(255, 255, 255, 0.02);
        backdrop-filter: blur(20px) saturate(160%); -webkit-backdrop-filter: blur(20px) saturate(160%);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 16px; padding: 24px;
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .glass-card:hover { border-color: rgba(0, 255, 140, 0.15); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3); }

      /* Stats Grid */
      .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; }
      .stat-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
      .stat-title { color: rgba(255, 255, 255, 0.5); font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
      .stat-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
      .icon-green { background: rgba(0, 255, 140, 0.1); color: #00ff8c; }
      .icon-blue { background: rgba(0, 201, 255, 0.1); color: #00c9ff; }
      .icon-purple { background: rgba(162, 0, 255, 0.1); color: #a200ff; }
      .stat-value { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 700; color: #fff; margin-bottom: 8px; }
      .stat-trend { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 500; }
      .trend-up { color: #00ff8c; } .trend-down { color: #ff4757; } .trend-text { color: rgba(255, 255, 255, 0.3); }

      /* Layout Grids */
      .middle-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; }
      @media (max-width: 1024px) { .middle-grid { grid-template-columns: 1fr; } }

      /* Tables */
      .data-table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
      .data-table th { text-align: left; color: rgba(255, 255, 255, 0.3); font-weight: 500; padding-bottom: 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
      .data-table td { padding: 16px 0; color: rgba(255, 255, 255, 0.7); border-bottom: 1px solid rgba(255, 255, 255, 0.03); }
      .data-table tr:last-child td { border-bottom: none; padding-bottom: 0; }
      
      .status-badge { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
      .badge-good { background: rgba(0, 255, 140, 0.1); color: #00ff8c; }
      .badge-warn { background: rgba(255, 145, 0, 0.1); color: #ff9100; }
      .badge-bad { background: rgba(255, 71, 87, 0.1); color: #ff4757; }

      /* User Profiles List */
      .user-list { display: flex; flex-direction: column; gap: 16px; }
      .user-item { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 12px; background: rgba(255,255,255,0.01); border: 1px solid transparent; transition: all 0.2s; }
      .user-item:hover { background: rgba(255,255,255,0.03); border-color: rgba(255,255,255,0.05); }
      .user-avatar { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; color: #050508; }
      .user-info { flex: 1; }
      .user-name { color: #fff; font-weight: 600; font-size: 14px; margin-bottom: 2px; }
      .user-role { color: rgba(255,255,255,0.4); font-size: 12px; }
      .user-time { color: rgba(255,255,255,0.2); font-size: 11px; }

      /* Custom Recharts Tooltip */
      .custom-tooltip { background: rgba(5,5,8,0.9); border: 1px solid rgba(0,255,140,0.3); border-radius: 8px; padding: 12px; color: #fff; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
      .tooltip-label { color: rgba(255,255,255,0.5); font-size: 12px; margin-bottom: 4px; }
      .tooltip-value { color: #00ff8c; font-weight: 700; font-size: 16px; font-family: 'Syne', sans-serif; }
    `;
    document.head.appendChild(style);
    return () => {
      const s = document.getElementById('dashboard-custom');
      if (s) s.remove();
    };
  }, []);

  // Custom tooltip for the Recharts graph
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <div className="tooltip-label">{label}</div>
          <div className="tooltip-value">
            ${payload[0].value.toLocaleString()}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="dashboard-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <div className="page-subtitle">
            Welcome back, here's what's happening today.
          </div>
        </div>
        <button className="action-btn">+ Export Report</button>
      </div>

      {/* Top Stats Grid */}
      <div className="stats-grid">
        <div className="glass-card">
          <div className="stat-header">
            <span className="stat-title">Total Revenue</span>
            <div className="stat-icon icon-green">
              <svg
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
          </div>
          <div className="stat-value">$124,563.00</div>
          <div className="stat-trend trend-up">
            <svg
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M23 6l-9.5 9.5-5-5L1 18"></path>
              <path d="M17 6h6v6"></path>
            </svg>
            12.5% <span className="trend-text">vs last month</span>
          </div>
        </div>

        <div className="glass-card">
          <div className="stat-header">
            <span className="stat-title">Active Orders</span>
            <div className="stat-icon icon-blue">
              <svg
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
            </div>
          </div>
          <div className="stat-value">842</div>
          <div className="stat-trend trend-up">
            <svg
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M23 6l-9.5 9.5-5-5L1 18"></path>
              <path d="M17 6h6v6"></path>
            </svg>
            8.2% <span className="trend-text">vs last month</span>
          </div>
        </div>

        <div className="glass-card">
          <div className="stat-header">
            <span className="stat-title">New Signups</span>
            <div className="stat-icon icon-purple">
              <svg
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
          </div>
          <div className="stat-value">3,219</div>
          <div className="stat-trend trend-down">
            <svg
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M23 18l-9.5-9.5-5 5L1 6"></path>
              <path d="M17 18h6v-6"></path>
            </svg>
            2.4% <span className="trend-text">vs last month</span>
          </div>
        </div>
      </div>

      {/* Middle Grid: Graph & User Profiles */}
      <div className="middle-grid">
        {/* The Recharts Graph */}
        <div className="glass-card">
          <h3 className="section-title">Revenue Overview</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <AreaChart
                data={revenueData}
                margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00ff8c" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00ff8c" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="rgba(255,255,255,0.3)"
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.3)"
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `$${val / 1000}k`}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#00ff8c"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Profiles */}
        <div className="glass-card">
          <h3 className="section-title">Recent Users</h3>
          <div className="user-list">
            {recentUsers.map((user, idx) => (
              <div key={idx} className="user-item">
                <div className="user-avatar" style={{ background: user.color }}>
                  {user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div className="user-info">
                  <div className="user-name">{user.name}</div>
                  <div className="user-role">{user.role}</div>
                </div>
                <div className="user-time">{user.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Full-Width Table: Products */}
      <div className="glass-card">
        <h3 className="section-title">Top Performing Products</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Product Name</th>
              <th>Total Sales</th>
              <th>Revenue Generated</th>
              <th>Stock Status</th>
            </tr>
          </thead>
          <tbody>
            {topProducts.map((prod) => (
              <tr key={prod.id}>
                <td style={{ color: 'rgba(255,255,255,0.4)' }}>{prod.id}</td>
                <td style={{ color: '#fff', fontWeight: 500 }}>{prod.name}</td>
                <td>{prod.sales} units</td>
                <td style={{ color: '#00ff8c', fontWeight: 600 }}>
                  {prod.revenue}
                </td>
                <td>
                  <span
                    className={`status-badge ${prod.stock === 'In Stock' ? 'badge-good' : prod.stock === 'Low Stock' ? 'badge-warn' : 'badge-bad'}`}
                  >
                    {prod.stock}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
