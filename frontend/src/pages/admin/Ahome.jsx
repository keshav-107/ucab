import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import Anav from './Anav';

function Ahome() {
    const [stats, setStats] = useState({ users: 0, bookings: 0, cars: 0, revenue: 0 });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem('token')) { navigate('/admin/login'); return; }
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [usersRes, bookingsRes, carsRes] = await Promise.all([
                API.get('/api/users/all'),
                API.get('/api/bookings/all'),
                API.get('/api/cars/all'),
            ]);
            const revenue = bookingsRes.data
                .filter((b) => b.status === 'Completed')
                .reduce((sum, b) => sum + (b.fare || 0), 0);
            setStats({
                users: usersRes.data.length,
                bookings: bookingsRes.data.length,
                cars: carsRes.data.length,
                revenue: revenue.toFixed(0),
            });
        } catch {
            // token may be expired; will still show 0s
        } finally {
            setLoading(false);
        }
    };

    const statItems = [
        { icon: '👥', label: 'Total Users', value: stats.users, link: '/admin/users' },
        { icon: '🚖', label: 'Total Bookings', value: stats.bookings, link: '/admin/bookings' },
        { icon: '🚗', label: 'Total Cars', value: stats.cars, link: '/admin/cabs' },
        { icon: '₹', label: 'Revenue (Completed)', value: `₹${stats.revenue}`, link: '/admin/bookings' },
    ];

    const quickActions = [
        { icon: '➕', label: 'Add New Car', to: '/admin/addcar' },
        { icon: '📋', label: 'View Bookings', to: '/admin/bookings' },
        { icon: '👤', label: 'Manage Users', to: '/admin/users' },
        { icon: '🚗', label: 'Manage Cars', to: '/admin/cabs' },
    ];

    return (
        <div>
            <Anav />
            <div className="page-container">
                <h1 className="page-title">Admin Dashboard</h1>
                <p className="page-subtitle">Manage cabs, users, bookings, and monitor platform activity</p>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
                    {statItems.map((s, i) => (
                        <Link to={s.link} key={i} style={{ textDecoration: 'none' }}>
                            <div className="stat-card">
                                <div className="stat-icon">{s.icon}</div>
                                <div className="stat-value">{loading ? '—' : s.value}</div>
                                <div className="stat-label">{s.label}</div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Quick actions */}
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>Quick Actions</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
                    {quickActions.map((a, i) => (
                        <Link to={a.to} key={i} style={{ textDecoration: 'none' }}>
                            <div style={{ padding: '1.25rem', background: 'rgba(37,44,85,0.5)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', textAlign: 'center', transition: 'all 0.2s', cursor: 'pointer' }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(245,166,35,0.3)'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
                            >
                                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{a.icon}</div>
                                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-light)' }}>{a.label}</div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Ahome;
