import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import Anav from './Anav';

const STATUS_STYLES = {
    Pending: 'status-pending',
    Confirmed: 'status-confirmed',
    Completed: 'status-completed',
    Cancelled: 'status-cancelled',
};

function Bookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem('token')) { navigate('/admin/login'); return; }
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const { data } = await API.get('/api/bookings/all');
            setBookings(data);
        } catch { navigate('/admin/login'); }
        finally { setLoading(false); }
    };

    const handleStatusChange = async (id, status) => {
        try {
            const { data } = await API.put(`/api/bookings/${id}/status`, { status });
            if (data.autoCancelled > 0) {
                alert(`✅ Booking confirmed!\n⚠️ ${data.autoCancelled} conflicting ride(s) for the same car and time slot were automatically cancelled.`);
            }
            fetchBookings();
        } catch (err) {
            alert(err.response?.data?.message || 'Update failed.');
        }
    };

    const filtered = bookings.filter((b) => {
        const matchSearch = (b.userId?.name || '').toLowerCase().includes(search.toLowerCase()) ||
            (b.carId?.carName || '').toLowerCase().includes(search.toLowerCase()) ||
            (b.pickup || '').toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'All' || b.status === statusFilter;
        return matchSearch && matchStatus;
    });

    return (
        <div>
            <Anav />
            <div className="page-container">
                <h1 className="page-title">All Bookings</h1>
                <p className="page-subtitle">Monitor and manage all platform bookings</p>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                    <input id="booking-search" className="form-control" style={{ maxWidth: '260px' }} type="text" placeholder="🔍 Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    <select id="booking-status-filter" className="form-control" style={{ maxWidth: '160px' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        {['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>

                {loading ? (
                    <div className="spinner-wrapper"><div className="spinner-border text-warning" /></div>
                ) : (
                    <div className="glass-card" style={{ overflow: 'auto' }}>
                        <table className="ucab-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>User</th>
                                    <th>Car</th>
                                    <th>Pickup → Drop</th>
                                    <th>Date &amp; Time</th>
                                    <th>Est. Ride</th>
                                    <th>Fare</th>
                                    <th>Status</th>
                                    <th>Update</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr><td colSpan={9} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No bookings found</td></tr>
                                ) : filtered.map((b, i) => (
                                    <tr key={b._id}>
                                        <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{b.userId?.name || '—'}</div>
                                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{b.userId?.email}</div>
                                        </td>
                                        <td>{b.carId?.carName || '—'} <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>({b.carId?.carType})</span></td>
                                        <td style={{ fontSize: '0.85rem' }}>{b.pickup} → {b.drop}</td>
                                        <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                            <div>{b.bookingDate}</div>
                                            <div style={{ color: '#fff', fontWeight: 600 }}>{b.pickupTime || '—'}</div>
                                        </td>
                                        <td style={{ fontSize: '0.82rem' }}>
                                            {b.estimatedDuration
                                                ? <span style={{ color: '#4ee377', fontWeight: 600 }}>~{b.estimatedDuration} min</span>
                                                : '—'
                                            }
                                            {b.distance ? <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{b.distance} km</div> : null}
                                        </td>
                                        <td style={{ color: 'var(--accent)', fontWeight: 700 }}>₹{b.fare}</td>
                                        <td><span className={`status-badge ${STATUS_STYLES[b.status] || ''}`}>{b.status}</span></td>
                                        <td>
                                            <select
                                                id={`status-${b._id}`}
                                                className="form-control"
                                                style={{ minWidth: '120px', padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
                                                value={b.status}
                                                onChange={(e) => handleStatusChange(b._id, e.target.value)}
                                            >
                                                {['Pending', 'Confirmed', 'Completed', 'Cancelled'].map((s) => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Bookings;
