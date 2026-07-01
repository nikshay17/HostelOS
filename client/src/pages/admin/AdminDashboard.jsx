import { useEffect, useState } from 'react';
import { getAdminSummary } from '../../services/dashboardService';
import { useAuth } from '../../context/AuthContext';
import PageLayout from '../../components/common/PageLayout';
import StatCard from '../../components/common/StatCard';
import Loader from '../../components/common/Loader';
import ErrorBanner from '../../components/common/ErrorBanner';
import { LuBedDouble } from 'react-icons/lu';
import { FiUsers, FiCreditCard, FiAlertCircle, FiUserCheck, FiKey } from 'react-icons/fi';

const AdminDashboard = () => {
  const { token } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAdminSummary(token)
      .then(res => setSummary(res.data))
      .catch(() => setError('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <PageLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h2>
        <p className="text-sm text-gray-500 mt-0.5">Complete hostel management overview</p>
      </div>

      <ErrorBanner message={error} />

      {loading ? <Loader /> : summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <StatCard title="Total Students" value={summary.totalStudents}
            description="Currently enrolled" icon={FiUsers} iconColor="text-primary" iconBg="bg-primary-light" />
          <StatCard title="Total Wardens" value={summary.totalWardens}
            description="Active staff" icon={FiUserCheck} iconColor="text-gray-500" iconBg="bg-gray-100" />
          <StatCard title="Total Rooms" value={summary.totalRooms}
            description="All hostel rooms" icon={LuBedDouble} iconColor="text-primary" iconBg="bg-primary-light" />
          <StatCard title="Occupied Rooms" value={summary.occupiedRooms}
            description="Rooms at capacity" icon={FiKey} iconColor="text-warning" iconBg="bg-warning-light" />
          <StatCard title="Unpaid Bills" value={summary.totalUnpaidBills}
            description="Pending collection" icon={FiCreditCard} iconColor="text-danger" iconBg="bg-danger-light" />
          <StatCard title="Open Complaints" value={summary.openComplaints}
            description="Unresolved issues" icon={FiAlertCircle} iconColor="text-danger" iconBg="bg-danger-light" />
        </div>
      )}
    </PageLayout>
  );
};

export default AdminDashboard;