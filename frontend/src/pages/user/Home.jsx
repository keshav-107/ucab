import { Link } from 'react-router-dom';

const features = [
    { icon: '🚖', title: 'Instant Booking', desc: 'Book a cab in seconds with real-time availability across the city.' },
    { icon: '📍', title: 'Live Tracking', desc: 'Track your cab in real-time from pickup to destination.' },
    { icon: '💳', title: 'Secure Payments', desc: 'Pay automatically through saved payment methods — safe and fast.' },
    { icon: '📋', title: 'Ride History', desc: 'View all your past bookings and download receipts anytime.' },
    { icon: '⚡', title: 'Multiple Cab Types', desc: 'Choose from Mini, Sedan, SUV, or Premium based on your comfort.' },
    { icon: '🎯', title: 'Smart Fare', desc: 'Transparent fare estimation based on distance before you book.' },
];

function Home() {
    return (
        <div>
            {/* Navbar */}
            <nav className="ucab-nav">
                <span className="nav-logo">Ucab</span>
                <ul className="nav-links">
                    <li><Link to="/login">Login</Link></li>
                    <li>
                        <Link to="/register" style={{ padding: '0.5rem 1.2rem', background: 'rgba(245,166,35,0.15)', border: '1px solid rgba(245,166,35,0.3)', borderRadius: '8px', color: '#f5a623', fontWeight: 600 }}>
                            Sign Up
                        </Link>
                    </li>
                    <li><Link to="/admin/login">Admin</Link></li>
                </ul>
            </nav>

            {/* Hero */}
            <div className="hero-section">
                <div className="hero-tag">🚀 Fast · Reliable · Affordable</div>
                <h1 className="hero-title">
                    Your Ride,<br /><span>Your Way</span>
                </h1>
                <p className="hero-desc">
                    Ucab makes city travel effortless. Book nearby cabs instantly, track your ride live,
                    and reach your destination stress-free — all in one app.
                </p>
                <div className="hero-buttons">
                    <Link to="/register" className="btn-hero btn-hero-primary">Get Started Free</Link>
                    <Link to="/login" className="btn-hero btn-hero-outline">Sign In</Link>
                </div>
            </div>

            {/* Features */}
            <div className="features-section">
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>Everything you need</h2>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>A modern cab booking experience built for everyone</p>
                </div>
                <div className="features-grid">
                    {features.map((f, i) => (
                        <div className="feature-card" key={i}>
                            <div className="feature-icon">{f.icon}</div>
                            <div className="feature-title">{f.title}</div>
                            <div className="feature-desc">{f.desc}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                © 2024 Ucab · All rights reserved
            </div>
        </div>
    );
}

export default Home;
