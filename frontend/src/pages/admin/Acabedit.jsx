import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import Anav from './Anav';

function Acabedit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({ carName: '', carModel: '', carType: 'Sedan', seats: 4, pricePerKm: '', description: '', isAvailable: true });
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchCar();
    }, [id]);

    const fetchCar = async () => {
        try {
            const { data } = await API.get(`/api/cars/${id}`);
            setForm({
                carName: data.carName, carModel: data.carModel, carType: data.carType,
                seats: data.seats, pricePerKm: data.pricePerKm, description: data.description || '',
                isAvailable: data.isAvailable,
            });
        } catch {
            setError('Failed to load car data.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSubmitting(true);
        try {
            const formData = new FormData();
            Object.entries(form).forEach(([k, v]) => formData.append(k, v));
            if (image) formData.append('image', image);
            await API.put(`/api/cars/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setSuccess('Car updated successfully!');
            setTimeout(() => navigate('/admin/cabs'), 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Update failed.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
            <Anav />
            <div className="page-container" style={{ maxWidth: '600px' }}>
                <button onClick={() => navigate('/admin/cabs')} className="btn-secondary-custom" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>← Back to Cars</button>
                <h1 className="page-title" style={{ fontSize: '1.6rem', marginBottom: '1.5rem' }}>Edit Car</h1>
                {error && <div className="alert-error">{error}</div>}
                {success && <div className="alert-success">{success}</div>}
                {loading ? <div className="spinner-wrapper"><div className="spinner-border text-warning" /></div> : (
                    <div className="glass-card" style={{ padding: '2rem' }}>
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Car Name</label>
                                    <input id="cedit-name" className="form-control" type="text" name="carName" value={form.carName} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Car Model</label>
                                    <input id="cedit-model" className="form-control" type="text" name="carModel" value={form.carModel} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Type</label>
                                    <select id="cedit-type" className="form-control" name="carType" value={form.carType} onChange={handleChange}>
                                        {['Mini', 'Sedan', 'SUV', 'Premium'].map((t) => <option key={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Seats</label>
                                    <input id="cedit-seats" className="form-control" type="number" name="seats" value={form.seats} onChange={handleChange} min={2} max={8} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Price per km (₹)</label>
                                    <input id="cedit-price" className="form-control" type="number" name="pricePerKm" value={form.pricePerKm} onChange={handleChange} min={1} required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea id="cedit-desc" className="form-control" name="description" value={form.description} onChange={handleChange} rows={2} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Car Image (optional)</label>
                                <input id="cedit-image" className="form-control" type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
                            </div>
                            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <input id="cedit-available" type="checkbox" name="isAvailable" checked={form.isAvailable} onChange={handleChange} style={{ width: '18px', height: '18px', accentColor: '#f5a623' }} />
                                <label htmlFor="cedit-available" className="form-label" style={{ margin: 0 }}>Available for booking</label>
                            </div>
                            <button id="cedit-submit" className="btn-primary-custom" type="submit" disabled={submitting}>
                                {submitting ? 'Saving…' : 'Save Changes'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Acabedit;
