import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../api/axios';

function Alogin() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { data } = await API.post('/api/admin/login', form);
            localStorage.setItem('token', data.token);
            localStorage.setItem('admin', JSON.stringify(data.admin));
            navigate('/ahome');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-logo">Ucab</div>
                <div className="auth-subtitle" style={{ color: '#f5a623' }}>Admin Portal</div>
                {error && <div className="alert-error">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Admin Email</label>
                        <input id="alogin-email" className="form-control" type="email" name="email" placeholder="admin@ucab.app" value={form.email} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input id="alogin-password" className="form-control" type="password" name="password" placeholder="Your password" value={form.password} onChange={handleChange} required />
                    </div>
                    <button id="alogin-submit" className="btn-primary-custom" type="submit" disabled={loading}>
                        {loading ? 'Signing In…' : 'Sign In as Admin'}
                    </button>
                </form>
                <div className="auth-divider">or</div>
                <p style={{ textAlign: 'center', marginTop: '0.75rem' }}>
                    <Link to="/login" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>← Back to User Login</Link>
                </p>
            </div>
        </div>
    );
}

export default Alogin;
