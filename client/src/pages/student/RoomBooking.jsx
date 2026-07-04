import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAllRooms, requestBooking, getMyBookings, cancelBooking } from '../../services/roomService';
import PageLayout from '../../components/common/PageLayout';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import ErrorBanner from '../../components/common/ErrorBanner';
import SuccessBanner from '../../components/common/SuccessBanner';
import EmptyState from '../../components/common/EmptyState';
import SectionHeader from '../../components/common/SectionHeader';
import { LuBedDouble } from 'react-icons/lu';
import { FiUsers, FiLayers, FiCheckCircle } from 'react-icons/fi';

const RoomBooking = () => {
  const { token } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [requesting, setRequesting] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [roomsRes, bookingsRes] = await Promise.all([getAllRooms(token), getMyBookings(token)]);
      setRooms(roomsRes.data);
      setMyBookings(bookingsRes.data);
    } catch (err) {
      setError('Failed to load room data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [token]);

  const handleRequest = async (roomId) => {
    setMessage(''); setError('');
    setRequesting(roomId);
    try {
      await requestBooking(roomId, token);
      setMessage('Booking request sent — awaiting warden approval');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Booking request failed');
    } finally {
      setRequesting(null);
    }
  };

  const handleCancel = async (bookingId) => {
    setError('');
    try {
      await cancelBooking(bookingId, token);
      setMessage('Booking cancelled');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Cancel failed');
    }
  };

  return (
    <PageLayout>
      <PageHeader
        title="Room Booking"
        description="Browse available rooms and manage your booking requests"
      />
      <ErrorBanner message={error} />
      <SuccessBanner message={message} />

      {loading ? <Loader /> : (
        <div className="space-y-8">

          {/* My Bookings */}
          <section>
            <SectionHeader
              title="My Bookings"
              description="Your current and past booking requests"
            />
            {myBookings.length === 0 ? (
              <EmptyState
                title="No bookings yet"
                description="Request a room below to get started"
                icon={LuBedDouble}
              />
            ) : (
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-card">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Room</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Floor</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {myBookings.map(b => (
                        <tr key={b._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{b.room.roomNumber}</td>
                          <td className="px-4 py-3 text-gray-500 dark:text-gray-400 capitalize">{b.room.type}</td>
                          <td className="px-4 py-3 text-gray-500 dark:text-gray-400">Floor {b.room.floor}</td>
                          <td className="px-4 py-3"><Badge status={b.status} /></td>
                          <td className="px-4 py-3">
                            {b.status === 'pending' && (
                              <Button variant="danger" size="sm" onClick={() => handleCancel(b._id)}>
                                Cancel
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>

          {/* Available Rooms */}
          <section>
            <SectionHeader
              title="Available Rooms"
              description="Click 'Request' on any available room"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms.map(room => (
                <Card key={room._id} className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">{room.roomNumber}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 capitalize mt-0.5">{room.type} · Floor {room.floor}</p>
                    </div>
                    <Badge status={room.status} />
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <span className="flex items-center gap-1.5">
                      <FiUsers size={13} />
                      {room.occupants.length}/{room.capacity} occupied
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FiLayers size={13} />
                      Floor {room.floor}
                    </span>
                  </div>
                  <Button
                    className="w-full"
                    size="sm"
                    disabled={room.status !== 'available'}
                    loading={requesting === room._id}
                    onClick={() => handleRequest(room._id)}
                    iconLeft={<FiCheckCircle size={13} />}
                  >
                    Request Booking
                  </Button>
                </Card>
              ))}
            </div>
          </section>
        </div>
      )}
    </PageLayout>
  );
};

export default RoomBooking;