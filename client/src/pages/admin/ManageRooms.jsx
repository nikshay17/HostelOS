import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAllRooms, createRoom, updateRoom, deleteRoom } from '../../services/roomService';
import PageLayout from '../../components/common/PageLayout';
import PageHeader from '../../components/common/PageHeader';
import SectionHeader from '../../components/common/SectionHeader';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import ErrorBanner from '../../components/common/ErrorBanner';
import SuccessBanner from '../../components/common/SuccessBanner';
import EmptyState from '../../components/common/EmptyState';
import { LuBedDouble } from 'react-icons/lu';
import { FiPlus, FiEdit2, FiTrash2, FiUsers, FiX, FiCheck } from 'react-icons/fi';

const EMPTY_FORM = { roomNumber: '', capacity: 2, floor: 1, type: 'double' };

const ManageRooms = () => {
  const { token } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await getAllRooms(token);
      setRooms(res.data);
    } catch (err) {
      setError('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRooms(); }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); setError('');
    setSubmitting(true);
    try {
      if (editingId) {
        await updateRoom(editingId, form, token);
        setMessage('Room updated successfully');
      } else {
        await createRoom(form, token);
        setMessage('Room created successfully');
      }
      setForm(EMPTY_FORM);
      setEditingId(null);
      setShowForm(false);
      fetchRooms();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (room) => {
    setForm({ roomNumber: room.roomNumber, capacity: room.capacity, floor: room.floor, type: room.type });
    setEditingId(room._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    setError('');
    try {
      await deleteRoom(id, token);
      fetchRooms();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleCancelEdit = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <PageLayout>
      <PageHeader
        title="Manage Rooms"
        description="Create and manage hostel room inventory"
        actions={
          !showForm && (
            <Button onClick={() => setShowForm(true)} iconLeft={<FiPlus size={14} />}>
              Add Room
            </Button>
          )
        }
      />
      <ErrorBanner message={error} />
      <SuccessBanner message={message} />

      {showForm && (
        <Card className="p-6 mb-6">
          <SectionHeader
            title={editingId ? 'Edit Room' : 'Add New Room'}
            actions={
              <Button variant="ghost" size="sm" onClick={handleCancelEdit} iconLeft={<FiX size={13} />}>
                Cancel
              </Button>
            }
          />
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Room Number</label>
              <input
                placeholder="e.g. A101"
                value={form.roomNumber}
                onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
                required
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Capacity</label>
              <input
                type="number"
                min={1}
                max={4}
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
                required
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Floor</label>
              <input
                type="number"
                min={1}
                value={form.floor}
                onChange={(e) => setForm({ ...form, floor: Number(e.target.value) })}
                required
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                <option value="single">Single</option>
                <option value="double">Double</option>
                <option value="triple">Triple</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" loading={submitting} iconLeft={<FiCheck size={13} />}>
                {editingId ? 'Update Room' : 'Create Room'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? <Loader /> : rooms.length === 0 ? (
        <EmptyState title="No rooms yet" description="Add your first room to get started" icon={LuBedDouble} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map(room => (
            <Card key={room._id} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">{room.roomNumber}</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 capitalize mt-0.5">{room.type} · Floor {room.floor}</p>
                </div>
                <Badge status={room.status} />
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mb-4">
                <FiUsers size={13} />
                {room.occupants.length}/{room.capacity} occupied
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleEdit(room)}
                  iconLeft={<FiEdit2 size={12} />}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(room._id)}
                  iconLeft={<FiTrash2 size={12} />}
                  className="text-danger hover:bg-danger-light"
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  );
};

export default ManageRooms;