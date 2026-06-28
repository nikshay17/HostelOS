import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getPendingGatePasses, approveGatePass, rejectGatePass, verifyGatePass
} from '../../services/gatePassService';
import QRScanner from '../../components/gatepass/QRScanner';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import Loader from '../../components/common/Loader';

const ApproveGatePass = () => {
  const { token } = useAuth();
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showScanner, setShowScanner] = useState(false);

  const fetchPasses = async () => {
    setLoading(true);
    try {
      const res = await getPendingGatePasses(token);
      setPasses(res.data);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to load gate passes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPasses(); }, [token]);

  const handleApprove = async (id) => {
    try {
      await approveGatePass(id, token);
      fetchPasses();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Approve failed');
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectGatePass(id, token);
      fetchPasses();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Reject failed');
    }
  };

  const handleScanSuccess = async (gatePassId) => {
    try {
      const res = await verifyGatePass(gatePassId, token);
      setMessage(`✅ ${res.data.gatePass.student.name} return verified`);
      setShowScanner(false);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Verification failed');
    }
  };

  const handleScanError = (errMsg) => {
    setMessage(errMsg);
  };

  return (
    <div>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <main style={{ padding: '1rem', flex: 1 }}>
          <h2>Gate Pass Management</h2>
          {message && <p style={{ color: 'blue' }}>{message}</p>}

          <button onClick={() => setShowScanner(!showScanner)} style={{ marginBottom: '1rem' }}>
            {showScanner ? 'Close Scanner' : 'Scan Returning Student QR'}
          </button>
          {showScanner && (
            <QRScanner onScanSuccess={handleScanSuccess} onScanError={handleScanError} />
          )}

          <h3>Pending Gate Pass Requests</h3>
          {loading ? <Loader /> : passes.length === 0 ? <p>No pending requests.</p> : (
            <table border="1" cellPadding="8">
              <thead>
                <tr><th>Student</th><th>Reason</th><th>Expected Return</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {passes.map(p => (
                  <tr key={p._id}>
                    <td>{p.student.name} ({p.student.studentId})</td>
                    <td>{p.reason}</td>
                    <td>{new Date(p.expectedReturnTime).toLocaleString()}</td>
                    <td>
                      <button onClick={() => handleApprove(p._id)}>Approve</button>
                      <button onClick={() => handleReject(p._id)} style={{ marginLeft: '0.5rem' }}>Reject</button>
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

export default ApproveGatePass;