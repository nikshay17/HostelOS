import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAuditLogs } from '../../services/securityService';
import PageLayout from '../../components/common/PageLayout';
import PageHeader from '../../components/common/PageHeader';
import Avatar from '../../components/common/Avatar';
import Loader from '../../components/common/Loader';
import ErrorBanner from '../../components/common/ErrorBanner';
import EmptyState from '../../components/common/EmptyState';
import { FiShield, FiFilter } from 'react-icons/fi';

const ACTION_COLORS = {
  CREATE_STAFF: 'bg-primary-light text-primary',
  DELETE_ROOM: 'bg-danger-light text-danger',
  APPROVE_BOOKING: 'bg-success-light text-success',
};

const SecuritySettings = () => {
  const { token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterAction, setFilterAction] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (filterAction) filters.action = filterAction;
      const res = await getAuditLogs(token, filters);
      setLogs(res.data);
    } catch (err) {
      setError('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, [token, filterAction]);

  return (
    <PageLayout>
      <PageHeader
        title="Security & Audit Log"
        description="Track all sensitive actions performed in the system"
        actions={<span className="text-sm text-gray-500 dark:text-gray-400">{logs.length} records</span>}
      />
      <ErrorBanner message={error} />

      <div className="flex items-center gap-3 mb-5">
        <FiFilter size={14} className="text-gray-400" />
        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
        >
          <option value="">All actions</option>
          <option value="CREATE_STAFF">Create Staff</option>
          <option value="DELETE_ROOM">Delete Room</option>
          <option value="APPROVE_BOOKING">Approve Booking</option>
        </select>
      </div>

      {loading ? <Loader /> : logs.length === 0 ? (
        <EmptyState title="No audit logs" description="Sensitive actions will be recorded here" icon={FiShield} />
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actor</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Details</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">IP Address</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map(log => (
                    <tr key={log._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${ACTION_COLORS[log.action] || 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={log.actor?.name || '?'} size="sm" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{log.actor?.name || 'Unknown'}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">{log.actorRole}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300">
                        {JSON.stringify(log.details)}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs font-mono">{log.ipAddress}</td>
                    <td className="px-4 py-3 text-gray-400 dark:text-gray-500 text-xs">{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default SecuritySettings;