import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createComplaint, getMyComplaints, deleteComplaint } from '../../services/complaintService';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import Loader from '../../components/common/Loader';

const Complaints = () => {
  const { token } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ category: 'maintenance', description: '' });

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await getMyComplaints(token);
      setComplaints(res.data);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComplaints(); }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await createComplaint(form, token);
      setMessage('Complaint filed successfully');
      setForm({ category: 'maintenance', description: '' });
      fetchComplaints();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to file complaint');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteComplaint(id, token);
      fetchComplaints();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Delete failed');
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
          <h2>Complaints</h2>
          {message && <p style={{ color: 'blue' }}>{message}</p>}

          <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem' }}>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="maintenance">Maintenance</option>
              <option value="mess">Mess</option>
              <option value="roommate">Roommate</option>
              <option value="other">Other</option>
            </select>
            <textarea placeholder="Describe the issue" value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} required
              style={{ width: '100%', marginTop: '0.5rem' }} rows="3" />
            <button type="submit" style={{ marginTop: '0.5rem' }}>File Complaint</button>
          </form>

          <h3>My Complaints</h3>
          {loading ? <Loader /> : complaints.length === 0 ? <p>No complaints filed yet.</p> : (
            <div>
              {complaints.map(c => (
                <div key={c._id} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
                  <p><strong>Category:</strong> {c.category}</p>
                  <p><strong>Description:</strong> {c.description}</p>
                  <p><strong>Status:</strong> <span style={{ color: statusColor(c.status), fontWeight: 'bold' }}>{c.status}</span></p>
                  {c.resolutionNotes && <p><strong>Resolution Notes:</strong> {c.resolutionNotes}</p>}
                  {c.status === 'open' && (
                    <button onClick={() => handleDelete(c._id)}>Delete</button>
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

export default Complaints;