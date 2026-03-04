import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../api/axios';

function Login() {
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
            const { data } = await API.post('/api/users/login', form);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            navigate('/uhome');
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
                <div className="auth-subtitle">Welcome back! Sign in to continue</div>
                {error && <div className="alert-error">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input id="login-email" className="form-control" type="email" name="email" placeholder="sarah@example.com" value={form.email} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input id="login-password" className="form-control" type="password" name="password" placeholder="Your password" value={form.password} onChange={handleChange} required />
                    </div>
                    <button id="login-submit" className="btn-primary-custom" type="submit" disabled={loading}>
                        {loading ? 'Signing In…' : 'Sign In'}
                    </button>
                </form>
                <div className="auth-divider">or</div>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    New to Ucab? <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>Create Account</Link>
                </p>
                <p style={{ textAlign: 'center', marginTop: '0.75rem' }}>
                    <Link to="/admin/login" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Admin Login →</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;
