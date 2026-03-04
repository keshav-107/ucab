import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import Anav from './Anav';

function Addcar() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ carName: '', carModel: '', carType: 'Sedan', seats: 4, pricePerKm: '', description: '' });
    const [image, setImage] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSubmitting(true);
        try {
            const formData = new FormData();
            Object.entries(form).forEach(([k, v]) => formData.append(k, v));
            if (image) formData.append('image', image);
            await API.post('/api/cars/add', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setSuccess('🚗 Car added successfully! Redirecting...');
            setTimeout(() => navigate('/admin/cabs'), 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add car.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
            <Anav />
            <div className="page-container" style={{ maxWidth: '600px' }}>
                <button onClick={() => navigate('/admin/cabs')} className="btn-secondary-custom" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>← Back to Cars</button>
                <h1 className="page-title" style={{ fontSize: '1.6rem', marginBottom: '1.5rem' }}>Add New Car</h1>
                {error && <div className="alert-error">{error}</div>}
                {success && <div className="alert-success">{success}</div>}
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">Car Name *</label>
                                <input id="addcar-name" className="form-control" type="text" name="carName" placeholder="e.g. Swift Dzire" value={form.carName} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Car Model *</label>
                                <input id="addcar-model" className="form-control" type="text" name="carModel" placeholder="e.g. 2023" value={form.carModel} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Type *</label>
                                <select id="addcar-type" className="form-control" name="carType" value={form.carType} onChange={handleChange}>
                                    {['Mini', 'Sedan', 'SUV', 'Premium'].map((t) => <option key={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Seats *</label>
                                <input id="addcar-seats" className="form-control" type="number" name="seats" placeholder="4" value={form.seats} onChange={handleChange} min={2} max={8} required />
                            </div>
                            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                <label className="form-label">Price per km (₹) *</label>
                                <input id="addcar-price" className="form-control" type="number" name="pricePerKm" placeholder="e.g. 12" value={form.pricePerKm} onChange={handleChange} min={1} required />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea id="addcar-desc" className="form-control" name="description" placeholder="Brief cab description..." value={form.description} onChange={handleChange} rows={2} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Car Image</label>
                            <input id="addcar-image" className="form-control" type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
                            {image && <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>Selected: {image.name}</div>}
                        </div>
                        <button id="addcar-submit" className="btn-primary-custom" type="submit" disabled={submitting}>
                            {submitting ? 'Adding Car…' : '+ Add Car'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Addcar;
