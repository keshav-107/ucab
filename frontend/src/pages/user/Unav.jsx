import { Link, useNavigate } from 'react-router-dom';

function Unav() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <nav className="ucab-nav">
            <Link to="/uhome" className="nav-logo">Ucab</Link>
            <ul className="nav-links">
                <li><Link to="/uhome">Home</Link></li>
                <li><Link to="/cabs">Book a Cab</Link></li>
                <li><Link to="/mybookings">My Bookings</Link></li>
                <li>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        Hi, {user.name?.split(' ')[0] || 'User'}
                    </span>
                </li>
                <li>
                    <button id="user-logout" className="nav-link-btn" onClick={handleLogout}>Logout</button>
                </li>
            </ul>
        </nav>
    );
}

export default Unav;
