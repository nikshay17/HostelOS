import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getPendingBookings, approveBooking, rejectBooking } from '../../services/roomService';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import Loader from '../../components/common/Loader';

const ManageBookings = () => {
  const { token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await getPendingBookings(token);
      setBookings(res.data);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, [token]);

  const handleApprove = async (id) => {
    try {
      await approveBooking(id, token);
      fetchBookings();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Approve failed');
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectBooking(id, token);
      fetchBookings();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Reject failed');
    }
  };

  return (
    <div>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <main style={{ padding: '1rem', flex: 1 }}>
          <h2>Pending Room Bookings</h2>
          {message && <p style={{ color: 'blue' }}>{message}</p>}
          {loading ? <Loader /> : bookings.length === 0 ? <p>No pending bookings.</p> : (
            <table border="1" cellPadding="8">
              <thead>
                <tr>
                  <th>Student</th><th>Room</th><th>Requested</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b._id}>
                    <td>{b.student.name} ({b.student.studentId})</td>
                    <td>{b.room.roomNumber} ({b.room.type})</td>
                    <td>{new Date(b.requestedAt).toLocaleString()}</td>
                    <td>
                      <button onClick={() => handleApprove(b._id)}>Approve</button>
                      <button onClick={() => handleReject(b._id)} style={{ marginLeft: '0.5rem' }}>Reject</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </main>
      </div>
    </div>
  );
};

export default ManageBookings;