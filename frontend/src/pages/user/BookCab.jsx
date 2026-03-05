import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import API from '../../api/axios';
import Unav from './Unav';

// Fix default Leaflet marker icons (broken in Vite builds)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom coloured markers (pickup = green, drop = red)
const makeIcon = (color) => new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});
const pickupIcon = makeIcon('green');
const dropIcon = makeIcon('red');

/* ──────────────────────────────────────────
   Free API helpers
────────────────────────────────────────── */
const reverseGeocode = async (lat, lon) => {
    const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
        { headers: { 'Accept-Language': 'en' } }
    );
    const d = await res.json();
    return d.display_name || `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
};

const searchPlaces = async (query) => {
    if (query.length < 3) return [];
    const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&countrycodes=in`,
        { headers: { 'Accept-Language': 'en' } }
    );
    return res.json();
};

const getRoadDistance = async (from, to) => {
    try {
        const res = await fetch(
            `https://router.project-osrm.org/route/v1/driving/${from.lon},${from.lat};${to.lon},${to.lat}?overview=false`
        );
        const d = await res.json();
        if (d.routes?.[0]) return parseFloat((d.routes[0].distance / 1000).toFixed(2));
    } catch { }
    return null;
};

/* ──────────────────────────────────────────
   Map Click Handler (inner component)
────────────────────────────────────────── */
function MapClickHandler({ mode, onPick }) {
    useMapEvents({
        click(e) {
            if (mode) onPick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

/* ──────────────────────────────────────────
   Location Search Input with Suggestions
────────────────────────────────────────── */
function LocationInput({ id, label, icon, value, onSelect, placeholder, showCurrentBtn }) {
    const [query, setQuery] = useState(value || '');
    const [suggestions, setSuggestions] = useState([]);
    const [searching, setSearching] = useState(false);
    const [open, setOpen] = useState(false);
    const [locating, setLocating] = useState(false);
    const debounceRef = useRef(null);
    const wrapRef = useRef(null);

    useEffect(() => { setQuery(value || ''); }, [value]);

    useEffect(() => {
        const close = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, []);

    const handleInput = (e) => {
        const val = e.target.value;
        setQuery(val);
        clearTimeout(debounceRef.current);
        if (val.length < 3) { setSuggestions([]); setOpen(false); return; }
        debounceRef.current = setTimeout(async () => {
            setSearching(true);
            const r = await searchPlaces(val);
            setSuggestions(r);
            setOpen(true);
            setSearching(false);
        }, 350);
    };

    const handleSelect = (place) => {
        setQuery(place.display_name);
        setSuggestions([]);
        setOpen(false);
        onSelect({ name: place.display_name, lat: parseFloat(place.lat), lon: parseFloat(place.lon) });
    };

    const handleCurrentLocation = () => {
        if (!navigator.geolocation) return alert('Geolocation not supported.');
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            async ({ coords }) => {
                const name = await reverseGeocode(coords.latitude, coords.longitude);
                setQuery(name);
                onSelect({ name, lat: coords.latitude, lon: coords.longitude });
                setLocating(false);
            },
            () => { alert('Could not detect location. Please allow access.'); setLocating(false); }
        );
    };

    return (
        <div ref={wrapRef} style={{ position: 'relative', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label className="form-label" style={{ margin: 0 }}>{icon} {label}</label>
                {showCurrentBtn && (
                    <button type="button" onClick={handleCurrentLocation} disabled={locating}
                        style={{ fontSize: '0.76rem', background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.25)', borderRadius: '6px', color: '#f5a623', padding: '0.22rem 0.6rem', cursor: 'pointer' }}>
                        {locating ? '📡 Detecting…' : '📍 My Location'}
                    </button>
                )}
            </div>
            <input id={id} className="form-control" type="text" value={query} placeholder={placeholder}
                onChange={handleInput} onFocus={() => suggestions.length > 0 && setOpen(true)}
                autoComplete="off" required />
            {searching && <span style={{ position: 'absolute', right: 12, top: 38, color: 'var(--text-muted)', fontSize: '0.8rem' }}>⏳</span>}
            {open && suggestions.length > 0 && (
                <ul style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 9999, background: '#1a1f3c', border: '1px solid rgba(245,166,35,0.25)', borderRadius: '10px', margin: '0.2rem 0', padding: 0, listStyle: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.6)', maxHeight: '200px', overflowY: 'auto' }}>
                    {suggestions.map((s, i) => (
                        <li key={i} onClick={() => handleSelect(s)}
                            style={{ padding: '0.6rem 1rem', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--text-light)', borderBottom: i < suggestions.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
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

/* ──────────────────────────────────────────
   Main BookCab Page
────────────────────────────────────────── */
function BookCab() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [car, setCar] = useState(null);
    const [bookingDate, setDate] = useState('');
    const [pickupTime, setPickupTime] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSub] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [pickup, setPickup] = useState({ name: '', lat: null, lon: null });
    const [drop, setDrop] = useState({ name: '', lat: null, lon: null });
    const [distance, setDistance] = useState(null);
    const [calcLoading, setCalc] = useState(false);

    // Which pin the next map click will set: 'pickup' | 'drop' | null
    const [pinMode, setPinMode] = useState(null);

    useEffect(() => {
        if (!localStorage.getItem('token')) { navigate('/login'); return; }
        API.get(`/api/cars/${id}`)
            .then(({ data }) => setCar(data))
            .catch(() => setError('Car not found.'))
            .finally(() => setLoading(false));
    }, [id]);

    const recalc = useCallback(async (p, d) => {
        if (!p.lat || !d.lat) return;
        setCalc(true);
        setDistance(null);
        const km = await getRoadDistance(p, d);
        setDistance(km);
        setCalc(false);
    }, []);

    const applyPickup = (loc) => { setPickup(loc); recalc(loc, drop); };
    const applyDrop = (loc) => { setDrop(loc); recalc(pickup, loc); };

    // Handle map pin drop
    const handleMapClick = useCallback(async (lat, lon) => {
        const name = await reverseGeocode(lat, lon);
        const loc = { name, lat, lon };
        if (pinMode === 'pickup') { applyPickup(loc); setPinMode(null); }
        if (pinMode === 'drop') { applyDrop(loc); setPinMode(null); }
    }, [pinMode, pickup, drop]);

    const estimatedFare = car && distance ? (distance * car.pricePerKm).toFixed(2) : null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!pickup.name) return setError('Please select a pickup location.');
        if (!drop.name) return setError('Please select a drop location.');
        setError(''); setSuccess(''); setSub(true);
        try {
            await API.post('/api/bookings/book', {
                carId: id, pickup: pickup.name, drop: drop.name,
                bookingDate, pickupTime, distance: distance || 10,
            });
            setSuccess('🎉 Cab booked successfully! Redirecting…');
            setTimeout(() => navigate('/mybookings'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Booking failed. Please try again.');
        } finally { setSub(false); }
    };

    const CAB_ICONS = { Mini: '🚗', Sedan: '🚕', SUV: '🚙', Premium: '🏎️' };
    const mapCenter = pickup.lat ? [pickup.lat, pickup.lon] : drop.lat ? [drop.lat, drop.lon] : [20.5937, 78.9629];

    if (loading) return <div><Unav /><div className="spinner-wrapper"><div className="spinner-border text-warning" /></div></div>;

    return (
        <div>
            <Unav />
            <div className="page-container" style={{ maxWidth: '800px' }}>
                <button onClick={() => navigate('/cabs')} className="btn-secondary-custom"
                    style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>← Back to Cabs</button>

                {/* Car summary */}
                {car && (
                    <div className="glass-card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.75rem', display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ fontSize: '2.8rem' }}>{CAB_ICONS[car.carType] || '🚖'}</div>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#fff' }}>{car.carName}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{car.carModel} · {car.carType} · {car.seats} seats</div>
                            <div style={{ color: 'var(--accent)', fontWeight: 700, marginTop: '0.2rem' }}>₹{car.pricePerKm}/km</div>
                            {car.carno && <div style={{ fontSize: '0.82rem', color: 'var(--accent)', marginTop: '0.15rem' }}>🚗 Reg: {car.carno}</div>}
                        </div>
                    </div>
                )}

                <h1 className="page-title" style={{ fontSize: '1.6rem', marginBottom: '1.5rem' }}>Book Your Ride</h1>

                {error && <div className="alert-error">{error}</div>}
                {success && <div className="alert-success">{success}</div>}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

                    {/* ── Left: Form ── */}
                    <div className="glass-card" style={{ padding: '1.75rem' }}>
                        <form onSubmit={handleSubmit}>
                            <LocationInput id="book-pickup" label="Pickup Location" icon="�" value={pickup.name}
                                placeholder="Search pickup…" onSelect={applyPickup} showCurrentBtn />

                            <LocationInput id="book-drop" label="Drop Location" icon="🔴" value={drop.name}
                                placeholder="Search destination…" onSelect={applyDrop} />

                            <div style={{ marginBottom: '1.25rem' }}>
                                <label className="form-label">📅 Booking Date</label>
                                <input id="book-date" className="form-control" type="date" value={bookingDate}
                                    onChange={(e) => setDate(e.target.value)} required
                                    min={new Date().toISOString().split('T')[0]} />
                            </div>
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label className="form-label">⏰ Pickup Time</label>
                                <input id="book-time" className="form-control" type="time" value={pickupTime}
                                    onChange={(e) => setPickupTime(e.target.value)} required />
                            </div>

                            {/* Distance + Fare */}
                            <div style={{ background: 'rgba(245,166,35,0.07)', border: '1px solid rgba(245,166,35,0.18)', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem', minHeight: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {calcLoading ? (
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>🔄 Calculating route…</span>
                                ) : distance && car ? (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Road Distance</div>
                                            <div style={{ fontWeight: 700, color: '#fff' }}>📏 {distance} km</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimated Fare</div>
                                            <div style={{ fontWeight: 800, color: 'var(--accent)', fontSize: '1.4rem' }}>₹{estimatedFare}</div>
                                        </div>
                                    </div>
                                ) : (
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
                                        Select both locations to see fare
                                    </span>
                                )}
                            </div>

                            <button id="book-submit" className="btn-primary-custom" type="submit"
                                disabled={submitting || calcLoading}>
                                {submitting ? 'Booking…' : '🚖 Confirm Booking'}
                            </button>
                        </form>
                    </div>

                    {/* ── Right: Map ── */}
                    <div>
                        {/* Pin mode controls */}
                        <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.75rem' }}>
                            <button type="button" id="pin-pickup" onClick={() => setPinMode(pinMode === 'pickup' ? null : 'pickup')}
                                style={{ flex: 1, padding: '0.55rem', borderRadius: '8px', border: '2px solid', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', transition: 'all 0.2s', background: pinMode === 'pickup' ? 'rgba(40,167,69,0.2)' : 'rgba(255,255,255,0.05)', borderColor: pinMode === 'pickup' ? '#28a745' : 'rgba(255,255,255,0.1)', color: pinMode === 'pickup' ? '#4ee377' : 'var(--text-muted)' }}>
                                {pinMode === 'pickup' ? '✋ Cancel' : '🟢 Drop Pickup Pin'}
                            </button>
                            <button type="button" id="pin-drop" onClick={() => setPinMode(pinMode === 'drop' ? null : 'drop')}
                                style={{ flex: 1, padding: '0.55rem', borderRadius: '8px', border: '2px solid', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', transition: 'all 0.2s', background: pinMode === 'drop' ? 'rgba(220,53,69,0.2)' : 'rgba(255,255,255,0.05)', borderColor: pinMode === 'drop' ? '#dc3545' : 'rgba(255,255,255,0.1)', color: pinMode === 'drop' ? '#ff6b7a' : 'var(--text-muted)' }}>
                                {pinMode === 'drop' ? '✋ Cancel' : '🔴 Drop Destination Pin'}
                            </button>
                        </div>

                        {pinMode && (
                            <div style={{ background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.3)', borderRadius: '10px', padding: '0.6rem 1rem', marginBottom: '0.75rem', fontSize: '0.85rem', color: '#f5a623', textAlign: 'center' }}>
                                🖱️ Click anywhere on the map to place the <strong>{pinMode}</strong> pin
                            </div>
                        )}

                        {/* Leaflet Map */}
                        <div style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
                            <MapContainer center={mapCenter} zoom={pickup.lat ? 13 : 5} style={{ height: '400px', width: '100%' }} key={`${pickup.lat}-${drop.lat}`}>
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                />
                                <MapClickHandler mode={pinMode} onPick={handleMapClick} />

                                {pickup.lat && (
                                    <Marker position={[pickup.lat, pickup.lon]} icon={pickupIcon}>
                                        <Popup>� <strong>Pickup</strong><br />{pickup.name}</Popup>
                                    </Marker>
                                )}
                                {drop.lat && (
                                    <Marker position={[drop.lat, drop.lon]} icon={dropIcon}>
                                        <Popup>🔴 <strong>Drop</strong><br />{drop.name}</Popup>
                                    </Marker>
                                )}
                                {pickup.lat && drop.lat && (
                                    <Polyline
                                        positions={[[pickup.lat, pickup.lon], [drop.lat, drop.lon]]}
                                        pathOptions={{ color: '#f5a623', weight: 3, dashArray: '8 6', opacity: 0.8 }}
                                    />
                                )}
                            </MapContainer>
                        </div>

                        <div style={{ textAlign: 'center', marginTop: '0.6rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            🗺️ Map by <a href="https://www.openstreetmap.org" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>OpenStreetMap</a> · Routing by <a href="https://project-osrm.org" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>OSRM</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BookCab;
