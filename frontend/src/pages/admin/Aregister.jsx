import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../api/axios';

function Aregister() {
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { data } = await API.post('/api/admin/register', form);
            localStorage.setItem('token', data.token);
            localStorage.setItem('admin', JSON.stringify(data.admin));
            navigate('/ahome');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-logo">Ucab</div>
                <div className="auth-subtitle" style={{ color: '#f5a623' }}>Admin Registration</div>
                {error && <div className="alert-error">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input id="areg-name" className="form-control" type="text" name="name" placeholder="Admin Name" value={form.name} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input id="areg-email" className="form-control" type="email" name="email" placeholder="admin@ucab.app" value={form.email} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input id="areg-password" className="form-control" type="password" name="password" placeholder="Min 6 characters" value={form.password} onChange={handleChange} required minLength={6} />
                    </div>
                    <button id="areg-submit" className="btn-primary-custom" type="submit" disabled={loading}>
                        {loading ? 'Creating Admin…' : 'Create Admin Account'}
                    </button>
                </form>
                <div className="auth-divider">or</div>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Already registered? <Link to="/admin/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Admin Login</Link>
                </p>
            </div>
        </div>
    );
}

export default Aregister;
