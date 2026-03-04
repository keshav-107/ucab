import { Link, useNavigate } from 'react-router-dom';

function Anav() {
    const navigate = useNavigate();
    const admin = JSON.parse(localStorage.getItem('admin') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('admin');
        navigate('/admin/login');
    };

    return (
        <nav className="ucab-nav">
            <Link to="/ahome" className="nav-logo">Ucab <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, verticalAlign: 'middle' }}>Admin</span></Link>
            <ul className="nav-links">
                <li><Link to="/ahome">Dashboard</Link></li>
                <li><Link to="/admin/users">Users</Link></li>
                <li><Link to="/admin/bookings">Bookings</Link></li>
                <li><Link to="/admin/cabs">Cabs</Link></li>
                <li><Link to="/admin/addcar">+ Add Car</Link></li>
                <li><span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{admin.name || 'Admin'}</span></li>
                <li><button id="admin-logout" className="nav-link-btn" onClick={handleLogout}>Logout</button></li>
            </ul>
        </nav>
    );
}

export default Anav;
