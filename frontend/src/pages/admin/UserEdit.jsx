import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import Anav from './Anav';

function UserEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', phone: '' });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchUser();
    }, [id]);

    const fetchUser = async () => {
        try {
            const { data } = await API.get('/api/users/all');
            const user = data.find((u) => u._id === id);
            if (user) setForm({ name: user.name, phone: user.phone || '' });
        } catch {
            setError('Failed to load user data.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSubmitting(true);
        try {
            await API.put(`/api/users/${id}`, form);
            setSuccess('User updated successfully!');
            setTimeout(() => navigate('/admin/users'), 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Update failed.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
            <Anav />
            <div className="page-container" style={{ maxWidth: '560px' }}>
                <button onClick={() => navigate('/admin/users')} className="btn-secondary-custom" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                    ← Back to Users
                </button>
                <h1 className="page-title" style={{ fontSize: '1.6rem', marginBottom: '1.5rem' }}>Edit User</h1>
                {error && <div className="alert-error">{error}</div>}
                {success && <div className="alert-success">{success}</div>}
                {loading ? (
                    <div className="spinner-wrapper"><div className="spinner-border text-warning" /></div>
                ) : (
                    <div className="glass-card" style={{ padding: '2rem' }}>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input id="uedit-name" className="form-control" type="text" name="name" value={form.name} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone Number</label>
                                <input id="uedit-phone" className="form-control" type="tel" name="phone" value={form.phone} onChange={handleChange} />
                            </div>
                            <button id="uedit-submit" className="btn-primary-custom" type="submit" disabled={submitting}>
                                {submitting ? 'Saving…' : 'Save Changes'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}

export default UserEdit;
