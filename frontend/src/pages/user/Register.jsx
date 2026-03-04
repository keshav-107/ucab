import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../api/axios';

function Register() {
    const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { data } = await API.post('/api/users/register', form);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            navigate('/uhome');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-logo">Ucab</div>
                <div className="auth-subtitle">Create your account to get started</div>
                {error && <div className="alert-error">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input id="reg-name" className="form-control" type="text" name="name" placeholder="Sarah Johnson" value={form.name} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input id="reg-email" className="form-control" type="email" name="email" placeholder="sarah@example.com" value={form.email} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Phone Number</label>
                        <input id="reg-phone" className="form-control" type="tel" name="phone" placeholder="+91 9876543210" value={form.phone} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input id="reg-password" className="form-control" type="password" name="password" placeholder="Min 6 characters" value={form.password} onChange={handleChange} required minLength={6} />
                    </div>
                    <button id="reg-submit" className="btn-primary-custom" type="submit" disabled={loading}>
                        {loading ? 'Creating Account…' : 'Create Account'}
                    </button>
                </form>
                <div className="auth-divider">or</div>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign In</Link>
                </p>
            </div>
        </div>
    );
}

export default Register;
