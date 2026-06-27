import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();

  const linksByRole = {
    student: [
      { label: 'Dashboard', path: '/student' },
      { label: 'Room Booking', path: '/student/room-booking' },
      { label: 'Mess Bills', path: '/student/mess-bills' },
      { label: 'Gate Pass', path: '/student/gate-pass' },
      { label: 'Complaints', path: '/student/complaints' },
      { label: 'Feedback', path: '/student/feedback' },
    ],
    warden: [
      { label: 'Dashboard', path: '/warden' },
      { label: 'Manage Bookings', path: '/warden/bookings' },
      { label: 'Gate Passes', path: '/warden/gate-passes' },
      { label: 'Complaints', path: '/warden/complaints' },
    ],
    admin: [
      { label: 'Dashboard', path: '/admin' },
      { label: 'Analytics', path: '/admin/analytics' },
      { label: 'Create Staff', path: '/admin/create-staff' },
      { label: 'Security Settings', path: '/admin/security' },
    ],
  };

  const links = user ? linksByRole[user.role] || [] : [];

  return (
    <aside style={{ width: '200px', padding: '1rem', borderRight: '1px solid #ccc' }}>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {links.map((link) => (
          <li key={link.path} style={{ marginBottom: '0.5rem' }}>
            <Link to={link.path}>{link.label}</Link>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;