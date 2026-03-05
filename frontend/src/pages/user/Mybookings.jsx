import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import Unav from './Unav';

const STATUS_STYLES = {
    Pending: 'status-pending',
    Confirmed: 'status-confirmed',
    Completed: 'status-completed',
    Cancelled: 'status-cancelled',
};

function Mybookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem('token')) { navigate('/login'); return; }
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const { data } = await API.get('/api/bookings/mybookings');
            setBookings(data);
        } catch {
            setError('Failed to load bookings.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;
        try {
            await API.put(`/api/bookings/${bookingId}/cancel`);
            fetchBookings();
        } catch (err) {
            alert(err.response?.data?.message || 'Could not cancel booking.');
        }
    };

    return (
        <div>
            <Unav />
            <div className="page-container">
                <h1 className="page-title">My Bookings</h1>
                <p className="page-subtitle">Your complete ride history</p>

                {loading && <div className="spinner-wrapper"><div className="spinner-border text-warning" /></div>}
                {error && <div className="alert-error">{error}</div>}

                {!loading && bookings.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
                        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🗂️</div>
                        <div style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>No bookings yet</div>
                        <button onClick={() => navigate('/cabs')} className="btn-primary-custom" style={{ width: 'auto', padding: '0.7rem 2rem' }}>
                            Book Your First Ride
                        </button>
                    </div>
                )}

                {bookings.map((b) => (
                    <div className="booking-card" key={b._id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <div>
                                <div className="booking-title">
                                    {b.carId?.carName || 'Unknown Car'} · {b.carId?.carType}
                                </div>
                                {b.carId?.carno && (
                                    <div style={{ fontSize: '0.82rem', color: 'var(--accent)', fontWeight: 700, marginBottom: '0.25rem' }}>
                                        🚗 Reg: {b.carId.carno}
                                    </div>
                                )}
                                <div className="booking-meta">📍 {b.pickup} → {b.drop}</div>
                                <div className="booking-meta">📅 {b.bookingDate} &nbsp;⏰ {b.pickupTime}</div>
                                <div className="booking-meta">📏 {b.distance} km &nbsp;⏱ ~{b.estimatedDuration} min ride</div>
                                {b.status === 'Confirmed' && b.slotEndTime && (
                                    <div style={{ fontSize: '0.8rem', color: '#4ee377', marginTop: '0.25rem' }}>
                                        ✅ Your cab is reserved until {b.slotEndTime}
                                    </div>
                                )}
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span className={`status-badge ${STATUS_STYLES[b.status] || ''}`}>{b.status}</span>
                                <div className="booking-fare" style={{ marginTop: '0.5rem' }}>₹{b.fare}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                    {new Date(b.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                        {(b.status === 'Pending' || b.status === 'Confirmed') && (
                            <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.85rem' }}>
                                <button className="btn-danger-custom" onClick={() => handleCancel(b._id)} id={`cancel-${b._id}`}>
                                    Cancel Booking
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Mybookings;
