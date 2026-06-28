import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createGatePass, getMyGatePasses } from '../../services/gatePassService';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import Loader from '../../components/common/Loader';

const GatePass = () => {
  const { token } = useAuth();
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ reason: '', expectedReturnTime: '' });

  const fetchPasses = async () => {
    setLoading(true);
    try {
      const res = await getMyGatePasses(token);
      setPasses(res.data);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to load gate passes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPasses(); }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await createGatePass(form, token);
      setMessage('Gate pass requested — awaiting warden approval');
      setForm({ reason: '', expectedReturnTime: '' });
      fetchPasses();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Request failed');
    }
  };

  return (
    <div>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <main style={{ padding: '1rem', flex: 1 }}>
          <h2>Gate Pass</h2>
          {message && <p style={{ color: 'blue' }}>{message}</p>}

          <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem' }}>
            <input placeholder="Reason for outing" value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })} required />
            <input type="datetime-local" value={form.expectedReturnTime}
              onChange={(e) => setForm({ ...form, expectedReturnTime: e.target.value })} required />
            <button type="submit">Request Gate Pass</button>
          </form>

          <h3>My Gate Passes</h3>
          {loading ? <Loader /> : passes.length === 0 ? <p>No gate passes yet.</p> : (
            <div>
              {passes.map(p => (
                <div key={p._id} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
                  <p><strong>Reason:</strong> {p.reason}</p>
                  <p><strong>Status:</strong> {p.status}</p>
                  <p><strong>Expected Return:</strong> {new Date(p.expectedReturnTime).toLocaleString()}</p>
                  {p.status === 'approved' && p.qrCode && (
                    <div>
                      <p>Show this QR code at the gate:</p>
                      <img src={p.qrCode} alt="Gate Pass QR" width="180" />
                    </div>
                  )}
                  {p.status === 'completed' && (
                    <p style={{ color: 'green' }}>Return verified at {new Date(p.actualReturnTime).toLocaleString()}</p>
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

export default GatePass;