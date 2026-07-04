import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createComplaint, getMyComplaints, deleteComplaint } from '../../services/complaintService';
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
import { FiAlertCircle, FiTrash2, FiSend } from 'react-icons/fi';

const Complaints = () => {
  const { token } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ category: 'maintenance', description: '' });

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await getMyComplaints(token);
      setComplaints(res.data);
    } catch (err) {
      setError('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComplaints(); }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); setError('');
    setSubmitting(true);
    try {
      await createComplaint(form, token);
      setMessage('Complaint filed successfully');
      setForm({ category: 'maintenance', description: '' });
      fetchComplaints();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to file complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setError('');
    try {
      await deleteComplaint(id, token);
      fetchComplaints();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <PageLayout>
      <PageHeader title="Complaints" description="File and track your hostel complaints" />
      <ErrorBanner message={error} />
      <SuccessBanner message={message} />

      <Card className="p-6 mb-8">
        <SectionHeader title="File a New Complaint" description="Describe your issue clearly" />
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            >
              <option value="maintenance">Maintenance</option>
              <option value="mess">Mess</option>
              <option value="roommate">Roommate</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
            <textarea
              placeholder="Describe your issue in detail..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
              rows={4}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />
          </div>
          <Button type="submit" loading={submitting} iconLeft={<FiSend size={13} />}>
            File Complaint
          </Button>
        </form>
      </Card>

      <SectionHeader title="My Complaints" description="Track the status of your filed complaints" />
      {loading ? <Loader /> : complaints.length === 0 ? (
        <EmptyState title="No complaints filed" description="Your complaint history will appear here" icon={FiAlertCircle} />
      ) : (
        <div className="space-y-3">
          {complaints.map(c => (
            <Card key={c._id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white capitalize">{c.category}</span>
                    <Badge status={c.status} />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{c.description}</p>
                  {c.resolutionNotes && (
                    <div className="mt-2 p-2.5 bg-success-light rounded-lg">
                      <p className="text-xs text-success-dark font-medium">Resolution: {c.resolutionNotes}</p>
                    </div>
                  )}
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{new Date(c.createdAt).toLocaleDateString()}</p>
                </div>
                {c.status === 'open' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(c._id)}
                    iconLeft={<FiTrash2 size={13} />}
                    className="text-danger hover:bg-danger-light shrink-0"
                  >
                    Delete
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  );
};

export default Complaints;