import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getPendingBookings, approveBooking, rejectBooking } from '../../services/roomService';
import PageLayout from '../../components/common/PageLayout';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import Loader from '../../components/common/Loader';
import ErrorBanner from '../../components/common/ErrorBanner';
import SuccessBanner from '../../components/common/SuccessBanner';
import EmptyState from '../../components/common/EmptyState';
import { LuBedDouble } from 'react-icons/lu';
import { FiCheck, FiX } from 'react-icons/fi';

const ManageBookings = () => {
  const { token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await getPendingBookings(token);
      setBookings(res.data);
    } catch (err) {
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, [token]);

  const handle = async (id, action) => {
    setMessage(''); setError('');
    setProcessing(id);
    try {
      if (action === 'approve') await approveBooking(id, token);
      else await rejectBooking(id, token);
      setMessage(`Booking ${action}d successfully`);
      fetchBookings();
    } catch (err) {
      setError(err.response?.data?.message || `${action} failed`);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <PageLayout>
      <PageHeader
        title="Manage Bookings"
        description="Review and process pending room booking requests"
        actions={
          <span className="text-sm text-gray-500 dark:text-gray-400">{bookings.length} pending</span>
        }
      />
      <ErrorBanner message={error} />
      <SuccessBanner message={message} />

      {loading ? <Loader /> : bookings.length === 0 ? (
        <EmptyState title="No pending bookings" description="All booking requests have been processed" icon={LuBedDouble} />
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Room</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Requested</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.map(b => (
                  <tr key={b._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={b.student.name} size="sm" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">{b.student.name}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">{b.student.studentId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 dark:text-white">{b.room.roomNumber}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">{b.room.type} · Floor {b.room.floor}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{new Date(b.requestedAt).toLocaleString()}</td>
                    <td className="px-4 py-3"><Badge status={b.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="success"
                          size="sm"
                          loading={processing === b._id}
                          onClick={() => handle(b._id, 'approve')}
                          iconLeft={<FiCheck size={12} />}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          disabled={processing === b._id}
                          onClick={() => handle(b._id, 'reject')}
                          iconLeft={<FiX size={12} />}
                        >
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default ManageBookings;