import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { broadcastNotification } from '../../services/notificationService';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';

const Broadcast = () => {
  const { token } = useAuth();
  const [form, setForm] = useState({ title: '', message: '', type: 'info' });
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    try {
      const res = await broadcastNotification(form, token);
      setStatus(res.data.message);
      setForm({ title: '', message: '', type: 'info' });
    } catch (err) {
      setStatus(err.response?.data?.message || 'Broadcast failed');
    }
  };

  return (
    <div>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <main style={{ padding: '1rem', flex: 1 }}>
          <h2>Send Announcement</h2>
          {status && <p style={{ color: 'blue' }}>{status}</p>}
          <form onSubmit={handleSubmit}>
            <input placeholder="Title" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <textarea placeholder="Message" value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })} required
              rows="4" style={{ width: '100%', marginTop: '0.5rem' }} />
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} style={{ marginTop: '0.5rem' }}>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="alert">Alert</option>
            </select>
            <br />
            <button type="submit" style={{ marginTop: '0.5rem' }}>Send to All Students</button>
          </form>
        </main>
      </div>
    </div>
  );
};

export default Broadcast;