import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import Unav from './Unav';

/* ────────────────────────────────────────────────
   Helpers
──────────────────────────────────────────────── */

// Nominatim: search for place suggestions (free, no key)
const searchPlaces = async (query) => {
    if (!query || query.length < 3) return [];
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&countrycodes=in`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    return res.json();
};

// Nominatim: reverse geocode coordinates → place name
const reverseGeocode = async (lat, lon) => {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    const data = await res.json();
    return data.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
};

// OSRM: real road distance in km between two lat/lon points
const getRoadDistance = async (from, to) => {
    const url = `https://router.project-osrm.org/route/v1/driving/${from.lon},${from.lat};${to.lon},${to.lat}?overview=false`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.routes && data.routes[0]) {
        return (data.routes[0].distance / 1000).toFixed(2); // metres → km
    }
    return null;
};

/* ────────────────────────────────────────────────
   Location Input Sub-component
──────────────────────────────────────────────── */
function LocationInput({ id, label, icon, value, onSelect, placeholder, showCurrentBtn = false }) {
    const [query, setQuery] = useState(value || '');
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [locating, setLocating] = useState(false);
    const debounceRef = useRef(null);
    const wrapperRef = useRef(null);

    // Sync external value changes (e.g. from geolocation)
    useEffect(() => { setQuery(value || ''); }, [value]);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => { if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleInput = (e) => {
        const val = e.target.value;
        setQuery(val);
        clearTimeout(debounceRef.current);
        if (val.length < 3) { setSuggestions([]); setOpen(false); return; }
        debounceRef.current = setTimeout(async () => {
            setLoading(true);
            const results = await searchPlaces(val);
            setSuggestions(results);
            setOpen(true);
            setLoading(false);
        }, 350);
    };

    const handleSelect = (place) => {
        setQuery(place.display_name);
        setSuggestions([]);
        setOpen(false);
        onSelect({ name: place.display_name, lat: parseFloat(place.lat), lon: parseFloat(place.lon) });
    };

    const handleCurrentLocation = () => {
        if (!navigator.geolocation) return alert('Geolocation not supported by your browser.');
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude: lat, longitude: lon } = pos.coords;
                const name = await reverseGeocode(lat, lon);
                setQuery(name);
                onSelect({ name, lat, lon });
                setLocating(false);
            },
            () => { alert('Could not detect your location. Please allow location access.'); setLocating(false); }
        );
    };

    return (
        <div className="form-group" ref={wrapperRef} style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label className="form-label" style={{ margin: 0 }}>{icon} {label}</label>
                {showCurrentBtn && (
                    <button type="button" onClick={handleCurrentLocation} disabled={locating}
                        style={{ fontSize: '0.78rem', background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.25)', borderRadius: '6px', color: '#f5a623', padding: '0.25rem 0.6rem', cursor: 'pointer', transition: 'all 0.15s' }}>
                        {locating ? '📡 Detecting…' : '📍 Use My Location'}
                    </button>
                )}
            </div>

            <input id={id} className="form-control" type="text" value={query} placeholder={placeholder}
                onChange={handleInput} onFocus={() => suggestions.length > 0 && setOpen(true)} required autoComplete="off" />

            {loading && (
                <div style={{ position: 'absolute', right: '12px', top: '38px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>⏳</div>
            )}

            {open && suggestions.length > 0 && (
                <ul style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 999,
                    background: '#1a1f3c', border: '1px solid rgba(245,166,35,0.25)',
                    borderRadius: '10px', margin: '0.25rem 0', padding: 0, listStyle: 'none',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)', maxHeight: '220px', overflowY: 'auto',
                }}>
                    {suggestions.map((s, i) => (
                        <li key={i} onClick={() => handleSelect(s)}
                            style={{ padding: '0.65rem 1rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-light)', borderBottom: i < suggestions.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', transition: 'background 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,166,35,0.08)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            📍 {s.display_name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

/* ────────────────────────────────────────────────
   Main BookCab Page
──────────────────────────────────────────────── */
function BookCab() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [car, setCar] = useState(null);
    const [bookingDate, setBookingDate] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Location state
    const [pickup, setPickup] = useState({ name: '', lat: null, lon: null });
    const [drop, setDrop] = useState({ name: '', lat: null, lon: null });
    const [distance, setDistance] = useState(null);
    const [calcLoading, setCalcLoading] = useState(false);

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

    // Recalculate distance whenever both locations are set
    const recalcDistance = useCallback(async (p, d) => {
        if (!p.lat || !d.lat) return;
        setCalcLoading(true);
        setDistance(null);
        const km = await getRoadDistance(p, d);
        setDistance(km ? parseFloat(km) : null);
        setCalcLoading(false);
    }, []);

    const handlePickupSelect = (place) => {
        setPickup(place);
        recalcDistance(place, drop);
    };

    const handleDropSelect = (place) => {
        setDrop(place);
        recalcDistance(pickup, place);
    };

    const estimatedFare = car && distance ? (distance * car.pricePerKm).toFixed(2) : null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!pickup.name) return setError('Please select a pickup location.');
        if (!drop.name) return setError('Please select a drop location.');
        if (!bookingDate) return setError('Please select a booking date.');
        setError('');
        setSuccess('');
        setSubmitting(true);
        try {
            await API.post('/api/bookings/book', {
                carId: id,
                pickup: pickup.name,
                drop: drop.name,
                bookingDate,
                distance: distance || 10,
            });
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

    const CAB_ICONS = { Mini: '🚗', Sedan: '🚕', SUV: '🚙', Premium: '🏎️' };

    return (
        <div>
            <Unav />
            <div className="page-container" style={{ maxWidth: '700px' }}>
                <button onClick={() => navigate('/cabs')} className="btn-secondary-custom" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                    ← Back to Cabs
                </button>

                {/* Car summary card */}
                {car && (
                    <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ fontSize: '3rem' }}>{CAB_ICONS[car.carType] || '🚖'}</div>
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

                        {/* Pickup */}
                        <LocationInput
                            id="book-pickup"
                            label="Pickup Location"
                            icon="📍"
                            placeholder="Search your pickup point…"
                            value={pickup.name}
                            onSelect={handlePickupSelect}
                            showCurrentBtn={true}
                        />

                        {/* Drop */}
                        <LocationInput
                            id="book-drop"
                            label="Drop Location"
                            icon="🏁"
                            placeholder="Search destination…"
                            value={drop.name}
                            onSelect={handleDropSelect}
                            showCurrentBtn={false}
                        />

                        {/* Date */}
                        <div className="form-group">
                            <label className="form-label">📅 Booking Date</label>
                            <input id="book-date" className="form-control" type="date" value={bookingDate}
                                onChange={(e) => setBookingDate(e.target.value)} required
                                min={new Date().toISOString().split('T')[0]} />
                        </div>

                        {/* Distance + Fare card (auto-calculated) */}
                        <div style={{ background: 'rgba(245,166,35,0.07)', border: '1px solid rgba(245,166,35,0.18)', borderRadius: '14px', padding: '1.1rem 1.4rem', marginBottom: '1.5rem' }}>
                            {calcLoading ? (
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>
                                    🔄 Calculating road distance…
                                </div>
                            ) : distance && car ? (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Road Distance</div>
                                        <div style={{ fontWeight: 700, color: '#fff', fontSize: '1.1rem' }}>📏 {distance} km</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Estimated Fare</div>
                                        <div style={{ fontWeight: 800, color: 'var(--accent)', fontSize: '1.6rem' }}>₹{estimatedFare}</div>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', textAlign: 'center' }}>
                                    🗺️ Select pickup and drop locations to see distance &amp; fare
                                </div>
                            )}
                        </div>

                        <button id="book-submit" className="btn-primary-custom" type="submit" disabled={submitting || calcLoading}>
                            {submitting ? 'Booking…' : '🚖 Confirm Booking'}
                        </button>
                    </form>
                </div>

                {/* Powered by notice */}
                <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    🗺️ Location search powered by <a href="https://www.openstreetmap.org" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>OpenStreetMap</a> &middot; Routing by <a href="https://project-osrm.org" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>OSRM</a>
                </div>
            </div>
        </div>
    );
}

export default BookCab;
