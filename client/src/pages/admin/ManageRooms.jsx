import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAllRooms, createRoom, updateRoom, deleteRoom } from '../../services/roomService';
import RoomCard from '../../components/room/RoomCard';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import Loader from '../../components/common/Loader';

const ManageRooms = () => {
  const { token } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ roomNumber: '', capacity: 2, floor: 1, type: 'double' });
  const [editingId, setEditingId] = useState(null);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await getAllRooms(token);
      setRooms(res.data);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRooms(); }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      if (editingId) {
        await updateRoom(editingId, form, token);
        setMessage('Room updated');
      } else {
        await createRoom(form, token);
        setMessage('Room created');
      }
      setForm({ roomNumber: '', capacity: 2, floor: 1, type: 'double' });
      setEditingId(null);
      fetchRooms();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (room) => {
    setForm({ roomNumber: room.roomNumber, capacity: room.capacity, floor: room.floor, type: room.type });
    setEditingId(room._id);
  };

  const handleDelete = async (id) => {
    try {
      await deleteRoom(id, token);
      fetchRooms();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <main style={{ padding: '1rem', flex: 1 }}>
          <h2>Manage Rooms</h2>
          {message && <p style={{ color: 'blue' }}>{message}</p>}

          <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem' }}>
            <input placeholder="Room Number" value={form.roomNumber}
              onChange={(e) => setForm({ ...form, roomNumber: e.target.value })} required />
            <input type="number" placeholder="Capacity" value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} required />
            <input type="number" placeholder="Floor" value={form.floor}
              onChange={(e) => setForm({ ...form, floor: Number(e.target.value) })} required />
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="single">Single</option>
              <option value="double">Double</option>
              <option value="triple">Triple</option>
            </select>
            <button type="submit">{editingId ? 'Update Room' : 'Add Room'}</button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setForm({ roomNumber: '', capacity: 2, floor: 1, type: 'double' }); }}>
                Cancel Edit
              </button>
            )}
          </form>

          {loading ? <Loader /> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              {rooms.map(room => (
                <RoomCard key={room._id} room={room} onEdit={handleEdit} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ManageRooms;