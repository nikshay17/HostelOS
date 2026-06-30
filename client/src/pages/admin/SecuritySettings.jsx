import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAuditLogs } from '../../services/securityService';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import Loader from '../../components/common/Loader';

const SecuritySettings = () => {
  const { token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [filterAction, setFilterAction] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (filterAction) filters.action = filterAction;
      const res = await getAuditLogs(token, filters);
      setLogs(res.data);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, [token, filterAction]);

  return (
    <div>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <main style={{ padding: '1rem', flex: 1 }}>
          <h2>Security — Audit Log</h2>
          {message && <p style={{ color: 'red' }}>{message}</p>}

          <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)} style={{ marginBottom: '1rem' }}>
            <option value="">All actions</option>
            <option value="CREATE_STAFF">Create Staff</option>
            <option value="DELETE_ROOM">Delete Room</option>
            <option value="APPROVE_BOOKING">Approve Booking</option>
          </select>

          {loading ? <Loader /> : logs.length === 0 ? <p>No audit logs found.</p> : (
            <table border="1" cellPadding="8">
              <thead>
                <tr><th>Action</th><th>Actor</th><th>Role</th><th>Details</th><th>IP</th><th>Time</th></tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log._id}>
                    <td>{log.action}</td>
                    <td>{log.actor?.name || 'Unknown'}</td>
                    <td>{log.actorRole}</td>
                    <td><code style={{ fontSize: '0.8rem' }}>{JSON.stringify(log.details)}</code></td>
                    <td>{log.ipAddress}</td>
                    <td>{new Date(log.createdAt).toLocaleString()}</td>
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

export default SecuritySettings;