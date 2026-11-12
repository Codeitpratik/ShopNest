import React, { useEffect, useState, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const MAX_TRIES = 4;       // how many times to try before showing an error
const WAIT_MS = 6000;      // pause between tries (free Render servers need ~30-60s to wake up)
const TIMEOUT_MS = 20000;  // give up on a single request after 20 seconds

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  const fetchStats = useCallback(async () => {
    setError('');
    setStats(null);

    for (let i = 1; i <= MAX_TRIES; i++) {
      setAttempt(i);
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

      try {
        const res = await fetch('/api/analytics', {
          headers: { Authorization: `Bearer ${user.token}` },
          signal: controller.signal
        });
        clearTimeout(timer);

        // A sleeping server often returns an HTML page, not JSON. Treat that as "try again".
        const isJson = (res.headers.get('content-type') || '').includes('application/json');
        if (!isJson) throw new Error('Server is not ready yet');

        const data = await res.json();

        if (res.status === 401) {
          logout();
          navigate('/login');
          return;
        }
        if (!res.ok) throw new Error(data.message || 'Could not load metrics');

        setStats({
          totalOrders: Number(data.totalOrders) || 0,
          totalProducts: Number(data.totalProducts) || 0,
          totalUsers: Number(data.totalUsers) || 0,
          totalRevenue: Number(data.totalRevenue) || 0
        });
        return;
      } catch (err) {
        clearTimeout(timer);
        if (i === MAX_TRIES) {
          setError(err.name === 'AbortError' ? 'The server took too long to respond.' : err.message);
          return;
        }
        await new Promise((r) => setTimeout(r, WAIT_MS));
      }
    }
  }, [user, navigate, logout]);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchStats();
  }, [user, navigate, fetchStats]);

  const cardStyle = {
    padding: '25px',
    background: '#18181b',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '10px'
  };

  const numberStyle = { fontSize: '2.5rem', fontWeight: '700', color: '#f97316' };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '5px' }}>
        <img src="/ShopNestLogo.png" alt="Logo" style={{ height: '40px', width: '40px', borderRadius: '8px', objectFit: 'cover', filter: 'drop-shadow(0 0px 10px rgba(249, 115, 22, 0.3))' }} />
        <h2 style={{ margin: 0 }}>Admin Dashboard</h2>
      </div>
      <p style={{ color: '#a1a1aa', marginBottom: '30px', fontSize: '1.1rem' }}>Welcome back, <span style={{ color: '#fff' }}>{user?.name}</span></p>

      {stats ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div style={cardStyle}><h4 style={{ color: '#a1a1aa', fontSize: '1rem' }}>Total Orders</h4><div style={numberStyle}>{stats.totalOrders}</div></div>
          <div style={cardStyle}><h4 style={{ color: '#a1a1aa', fontSize: '1rem' }}>Total Products</h4><div style={numberStyle}>{stats.totalProducts}</div></div>
          <div style={cardStyle}><h4 style={{ color: '#a1a1aa', fontSize: '1rem' }}>Total Users</h4><div style={numberStyle}>{stats.totalUsers}</div></div>
          <div style={cardStyle}><h4 style={{ color: '#a1a1aa', fontSize: '1rem' }}>Total Revenue</h4><div style={numberStyle}>₹{stats.totalRevenue.toFixed(2)}</div></div>
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', margin: '50px 0', color: '#f87171' }}>
          <p>Could not load metrics: {error}</p>
          <button className="btn" onClick={fetchStats}>Try again</button>
        </div>
      ) : (
        <div style={{ textAlign: 'center', margin: '50px 0', color: '#f97316' }}>
          <p>Loading metrics...</p>
          {attempt > 1 && (
            <p style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>
              The server is waking up. This can take up to a minute (try {attempt} of {MAX_TRIES}).
            </p>
          )}
        </div>
      )}

      <div style={{ marginTop: '40px', padding: '30px', background: '#18181b', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <h3 style={{ marginBottom: '25px', color: '#f97316' }}>Administrative Controls</h3>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <button className="btn" onClick={() => navigate('/admin/add-product')}>+ Add Product</button>
          <button className="btn" onClick={() => navigate('/admin/products')} style={{ background: '#3f3f46' }}>📦 Manage Products</button>
          <button className="btn" onClick={() => navigate('/admin/orders')} style={{ background: '#3f3f46' }}>🚚 Manage Orders</button>
          <button className="btn" onClick={() => navigate('/admin/users')} style={{ background: '#3f3f46' }}>👥 Users Directory</button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
