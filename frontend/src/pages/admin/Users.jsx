import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import Anav from './Anav';

function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem('token')) { navigate('/admin/login'); return; }
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data } = await API.get('/api/users/all');
            setUsers(data);
        } catch { navigate('/admin/login'); }
        finally { setLoading(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this user permanently?')) return;
        try {
            await API.delete(`/api/users/${id}`);
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.message || 'Delete failed.');
        }
    };

    const filtered = users.filter(
        (u) => u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <Anav />
            <div className="page-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div>
                        <h1 className="page-title" style={{ marginBottom: 0 }}>Users</h1>
                        <p className="page-subtitle" style={{ margin: '0.25rem 0 0' }}>Manage all registered users</p>
                    </div>
                </div>

                <input id="user-search" className="form-control" style={{ maxWidth: '320px', marginBottom: '1.5rem' }} type="text" placeholder="🔍 Search users..." value={search} onChange={(e) => setSearch(e.target.value)} />

                {loading ? (
                    <div className="spinner-wrapper"><div className="spinner-border text-warning" /></div>
                ) : (
                    <div className="glass-card" style={{ overflow: 'auto' }}>
                        <table className="ucab-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Joined</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No users found</td></tr>
                                ) : filtered.map((u, i) => (
                                    <tr key={u._id}>
                                        <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                                        <td style={{ fontWeight: 600 }}>{u.name}</td>
                                        <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                                        <td>{u.phone || '—'}</td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <Link to={`/admin/users/edit/${u._id}`} className="btn-success-custom" id={`edit-user-${u._id}`} style={{ textDecoration: 'none', display: 'inline-block', fontSize: '0.82rem' }}>Edit</Link>
                                                <button className="btn-danger-custom" onClick={() => handleDelete(u._id)} id={`delete-user-${u._id}`} style={{ fontSize: '0.82rem' }}>Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Users;
