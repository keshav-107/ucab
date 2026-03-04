import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import Unav from './Unav';

function BookCab() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [car, setCar] = useState(null);
    const [form, setForm] = useState({ pickup: '', drop: '', bookingDate: '', distance: 10 });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (!localStorage.getItem('token')) { navigate('/login'); return; }
        fetchCar();
    }, [id]);

    const fetchCar = async () => {
        try {
            const { data } = await API.get(`/api/cars/${id}`);
            setCar(data);
        } catch {
            setError('Car not found.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const estimatedFare = car ? (parseFloat(form.distance) * car.pricePerKm).toFixed(2) : 0;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSubmitting(true);
        try {
            await API.post('/api/bookings/book', { carId: id, ...form });
            setSuccess('🎉 Cab booked successfully! Redirecting to your bookings...');
            setTimeout(() => navigate('/mybookings'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Booking failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div><Unav /><div className="spinner-wrapper"><div className="spinner-border text-warning" /></div></div>
    );

    return (
        <div>
            <Unav />
            <div className="page-container" style={{ maxWidth: '700px' }}>
                <button onClick={() => navigate('/cabs')} className="btn-secondary-custom" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                    ← Back to Cabs
                </button>

                {car && (
                    <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ fontSize: '3rem' }}>
                            {car.carType === 'Mini' ? '🚗' : car.carType === 'SUV' ? '🚙' : car.carType === 'Premium' ? '🏎️' : '🚕'}
                        </div>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#fff' }}>{car.carName}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{car.carModel} · {car.carType} · {car.seats} seats</div>
                            <div style={{ color: 'var(--accent)', fontWeight: 700, marginTop: '0.25rem' }}>₹{car.pricePerKm}/km</div>
                        </div>
                    </div>
                )}

                <h1 className="page-title" style={{ fontSize: '1.6rem', marginBottom: '1.5rem' }}>Book Your Ride</h1>

                {error && <div className="alert-error">{error}</div>}
                {success && <div className="alert-success">{success}</div>}

                <div className="glass-card" style={{ padding: '2rem' }}>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">📍 Pickup Location</label>
                            <input id="book-pickup" className="form-control" type="text" name="pickup" placeholder="e.g. Connaught Place, New Delhi" value={form.pickup} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">🏁 Drop Location</label>
                            <input id="book-drop" className="form-control" type="text" name="drop" placeholder="e.g. Indira Gandhi Airport" value={form.drop} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">📅 Booking Date</label>
                            <input id="book-date" className="form-control" type="date" name="bookingDate" value={form.bookingDate} onChange={handleChange} required min={new Date().toISOString().split('T')[0]} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">📏 Estimated Distance (km)</label>
                            <input id="book-distance" className="form-control" type="number" name="distance" placeholder="10" value={form.distance} onChange={handleChange} min={1} max={500} />
                        </div>

                        {/* Fare estimate */}
                        {car && (
                            <div style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Estimated Fare</div>
                                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent)' }}>₹{estimatedFare}</div>
                            </div>
                        )}

                        <button id="book-submit" className="btn-primary-custom" type="submit" disabled={submitting}>
                            {submitting ? 'Booking…' : '🚖 Confirm Booking'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default BookCab;
