import { useEffect, useState } from 'react';
import { getWardenSummary } from '../../services/dashboardService';
import { useAuth } from '../../context/AuthContext';
import PageLayout from '../../components/common/PageLayout';
import StatCard from '../../components/common/StatCard';
import Loader from '../../components/common/Loader';
import ErrorBanner from '../../components/common/ErrorBanner';
import { LuBedDouble } from 'react-icons/lu';
import { FiLogOut, FiAlertCircle, FiUsers } from 'react-icons/fi';

const WardenDashboard = () => {
  const { token, user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getWardenSummary(token)
      .then(res => setSummary(res.data))
      .catch(() => setError('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <PageLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          Warden Dashboard
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">Today's hostel operations overview</p>
      </div>

      <ErrorBanner message={error} />

      {loading ? <Loader /> : summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Pending Bookings"
            value={summary.pendingBookings}
            description="Awaiting approval"
            icon={LuBedDouble}
            iconColor="text-warning"
            iconBg="bg-warning-light"
          />
          <StatCard
            title="Pending Gate Passes"
            value={summary.pendingGatePasses}
            description="Awaiting approval"
            icon={FiLogOut}
            iconColor="text-primary"
            iconBg="bg-primary-light"
          />
          <StatCard
            title="Open Complaints"
            value={summary.openComplaints}
            description="Unresolved issues"
            icon={FiAlertCircle}
            iconColor="text-danger"
            iconBg="bg-danger-light"
          />
          <StatCard
            title="Total Students"
            value={summary.totalStudents}
            description="Registered in hostel"
            icon={FiUsers}
            iconColor="text-gray-500"
            iconBg="bg-gray-100"
          />
        </div>
      )}
    </PageLayout>
  );
};

export default WardenDashboard;