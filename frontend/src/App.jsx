import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// User pages
import Home from './pages/user/Home';
import Login from './pages/user/Login';
import Register from './pages/user/Register';
import Uhome from './pages/user/Uhome';
import Cabs from './pages/user/Cabs';
import BookCab from './pages/user/BookCab';
import Mybookings from './pages/user/Mybookings';

// Admin pages
import Alogin from './pages/admin/Alogin';
import Ahome from './pages/admin/Ahome';
import Users from './pages/admin/Users';
import UserEdit from './pages/admin/UserEdit';
import Bookings from './pages/admin/Bookings';
import Acabs from './pages/admin/Acabs';
import Acabedit from './pages/admin/Acabedit';
import Addcar from './pages/admin/Addcar';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* User */}
        <Route path="/uhome" element={<Uhome />} />
        <Route path="/cabs" element={<Cabs />} />
        <Route path="/bookcab/:id" element={<BookCab />} />
        <Route path="/mybookings" element={<Mybookings />} />

        {/* Admin */}
        <Route path="/admin/login" element={<Alogin />} />
        <Route path="/ahome" element={<Ahome />} />
        <Route path="/admin/users" element={<Users />} />
        <Route path="/admin/users/edit/:id" element={<UserEdit />} />
        <Route path="/admin/bookings" element={<Bookings />} />
        <Route path="/admin/cabs" element={<Acabs />} />
        <Route path="/admin/cabs/edit/:id" element={<Acabedit />} />
        <Route path="/admin/addcar" element={<Addcar />} />
      </Routes>
    </Router>
  );
}

export default App;
