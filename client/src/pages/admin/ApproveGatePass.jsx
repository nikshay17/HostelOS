import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getPendingGatePasses, approveGatePass, rejectGatePass, verifyGatePass } from '../../services/gatePassService';
import QRScanner from '../../components/gatepass/QRScanner';
import PageLayout from '../../components/common/PageLayout';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import Loader from '../../components/common/Loader';
import ErrorBanner from '../../components/common/ErrorBanner';
import SuccessBanner from '../../components/common/SuccessBanner';
import EmptyState from '../../components/common/EmptyState';
import { FiLogOut, FiCamera, FiCheck, FiX } from 'react-icons/fi';

const ApproveGatePass = () => {
  const { token } = useAuth();
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [processing, setProcessing] = useState(null);

  const fetchPasses = async () => {
    setLoading(true);
    try {
      const res = await getPendingGatePasses(token);
      setPasses(res.data);
    } catch (err) {
      setError('Failed to load gate passes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPasses(); }, [token]);

  const handle = async (id, action) => {
    setMessage(''); setError('');
    setProcessing(id);
    try {
      if (action === 'approve') await approveGatePass(id, token);
      else await rejectGatePass(id, token);
      setMessage(`Gate pass ${action}d successfully`);
      fetchPasses();
    } catch (err) {
      setError(err.response?.data?.message || `${action} failed`);
    } finally {
      setProcessing(null);
    }
  };

  const handleScanSuccess = useCallback(async (gatePassId) => {
    try {
      const res = await verifyGatePass(gatePassId, token);
      setMessage(`${res.data.gatePass.student.name} return verified successfully`);
      setShowScanner(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    }
  }, [token]);

  const handleScanError = useCallback((errMsg) => {
    setError(errMsg);
  }, []);

  return (
    <PageLayout>
      <PageHeader
        title="Gate Pass Management"
        description="Review requests and verify student returns"
        actions={
          <Button
            variant={showScanner ? 'secondary' : 'primary'}
            onClick={() => setShowScanner(!showScanner)}
            iconLeft={<FiCamera size={14} />}
          >
            {showScanner ? 'Close Scanner' : 'Scan QR Return'}
          </Button>
        }
      />
      <ErrorBanner message={error} />
      <SuccessBanner message={message} />

      {showScanner && (
        <div className="mb-6 p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-card">
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Scan Student Return QR</p>
          <QRScanner onScanSuccess={handleScanSuccess} onScanError={handleScanError} />
        </div>
      )}

      {loading ? <Loader /> : passes.length === 0 ? (
        <EmptyState title="No pending gate passes" description="All gate pass requests have been processed" icon={FiLogOut} />
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reason</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Expected Return</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {passes.map(p => (
                  <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={p.student.name} size="sm" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{p.student.name}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">{p.student.studentId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300 max-w-xs">
                      <p className="truncate">{p.reason}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{new Date(p.expectedReturnTime).toLocaleString()}</td>
                    <td className="px-4 py-3"><Badge status={p.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="success"
                          size="sm"
                          loading={processing === p._id}
                          onClick={() => handle(p._id, 'approve')}
                          iconLeft={<FiCheck size={12} />}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          disabled={processing === p._id}
                          onClick={() => handle(p._id, 'reject')}
                          iconLeft={<FiX size={12} />}
                        >
                          Reject
                        </Button>
                      </div>
                    </td>
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

export default ApproveGatePass;