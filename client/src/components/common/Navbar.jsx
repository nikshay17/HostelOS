import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../notifications/NotificationBell';
import Button from './Button';
import Avatar from './Avatar';
import { FiLogOut } from 'react-icons/fi';
import { LuBuilding2 } from 'react-icons/lu';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 bg-primary rounded-lg">
          <LuBuilding2 size={16} className="text-white" />
        </div>
        <span className="font-semibold text-gray-900 hidden sm:block">
          Hostel Management
        </span>
      </div>

      {user && (
        <div className="flex items-center gap-3">
          <NotificationBell />

          <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-gray-200">
            <Avatar name={user.name} size="sm" />
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-800 leading-none">{user.name}</p>
              <p className="text-xs text-gray-400 capitalize mt-0.5">{user.role}</p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            iconLeft={<FiLogOut size={14} />}
          >
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      )}
    </header>
  );
};

export default Navbar;