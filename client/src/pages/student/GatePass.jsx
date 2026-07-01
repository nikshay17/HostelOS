import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createGatePass, getMyGatePasses } from '../../services/gatePassService';
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
import { FiLogOut, FiCalendar, FiFileText, FiSend } from 'react-icons/fi';

const GatePass = () => {
  const { token } = useAuth();
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ reason: '', expectedReturnTime: '' });

  const fetchPasses = async () => {
    setLoading(true);
    try {
      const res = await getMyGatePasses(token);
      setPasses(res.data);
    } catch (err) {
      setError('Failed to load gate passes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPasses(); }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); setError('');
    setSubmitting(true);
    try {
      await createGatePass(form, token);
      setMessage('Gate pass requested — awaiting warden approval');
      setForm({ reason: '', expectedReturnTime: '' });
      fetchPasses();
    } catch (err) {
      setError(err.response?.data?.message || 'Request failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageLayout>
      <PageHeader
        title="Gate Pass"
        description="Request permission to leave the hostel premises"
      />
      <ErrorBanner message={error} />
      <SuccessBanner message={message} />

      {/* Request Form */}
      <Card className="p-6 mb-8">
        <SectionHeader title="New Gate Pass Request" description="Fill in the details below" />
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason for outing</label>
            <div className="relative">
              <FiFileText size={15} className="absolute left-3 top-3 text-gray-400" />
              <textarea
                placeholder="Briefly describe the purpose of your outing..."
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                required
                rows={3}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Expected return time</label>
            <div className="relative">
              <FiCalendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="datetime-local"
                value={form.expectedReturnTime}
                onChange={(e) => setForm({ ...form, expectedReturnTime: e.target.value })}
                required
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>
          </div>
          <Button type="submit" loading={submitting} iconLeft={<FiSend size={13} />}>
            Submit Request
          </Button>
        </form>
      </Card>

      {/* Gate Pass History */}
      <SectionHeader title="My Gate Passes" description="History of all your gate pass requests" />
      {loading ? <Loader /> : passes.length === 0 ? (
        <EmptyState title="No gate passes yet" description="Your gate pass history will appear here" icon={FiLogOut} />
      ) : (
        <div className="space-y-3">
          {passes.map(p => (
            <Card key={p._id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-gray-900">{p.reason}</p>
                    <Badge status={p.status} />
                  </div>
                  <p className="text-xs text-gray-400">
                    Expected return: {new Date(p.expectedReturnTime).toLocaleString()}
                  </p>
                  {p.status === 'completed' && (
                    <p className="text-xs text-success mt-1">
                      Returned: {new Date(p.actualReturnTime).toLocaleString()}
                    </p>
                  )}
                </div>
                {p.status === 'approved' && p.qrCode && (
                  <div className="shrink-0">
                    <p className="text-xs text-gray-400 mb-1 text-center">Show at gate</p>
                    <img src={p.qrCode} alt="Gate Pass QR" className="w-20 h-20 rounded-lg border border-gray-200" />
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  );
};

export default GatePass;