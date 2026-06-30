import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAllComplaints, updateComplaintStatus } from '../../services/complaintService';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import Loader from '../../components/common/Loader';

const ManageComplaints = () => {
  const { token } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [notesDraft, setNotesDraft] = useState({});

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (filterStatus) filters.status = filterStatus;
      if (filterCategory) filters.category = filterCategory;
      const res = await getAllComplaints(token, filters);
      setComplaints(res.data);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComplaints(); }, [token, filterStatus, filterCategory]);

  const handleStatusChange = async (id, status) => {
    try {
      await updateComplaintStatus(id, { status, resolutionNotes: notesDraft[id] || '' }, token);
      setMessage(`Complaint marked as ${status}`);
      fetchComplaints();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Update failed');
    }
  };

  const statusColor = (status) => {
    if (status === 'resolved') return 'green';
    if (status === 'in-progress') return 'orange';
    return 'gray';
  };

  return (
    <div>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <main style={{ padding: '1rem', flex: 1 }}>
          <h2>Manage Complaints</h2>
          {message && <p style={{ color: 'blue' }}>{message}</p>}

          <div style={{ marginBottom: '1rem' }}>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">All statuses</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={{ marginLeft: '0.5rem' }}>
              <option value="">All categories</option>
              <option value="maintenance">Maintenance</option>
              <option value="mess">Mess</option>
              <option value="roommate">Roommate</option>
              <option value="other">Other</option>
            </select>
          </div>

          {loading ? <Loader /> : complaints.length === 0 ? <p>No complaints found.</p> : (
            <div>
              {complaints.map(c => (
                <div key={c._id} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
                  <p><strong>Student:</strong> {c.student.name} ({c.student.studentId}) — Room {c.student.roomNumber || 'N/A'}</p>
                  <p><strong>Category:</strong> {c.category}</p>
                  <p><strong>Description:</strong> {c.description}</p>
                  <p><strong>Status:</strong> <span style={{ color: statusColor(c.status), fontWeight: 'bold' }}>{c.status}</span></p>
                  {c.resolvedBy && <p><strong>Resolved By:</strong> {c.resolvedBy.name}</p>}

                  {c.status !== 'resolved' && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <textarea
                        placeholder="Resolution notes (optional)"
                        value={notesDraft[c._id] || ''}
                        onChange={(e) => setNotesDraft({ ...notesDraft, [c._id]: e.target.value })}
                        rows="2"
                        style={{ width: '100%' }}
                      />
                      <div style={{ marginTop: '0.5rem' }}>
                        {c.status === 'open' && (
                          <button onClick={() => handleStatusChange(c._id, 'in-progress')}>Mark In Progress</button>
                        )}
                        <button onClick={() => handleStatusChange(c._id, 'resolved')} style={{ marginLeft: '0.5rem' }}>
                          Mark Resolved
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ManageComplaints;