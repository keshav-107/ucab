import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import Anav from './Anav';

function Acabs() {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem('token')) { navigate('/admin/login'); return; }
        fetchCars();
    }, []);

    const fetchCars = async () => {
        try {
            const { data } = await API.get('/api/cars/all');
            setCars(data);
        } catch { navigate('/admin/login'); }
        finally { setLoading(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this car permanently?')) return;
        try {
            await API.delete(`/api/cars/${id}`);
            fetchCars();
        } catch (err) {
            alert(err.response?.data?.message || 'Delete failed.');
        }
    };

    return (
        <div>
            <Anav />
            <div className="page-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div>
                        <h1 className="page-title" style={{ marginBottom: 0 }}>Cars</h1>
                        <p className="page-subtitle" style={{ margin: '0.25rem 0 0' }}>Manage all cab listings</p>
                    </div>
                    <Link to="/admin/addcar" className="btn-primary-custom" style={{ width: 'auto', padding: '0.7rem 1.5rem', textDecoration: 'none', display: 'inline-block' }}>
                        + Add Car
                    </Link>
                </div>

                {loading ? (
                    <div className="spinner-wrapper"><div className="spinner-border text-warning" /></div>
                ) : (
                    <div className="glass-card" style={{ overflow: 'auto' }}>
                        <table className="ucab-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Model</th>
                                    <th>Type</th>
                                    <th>Seats</th>
                                    <th>Price/km</th>
                                    <th>Available</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cars.length === 0 ? (
                                    <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No cars yet. <Link to="/admin/addcar" style={{ color: 'var(--accent)' }}>Add one!</Link></td></tr>
                                ) : cars.map((c, i) => (
                                    <tr key={c._id}>
                                        <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                                        <td style={{ fontWeight: 600 }}>{c.carName}</td>
                                        <td style={{ color: 'var(--text-muted)' }}>{c.carModel}</td>
                                        <td><span className="badge-type">{c.carType}</span></td>
                                        <td>{c.seats}</td>
                                        <td style={{ color: 'var(--accent)', fontWeight: 700 }}>₹{c.pricePerKm}</td>
                                        <td>
                                            <span style={{ color: c.isAvailable ? '#4ee377' : '#ff6b7a', fontWeight: 600, fontSize: '0.85rem' }}>
                                                {c.isAvailable ? '✓ Yes' : '✗ No'}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <Link to={`/admin/cabs/edit/${c._id}`} className="btn-success-custom" id={`edit-car-${c._id}`} style={{ textDecoration: 'none', display: 'inline-block', fontSize: '0.82rem' }}>Edit</Link>
                                                <button className="btn-danger-custom" onClick={() => handleDelete(c._id)} id={`delete-car-${c._id}`} style={{ fontSize: '0.82rem' }}>Delete</button>
                                            </div>
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

export default Acabs;
