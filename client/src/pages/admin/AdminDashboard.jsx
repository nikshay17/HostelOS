import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminSummary } from '../../services/dashboardService';
import { useAuth } from '../../context/AuthContext';
import PageLayout from '../../components/common/PageLayout';
import Loader from '../../components/common/Loader';
import ErrorBanner from '../../components/common/ErrorBanner';
import { LuBedDouble } from 'react-icons/lu';
import { FiUsers, FiCreditCard, FiAlertCircle, FiUserCheck, FiKey, FiBarChart2 } from 'react-icons/fi';

const StatCard = ({ title, value, description, icon: Icon, iconColor, iconBg }) => (
  <div className="
    bg-white dark:bg-gray-900
    border border-gray-200 dark:border-gray-800
    rounded-2xl p-5 shadow-sm
    hover:shadow-md dark:hover:shadow-black/30
    hover:-translate-y-0.5
    transition-all duration-200 group
  ">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-2.5 rounded-xl ${iconBg} transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-3`}>
        <Icon size={18} className={iconColor} />
      </div>
    </div>
    <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1 transition-colors duration-300">{value}</p>
    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">{title}</p>
    {description && (
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 transition-colors duration-300">{description}</p>
    )}
  </div>
);

const AdminDashboard = () => {
  const { token, user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAdminSummary(token)
      .then(res => setSummary(res.data))
      .catch(() => setError('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, [token]);

  const occupancyPct = summary
    ? Math.round((summary.occupiedRooms / summary.totalRooms) * 100) || 0
    : 0;

  return (
    <PageLayout>
      <div className="mb-8">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 transition-colors duration-300">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
          Admin Dashboard
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">
          Hostel-wide overview
        </p>
      </div>

      <ErrorBanner message={error} />

      {loading ? <Loader /> : summary && (
        <>
          {/* Occupancy banner */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 mb-6 transition-colors duration-300">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-900 dark:text-white transition-colors duration-300">Room Occupancy</p>
              <span className={`text-sm font-bold ${occupancyPct > 85 ? 'text-danger' : occupancyPct > 60 ? 'text-warning' : 'text-success'}`}>
                {occupancyPct}%
              </span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  occupancyPct > 85 ? 'bg-danger' : occupancyPct > 60 ? 'bg-warning' : 'bg-success'
                }`}
                style={{ width: `${occupancyPct}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 transition-colors duration-300">
              {summary.occupiedRooms} of {summary.totalRooms} rooms occupied
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
            <StatCard
              title="Total Students"
              value={summary.totalStudents}
              description="Currently enrolled"
              icon={FiUsers}
              iconColor="text-primary"
              iconBg="bg-primary-light dark:bg-primary/20"
            />
            <StatCard
              title="Total Wardens"
              value={summary.totalWardens}
              description="Active staff"
              icon={FiUserCheck}
              iconColor="text-gray-500 dark:text-gray-400"
              iconBg="bg-gray-100 dark:bg-gray-800"
            />
            <StatCard
              title="Total Rooms"
              value={summary.totalRooms}
              description="All hostel rooms"
              icon={LuBedDouble}
              iconColor="text-primary"
              iconBg="bg-primary-light dark:bg-primary/20"
            />
            <StatCard
              title="Occupied Rooms"
              value={summary.occupiedRooms}
              description="Rooms at capacity"
              icon={FiKey}
              iconColor="text-warning"
              iconBg="bg-warning-light dark:bg-warning/20"
            />
            <StatCard
              title="Unpaid Bills"
              value={summary.totalUnpaidBills}
              description="Pending collection"
              icon={FiCreditCard}
              iconColor="text-danger"
              iconBg="bg-danger-light dark:bg-danger/20"
            />
            <StatCard
              title="Open Complaints"
              value={summary.openComplaints}
              description="Unresolved issues"
              icon={FiAlertCircle}
              iconColor="text-danger"
              iconBg="bg-danger-light dark:bg-danger/20"
            />
          </div>

          {/* Admin quick links */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 transition-colors duration-300">
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Quick access</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Analytics', icon: FiBarChart2, path: '/admin/analytics', color: 'text-primary', bg: 'bg-primary-light dark:bg-primary/20' },
                { label: 'Manage Bills', icon: FiCreditCard, path: '/admin/manage-bills', color: 'text-success', bg: 'bg-success-light dark:bg-success/20' },
                { label: 'Complaints', icon: FiAlertCircle, path: '/warden/complaints', color: 'text-danger', bg: 'bg-danger-light dark:bg-danger/20' },
                { label: 'Create Staff', icon: FiUserCheck, path: '/admin/create-staff', color: 'text-gray-500 dark:text-gray-400', bg: 'bg-gray-100 dark:bg-gray-800' },
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

export default AdminDashboard;