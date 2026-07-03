// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';
// import NotificationBell from '../notifications/NotificationBell';
// import Button from './Button';
// import Avatar from './Avatar';
// import { FiLogOut } from 'react-icons/fi';
// import { LuBuilding2 } from 'react-icons/lu';

// const Navbar = () => {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();

//   const handleLogout = () => { logout(); navigate('/login'); };

//   return (
//     <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
//       <div className="flex items-center gap-2.5">
//         <div className="p-1.5 bg-primary rounded-lg">
//           <LuBuilding2 size={16} className="text-white" />
//         </div>
//         <span className="font-semibold text-gray-900 hidden sm:block">
//           Hostel Management
//         </span>
//       </div>

//       {user && (
//         <div className="flex items-center gap-3">
//           <NotificationBell />

//           <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-gray-200">
//             <Avatar name={user.name} size="sm" />
//             <div className="hidden md:block">
//               <p className="text-sm font-medium text-gray-800 leading-none">{user.name}</p>
//               <p className="text-xs text-gray-400 capitalize mt-0.5">{user.role}</p>
//             </div>
//           </div>

//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={handleLogout}
//             iconLeft={<FiLogOut size={14} />}
//           >
//             <span className="hidden sm:inline">Logout</span>
//           </Button>
//         </div>
//       )}
//     </header>
//   );
// };

// export default Navbar;
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../notifications/NotificationBell';
import ThemeToggle from './ThemeToggle';
import Button from './Button';
import Avatar from './Avatar';
import { FiLogOut } from 'react-icons/fi';
import { LuBuilding2 } from 'react-icons/lu';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <header className="
      h-16 bg-white dark:bg-gray-900
      border-b border-gray-200 dark:border-gray-800
      flex items-center justify-between px-6 shrink-0
      transition-colors duration-300
    ">
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 bg-primary rounded-lg">
          <LuBuilding2 size={16} className="text-white" />
        </div>
        <span className="font-semibold text-gray-900 dark:text-white hidden sm:block transition-colors duration-300">
          HostelOS
        </span>
      </div>

      {user && (
        <div className="flex items-center gap-2">
          <NotificationBell />
          <ThemeToggle />

          <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-gray-200 dark:border-gray-700 ml-1">
            <Avatar name={user.name} size="sm" />
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-100 leading-none transition-colors duration-300">
                {user.name}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 capitalize mt-0.5">{user.role}</p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            iconLeft={<FiLogOut size={14} />}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 ml-1"
          >
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      )}
    </header>
  );
};

export default Navbar;