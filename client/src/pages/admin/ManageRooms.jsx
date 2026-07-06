import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getAllRooms, createRoom, updateRoom, deleteRoom,
  removeStudentFromRoom, assignStudentToRoom, getAvailableStudents
} from '../../services/roomService';
import PageLayout from '../../components/common/PageLayout';
import PageHeader from '../../components/common/PageHeader';
import SectionHeader from '../../components/common/SectionHeader';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import Loader from '../../components/common/Loader';
import ErrorBanner from '../../components/common/ErrorBanner';
import SuccessBanner from '../../components/common/SuccessBanner';
import EmptyState from '../../components/common/EmptyState';
import { LuBedDouble } from 'react-icons/lu';
import {
  FiPlus, FiEdit2, FiTrash2, FiUsers,
  FiX, FiCheck, FiUserMinus, FiUserPlus, FiSearch
} from 'react-icons/fi';

const EMPTY_FORM = { roomNumber: '', capacity: 2, floor: 1, type: 'double' };

// ─── ASSIGN STUDENT MODAL ─────────────────────────────────────────────────────
const AssignModal = ({ room, onClose, onSuccess }) => {
  const { token } = useAuth();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAvailableStudents();
  }, []);

  const fetchAvailableStudents = async () => {
    try {
      setLoading(true);
      const response = await getAvailableStudents(token);
      setStudents(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent) { setError('Please select a student'); return; }
    setError('');
    setSubmitting(true);
    try {
      await assignStudentToRoom(room._id, selectedStudent._id, token);
      onSuccess(`${selectedStudent.name} assigned to room ${room.roomNumber} successfully`);
    } catch (err) {
      setError(err.response?.data?.message || 'Assignment failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Assign Student to Room {room.roomNumber}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {room.occupants.length}/{room.capacity} occupied
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          >
            <FiX size={14} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="bg-danger-light dark:bg-danger/10 border border-red-200 dark:border-danger/30 text-danger-dark dark:text-danger px-3 py-2 rounded-lg text-xs">
              {error}
            </div>
          )}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Search & Select Student
            </label>
            <div className="relative">
              <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, ID, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
              />
            </div>
            
            <div className="max-h-64 overflow-y-auto border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800">
              {loading ? (
                <div className="p-4 text-center text-gray-500">Loading students...</div>
              ) : filteredStudents.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-xs">
                  {students.length === 0 ? 'No available students' : 'No matching students'}
                </div>
              ) : (
                filteredStudents.map((student) => (
                  <label
                    key={student._id}
                    className="flex items-center p-3 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors last:border-b-0"
                  >
                    <input
                      type="radio"
                      name="student"
                      value={student._id}
                      checked={selectedStudent?._id === student._id}
                      onChange={() => setSelectedStudent(student)}
                      className="w-4 h-4 text-primary"
                    />
                    <div className="ml-3 flex-1">
                      <p className="text-xs font-medium text-gray-900 dark:text-white">{student.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{student.studentId} • {student.email}</p>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>
          
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              loading={submitting}
              disabled={!selectedStudent}
              iconLeft={<FiUserPlus size={13} />}
            >
              Assign
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── ROOM CARD ────────────────────────────────────────────────────────────────
const RoomCard = ({ room, onEdit, onDelete, onRemoveStudent, onAssignStudent }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="overflow-hidden">
      {/* Card header */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-base font-bold text-gray-900 dark:text-white">{room.roomNumber}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 capitalize">
              {room.type} · Floor {room.floor}
            </p>
          </div>
          <Badge status={room.status} />
        </div>

        {/* Occupancy bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <FiUsers size={11} />
              {room.occupants.length}/{room.capacity} occupied
            </span>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              {Math.round((room.occupants.length / room.capacity) * 100)}%
            </span>
          </div>
          <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(room.occupants.length / room.capacity) * 100}%`,
                background: room.occupants.length >= room.capacity ? '#dc2626' : '#16a34a'
              }}
            />
          </div>
        </div>

        {/* Occupants preview */}
        {room.occupants.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              {room.occupants.slice(0, 2).map(student => (
                <div
                  key={student._id}
                  className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-lg"
                >
                  <Avatar name={student.name} size="sm" />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 max-w-[100px] truncate">
                    {student.name}
                  </span>
                </div>
              ))}
              {room.occupants.length > 2 && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-xs text-primary hover:underline"
                >
                  +{room.occupants.length - 2} more
                </button>
              )}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {room.occupants.length < room.capacity && room.status !== 'maintenance' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onAssignStudent(room)}
              iconLeft={<FiUserPlus size={12} />}
            >
              Assign
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onEdit(room)}
            iconLeft={<FiEdit2 size={12} />}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(room._id)}
            iconLeft={<FiTrash2 size={12} />}
            className="text-danger hover:bg-danger-light dark:hover:bg-danger/20"
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Expanded occupant list */}
      {room.occupants.length > 0 && (
        <div className="border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full px-5 py-2.5 flex items-center justify-between text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <span>
              {expanded ? 'Hide' : 'Show'} occupants ({room.occupants.length})
            </span>
            <FiUsers size={12} />
          </button>

          {expanded && (
            <div className="px-5 pb-4 space-y-2">
              {room.occupants.map(student => (
                <div
                  key={student._id}
                  className="flex items-center justify-between gap-3 p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar name={student.name} size="sm" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                        {student.name}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {student.studentId} · {student.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveStudent(room, student)}
                    className="shrink-0 flex items-center gap-1 text-xs text-danger hover:text-red-700 dark:hover:text-red-400 font-medium px-2 py-1 rounded-lg hover:bg-danger-light dark:hover:bg-danger/20 transition-all"
                  >
                    <FiUserMinus size={12} />
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
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
  const [assignTarget, setAssignTarget] = useState(null);
  const [confirmRemove, setConfirmRemove] = useState(null); // { room, student }

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllRooms(token);
      setRooms(res.data);
    } catch (err) {
      setError('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

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
    setForm({
      roomNumber: room.roomNumber,
      capacity: room.capacity,
      floor: room.floor,
      type: room.type
    });
    setEditingId(room._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    setError('');
    try {
      await deleteRoom(id, token);
      setMessage('Room deleted');
      fetchRooms();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleRemoveStudent = async () => {
    if (!confirmRemove) return;
    setError('');
    try {
      await removeStudentFromRoom(confirmRemove.room._id, confirmRemove.student._id, token);
      setMessage(`${confirmRemove.student.name} removed from room ${confirmRemove.room.roomNumber}`);
      setConfirmRemove(null);
      fetchRooms();
    } catch (err) {
      setError(err.response?.data?.message || 'Remove failed');
      setConfirmRemove(null);
    }
  };

  const handleAssignSuccess = (msg) => {
    setMessage(msg);
    setAssignTarget(null);
    fetchRooms();
  };

  const handleCancelEdit = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  const inputClass = `
    w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700
    rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
    bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors
  `;

  // Summary stats
  const totalRooms    = rooms.length;
  const totalOccupied = rooms.reduce((s, r) => s + r.occupants.length, 0);
  const totalCapacity = rooms.reduce((s, r) => s + r.capacity, 0);
  const available     = rooms.filter(r => r.status === 'available').length;

  return (
    <PageLayout>
      <PageHeader
        title="Manage Rooms"
        description="Create, edit, and manage hostel room inventory and student allocations"
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

      {/* Summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Rooms',   value: totalRooms,    color: 'text-primary' },
          { label: 'Available',     value: available,      color: 'text-success' },
          { label: 'Total Beds',    value: totalCapacity,  color: 'text-gray-700 dark:text-gray-300' },
          { label: 'Occupied Beds', value: totalOccupied,  color: 'text-warning' },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 text-center shadow-sm"
          >
            <p className={`text-2xl font-bold tabular-nums ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Add/Edit form */}
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
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Room Number</label>
              <input
                placeholder="e.g. A101"
                value={form.roomNumber}
                onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Capacity</label>
              <input
                type="number" min={1} max={4}
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Floor</label>
              <input
                type="number" min={1}
                value={form.floor}
                onChange={(e) => setForm({ ...form, floor: Number(e.target.value) })}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className={inputClass}
              >
                <option value="single">Single</option>
                <option value="double">Double</option>
                <option value="triple">Triple</option>
              </select>
            </div>
            <div className="sm:col-span-2 lg:col-span-4">
              <Button type="submit" loading={submitting} iconLeft={<FiCheck size={13} />}>
                {editingId ? 'Update Room' : 'Create Room'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Room grid */}
      {loading ? <Loader /> : rooms.length === 0 ? (
        <EmptyState
          title="No rooms yet"
          description="Add your first room to get started"
          icon={LuBedDouble}
          action={
            <Button onClick={() => setShowForm(true)} iconLeft={<FiPlus size={13} />} size="sm">
              Add Room
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map(room => (
            <RoomCard
              key={room._id}
              room={room}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onRemoveStudent={(room, student) => setConfirmRemove({ room, student })}
              onAssignStudent={setAssignTarget}
            />
          ))}
        </div>
      )}

      {/* Assign student modal */}
      {assignTarget && (
        <AssignModal
          room={assignTarget}
          onClose={() => setAssignTarget(null)}
          onSuccess={handleAssignSuccess}
        />
      )}

      {/* Remove student confirmation */}
      {confirmRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-danger-light dark:bg-danger/20 rounded-xl">
                <FiUserMinus size={18} className="text-danger" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Remove Student
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">This action cannot be undone</p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 mb-5">
              <div className="flex items-center gap-2.5">
                <Avatar name={confirmRemove.student.name} size="sm" />
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {confirmRemove.student.name}
                  </p>
                  <p className="text-xs text-gray-400">{confirmRemove.student.studentId}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Will be removed from room <span className="font-semibold text-gray-900 dark:text-white">{confirmRemove.room.roomNumber}</span>.
                They can request a new room afterwards.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setConfirmRemove(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={handleRemoveStudent}
                iconLeft={<FiUserMinus size={13} />}
              >
                Remove
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default ManageRooms;