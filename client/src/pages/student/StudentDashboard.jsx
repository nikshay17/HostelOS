import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStudentSummary } from '../../services/dashboardService';
import { useAuth } from '../../context/AuthContext';
import PageLayout from '../../components/common/PageLayout';
import Loader from '../../components/common/Loader';
import ErrorBanner from '../../components/common/ErrorBanner';
import { LuBedDouble } from 'react-icons/lu';
import { FiCreditCard, FiLogOut, FiAlertCircle, FiTrendingUp } from 'react-icons/fi';

const StatCard = ({ title, value, description, icon: Icon, iconColor, iconBg, trend }) => (
  <div className="
    bg-white dark:bg-gray-900
    border border-gray-200 dark:border-gray-800
    rounded-2xl p-5 shadow-sm
    hover:shadow-md dark:hover:shadow-black/30
    hover:-translate-y-0.5
    transition-all duration-200
    group
  ">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-2.5 rounded-xl ${iconBg} transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-3`}>
        <Icon size={18} className={iconColor} />
      </div>
      {trend !== undefined && (
        <div className="flex items-center gap-1 text-xs text-success font-medium">
          <FiTrendingUp size={11} />
          {trend}
        </div>
      )}
    </div>
    <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1 transition-colors duration-300">
      {value}
    </p>
    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
      {title}
    </p>
    {description && (
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 transition-colors duration-300">
        {description}
      </p>
    )}
  </div>
);

const StudentDashboard = () => {
  const { token, user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getStudentSummary(token)
      .then(res => setSummary(res.data))
      .catch(() => setError('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, [token]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <PageLayout>
      {/* Page header */}
      <div className="mb-8">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 transition-colors duration-300">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
          {greeting}, {user?.name?.split(' ')[0]} 
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">
          Here's your hostel summary for today
        </p>
      </div>

      <ErrorBanner message={error} />

      {loading ? <Loader /> : summary && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Room Booking"
              value={summary.activeBooking ? summary.activeBooking.room.roomNumber : 'None'}
              description="Current active booking"
              icon={LuBedDouble}
              iconColor="text-primary"
              iconBg="bg-primary-light dark:bg-primary/20"
            />
            <StatCard
              title="Pending Gate Passes"
              value={summary.pendingGatePasses}
              description="Awaiting warden approval"
              icon={FiLogOut}
              iconColor="text-warning"
              iconBg="bg-warning-light dark:bg-warning/20"
            />
            <StatCard
              title="Unpaid Mess Bills"
              value={summary.unpaidBills}
              description="Bills pending payment"
              icon={FiCreditCard}
              iconColor="text-danger"
              iconBg="bg-danger-light dark:bg-danger/20"
            />
            <StatCard
              title="Open Complaints"
              value={summary.openComplaints}
              description="Filed and unresolved"
              icon={FiAlertCircle}
              iconColor="text-gray-500 dark:text-gray-400"
              iconBg="bg-gray-100 dark:bg-gray-800"
            />
          </div>

          {/* Quick actions */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 transition-colors duration-300">
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Quick actions</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Book a Room', icon: LuBedDouble, path: '/student/room-booking', color: 'text-primary', bg: 'bg-primary-light dark:bg-primary/20' },
                { label: 'Pay Bills', icon: FiCreditCard, path: '/student/mess-bills', color: 'text-success', bg: 'bg-success-light dark:bg-success/20' },
                { label: 'Gate Pass', icon: FiLogOut, path: '/student/gate-pass', color: 'text-warning', bg: 'bg-warning-light dark:bg-warning/20' },
                { label: 'File Complaint', icon: FiAlertCircle, path: '/student/complaints', color: 'text-danger', bg: 'bg-danger-light dark:bg-danger/20' },
              ].map(({ label, icon: Icon, path, color, bg }) => (
                <Link
                  key={label}
                  to={path}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-sm transition-all duration-200 hover:-translate-y-0.5 group"
                >
                  <div className={`p-2.5 rounded-xl ${bg} transition-transform duration-200 group-hover:scale-110`}>
                    <Icon size={16} className={color} />
                  </div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400 text-center transition-colors duration-300">{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </PageLayout>
  );
};

export default StudentDashboard;