import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import Unav from './Unav';

const CAB_ICONS = { Mini: '🚗', Sedan: '🚕', SUV: '🚙', Premium: '🏎️' };

function Cabs() {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('All');
    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem('token')) { navigate('/login'); return; }
        fetchCars();
    }, []);

    const fetchCars = async () => {
        try {
            const { data } = await API.get('/api/cars/all');
            setCars(data);
        } catch {
            setError('Failed to load cabs. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const filtered = cars.filter((c) => {
        const matchSearch = c.carName.toLowerCase().includes(search.toLowerCase()) ||
            c.carModel.toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === 'All' || c.carType === filter;
        return matchSearch && matchFilter && c.isAvailable;
    });

    return (
        <div>
            <Unav />
            <div className="page-container">
                <h1 className="page-title">Available Cabs</h1>
                <p className="page-subtitle">Choose from our wide range of cabs and book instantly</p>

                {/* Filters */}
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                    <input
                        id="cab-search"
                        className="form-control"
                        style={{ maxWidth: '280px' }}
                        type="text"
                        placeholder="🔍 Search cabs..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {['All', 'Mini', 'Sedan', 'SUV', 'Premium'].map((t) => (
                            <button
                                key={t}
                                id={`filter-${t.toLowerCase()}`}
                                onClick={() => setFilter(t)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '8px',
                                    border: '1px solid',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    fontSize: '0.85rem',
                                    background: filter === t ? 'rgba(245,166,35,0.2)' : 'rgba(255,255,255,0.05)',
                                    borderColor: filter === t ? 'rgba(245,166,35,0.5)' : 'rgba(255,255,255,0.1)',
                                    color: filter === t ? '#f5a623' : 'var(--text-muted)',
                                    transition: 'all 0.2s',
                                }}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                {loading && <div className="spinner-wrapper"><div className="spinner-border text-warning" /></div>}
                {error && <div className="alert-error">{error}</div>}

                {!loading && filtered.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚫</div>
                        <div>No cabs found. Try different filters.</div>
                    </div>
                )}

                <div className="cards-grid">
                    {filtered.map((car) => (
                        <div className="cab-card" key={car._id}>
                            {car.image ? (
                                <img
                                    className="cab-card-img"
                                    src={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${car.image}`}
                                    alt={car.carName}
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            ) : (
                                <div className="cab-card-img-placeholder">
                                    {CAB_ICONS[car.carType] || '🚖'}
                                </div>
                            )}
                            <div className="cab-card-body">
                                <div className="cab-card-title">{car.carName}</div>
                                <div className="cab-card-model">{car.carModel}</div>
                                <div className="cab-badges">
                                    <span className="badge-type">{car.carType}</span>
                                    <span className="badge-seats">👤 {car.seats} seats</span>
                                </div>
                                {car.description && (
                                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{car.description}</div>
                                )}
                                <div className="cab-price">₹{car.pricePerKm}/km</div>
                                <Link to={`/bookcab/${car._id}`} className="cab-book-btn" id={`book-${car._id}`}>
                                    Book Now →
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Cabs;
