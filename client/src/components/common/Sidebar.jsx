import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiHome, FiCalendar, FiMessageSquare, FiAlertCircle,
  FiCreditCard, FiLogOut, FiBell, FiSettings,
  FiBarChart2, FiShield, FiUserPlus, FiUsers, FiCamera
} from 'react-icons/fi';
import { LuBedDouble } from 'react-icons/lu';

const LINKS = {
  student: [
    { label: 'Dashboard',    path: '/student',                icon: FiHome },
    { label: 'Room Booking', path: '/student/room-booking',   icon: LuBedDouble },
    { label: 'Mess Bills',   path: '/student/mess-bills',     icon: FiCreditCard },
    { label: 'Gate Pass',    path: '/student/gate-pass',      icon: FiLogOut },
    { label: 'Attendance',   path: '/student/attendance',     icon: FiCalendar },
    { label: 'Face Verify',  path: '/student/face-verify',    icon: FiCamera },
    { label: 'Complaints',   path: '/student/complaints',     icon: FiAlertCircle },
    { label: 'Feedback',     path: '/student/feedback',       icon: FiMessageSquare },
  ],
  warden: [
    { label: 'Dashboard',    path: '/warden',                 icon: FiHome },
    { label: 'Bookings',     path: '/warden/bookings',        icon: LuBedDouble },
    { label: 'Gate Passes',  path: '/warden/gate-passes',     icon: FiLogOut },
    { label: 'Attendance',   path: '/warden/attendance',      icon: FiCalendar },
    { label: 'Complaints',   path: '/warden/complaints',      icon: FiAlertCircle },
  ],
  admin: [
    { label: 'Dashboard',    path: '/admin',                  icon: FiHome },
    { label: 'Manage Rooms', path: '/admin/manage-rooms',     icon: LuBedDouble },
    { label: 'Manage Bills', path: '/admin/manage-bills',     icon: FiCreditCard },
    { label: 'Feedback',     path: '/admin/feedback',         icon: FiMessageSquare },
    { label: 'Analytics',    path: '/admin/analytics',        icon: FiBarChart2 },
    { label: 'Broadcast',    path: '/admin/broadcast',        icon: FiBell },
    { label: 'Security',     path: '/admin/security',         icon: FiShield },
    { label: 'Create Staff', path: '/admin/create-staff',     icon: FiUserPlus },
  ],
};

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const links = user ? LINKS[user.role] || [] : [];

  return (
    <aside className="w-56 bg-white border-r border-gray-200 shrink-0 hidden md:flex flex-col">
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {links.map(({ label, path, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                transition-colors duration-150 group
                ${isActive
                  ? 'bg-primary text-white font-medium'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
            >
              <Icon
                size={16}
                className={`shrink-0 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`}
              />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;