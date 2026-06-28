import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAllRooms, requestBooking, getMyBookings, cancelBooking } from '../../services/roomService';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import Loader from '../../components/common/Loader';

const RoomBooking = () => {
  const { token } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [roomsRes, bookingsRes] = await Promise.all([
        getAllRooms(token),
        getMyBookings(token)
      ]);
      setRooms(roomsRes.data);
      setMyBookings(bookingsRes.data);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [token]);

  const handleRequest = async (roomId) => {
    setMessage('');
    try {
      await requestBooking(roomId, token);
      setMessage('Booking request sent — awaiting warden approval');
      fetchData();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Booking request failed');
    }
  };

  const handleCancel = async (bookingId) => {
    try {
      await cancelBooking(bookingId, token);
      fetchData();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Cancel failed');
    }
  };

  return (
    <div>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <main style={{ padding: '1rem', flex: 1 }}>
          <h2>Room Booking</h2>
          {message && <p style={{ color: 'blue' }}>{message}</p>}
          {loading ? <Loader /> : (
            <>
              <h3>My Bookings</h3>
              {myBookings.length === 0 ? <p>No bookings yet.</p> : (
                <ul>
                  {myBookings.map(b => (
                    <li key={b._id}>
                      Room {b.room.roomNumber} — Status: <strong>{b.status}</strong>
                      {b.status === 'pending' && (
                        <button onClick={() => handleCancel(b._id)} style={{ marginLeft: '0.5rem' }}>
                          Cancel
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              <h3>Available Rooms</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                {rooms.map(room => (
                  <div key={room._id} style={{ border: '1px solid #ccc', padding: '1rem' }}>
                    <h4>{room.roomNumber}</h4>
                    <p>Floor: {room.floor} | Type: {room.type}</p>
                    <p>Occupancy: {room.occupants.length}/{room.capacity}</p>
                    <p>Status: {room.status}</p>
                    <button
                      onClick={() => handleRequest(room._id)}
                      disabled={room.status !== 'available'}
                    >
                      Request Booking
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default RoomBooking;