import { Link } from 'react-router-dom';
import Unav from './Unav';

function Uhome() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const quickLinks = [
        { icon: '🚖', label: 'Book a Cab', to: '/cabs', desc: 'Find and book available cabs near you' },
        { icon: '📋', label: 'My Bookings', to: '/mybookings', desc: 'View your booking history' },
        { icon: '💳', label: 'Payment', to: '/mybookings', desc: 'Check fares and payment status' },
        { icon: '⭐', label: 'Offers', to: '/cabs', desc: 'Explore discounts and deals' },
    ];

    return (
        <div>
            <Unav />
            <div className="page-container">
                {/* Welcome banner */}
                <div style={{ background: 'linear-gradient(135deg, rgba(245,166,35,0.12) 0%, rgba(37,44,85,0.6) 100%)', border: '1px solid rgba(245,166,35,0.2)', borderRadius: '20px', padding: '2rem 2.5rem', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>
                            Welcome back, {user.name?.split(' ')[0] || 'User'} 👋
                        </div>
                        <div style={{ color: 'var(--text-muted)', marginTop: '0.4rem' }}>Where would you like to go today?</div>
                    </div>
                    <Link to="/cabs" className="btn-hero btn-hero-primary" style={{ borderRadius: '12px', padding: '0.85rem 2rem' }}>
                        Book Now 🚖
                    </Link>
                </div>

                {/* Quick links */}
                <h2 className="page-title" style={{ fontSize: '1.4rem', marginBottom: '1.25rem' }}>Quick Actions</h2>
                <div className="cards-grid">
                    {quickLinks.map((item, i) => (
                        <Link to={item.to} key={i} style={{ textDecoration: 'none' }}>
                            <div className="stat-card" style={{ cursor: 'pointer' }}>
                                <div className="stat-icon">{item.icon}</div>
                                <div style={{ fontWeight: 700, color: '#fff', marginBottom: '0.35rem' }}>{item.label}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.desc}</div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Info row */}
                <div style={{ marginTop: '2.5rem', padding: '1.5rem', background: 'rgba(37,44,85,0.5)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px' }}>
                    <div style={{ fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>📞 24/7 Support</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Need help? Contact our support team anytime at <span style={{ color: 'var(--accent)' }}>support@ucab.app</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Uhome;
