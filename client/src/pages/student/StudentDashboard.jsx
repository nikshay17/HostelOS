import { useEffect, useState } from 'react';
import { getStudentSummary } from '../../services/dashboardService';
import { useAuth } from '../../context/AuthContext';
import PageLayout from '../../components/common/PageLayout';
import StatCard from '../../components/common/StatCard';
import Loader from '../../components/common/Loader';
import ErrorBanner from '../../components/common/ErrorBanner';
import { LuBedDouble } from 'react-icons/lu';
import { FiCreditCard, FiLogOut, FiAlertCircle } from 'react-icons/fi';

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

  return (
    <PageLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          Good morning, {user?.name?.split(' ')[0]}
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">Here is your hostel summary for today</p>
      </div>

      <ErrorBanner message={error} />

      {loading ? <Loader /> : summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Room Booking"
            value={summary.activeBooking ? summary.activeBooking.room.roomNumber : 'None'}
            description="Current active booking"
            icon={LuBedDouble}
            iconColor="text-primary"
            iconBg="bg-primary-light"
          />
          <StatCard
            title="Pending Gate Passes"
            value={summary.pendingGatePasses}
            description="Awaiting warden approval"
            icon={FiLogOut}
            iconColor="text-warning"
            iconBg="bg-warning-light"
          />
          <StatCard
            title="Unpaid Mess Bills"
            value={summary.unpaidBills}
            description="Bills pending payment"
            icon={FiCreditCard}
            iconColor="text-danger"
            iconBg="bg-danger-light"
          />
          <StatCard
            title="Open Complaints"
            value={summary.openComplaints}
            description="Filed and unresolved"
            icon={FiAlertCircle}
            iconColor="text-gray-500"
            iconBg="bg-gray-100"
          />
        </div>
      )}
    </PageLayout>
  );
};

export default StudentDashboard;