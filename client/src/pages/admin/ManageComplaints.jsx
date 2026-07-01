import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAllComplaints, updateComplaintStatus } from '../../services/complaintService';
import PageLayout from '../../components/common/PageLayout';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import Loader from '../../components/common/Loader';
import ErrorBanner from '../../components/common/ErrorBanner';
import SuccessBanner from '../../components/common/SuccessBanner';
import EmptyState from '../../components/common/EmptyState';
import { FiAlertCircle, FiFilter } from 'react-icons/fi';

const ManageComplaints = () => {
  const { token } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [notesDraft, setNotesDraft] = useState({});
  const [processing, setProcessing] = useState(null);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (filterStatus) filters.status = filterStatus;
      if (filterCategory) filters.category = filterCategory;
      const res = await getAllComplaints(token, filters);
      setComplaints(res.data);
    } catch (err) {
      setError('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComplaints(); }, [token, filterStatus, filterCategory]);

  const handleStatusChange = async (id, status) => {
    setMessage(''); setError('');
    setProcessing(id);
    try {
      await updateComplaintStatus(id, { status, resolutionNotes: notesDraft[id] || '' }, token);
      setMessage(`Complaint marked as ${status}`);
      fetchComplaints();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setProcessing(null);
    }
  };

  const selectClass = "px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white";

  return (
    <PageLayout>
      <PageHeader
        title="Manage Complaints"
        description="Review and resolve student complaints"
        actions={<span className="text-sm text-gray-500">{complaints.length} complaints</span>}
      />
      <ErrorBanner message={error} />
      <SuccessBanner message={message} />

      <div className="flex items-center gap-3 mb-5">
        <FiFilter size={14} className="text-gray-400" />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={selectClass}>
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className={selectClass}>
          <option value="">All categories</option>
          <option value="maintenance">Maintenance</option>
          <option value="mess">Mess</option>
          <option value="roommate">Roommate</option>
          <option value="other">Other</option>
        </select>
      </div>

      {loading ? <Loader /> : complaints.length === 0 ? (
        <EmptyState title="No complaints found" description="No complaints match the selected filters" icon={FiAlertCircle} />
      ) : (
        <div className="space-y-3">
          {complaints.map(c => (
            <div key={c._id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-card">
              <div className="flex items-start gap-3 mb-3">
                <Avatar name={c.student.name} size="sm" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-gray-900">{c.student.name}</span>
                    <span className="text-xs text-gray-400">({c.student.studentId})</span>
                    {c.student.roomNumber && (
                      <span className="text-xs text-gray-400">· Room {c.student.roomNumber}</span>
                    )}
                    <Badge status={c.status} />
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">{c.category}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1.5">{c.description}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(c.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {c.status !== 'resolved' && (
                <div className="border-t border-gray-100 pt-3 mt-3">
                  <textarea
                    placeholder="Add resolution notes (optional)..."
                    value={notesDraft[c._id] || ''}
                    onChange={(e) => setNotesDraft({ ...notesDraft, [c._id]: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none mb-2"
                  />
                  <div className="flex items-center gap-2">
                    {c.status === 'open' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        loading={processing === c._id}
                        onClick={() => handleStatusChange(c._id, 'in-progress')}
                      >
                        Mark In Progress
                      </Button>
                    )}
                    <Button
                      variant="success"
                      size="sm"
                      loading={processing === c._id}
                      onClick={() => handleStatusChange(c._id, 'resolved')}
                    >
                      Mark Resolved
                    </Button>
                  </div>
                </div>
              )}
              {c.status === 'resolved' && c.resolvedBy && (
                <p className="text-xs text-gray-400 border-t border-gray-100 pt-2 mt-2">
                  Resolved by {c.resolvedBy.name}
                  {c.resolutionNotes && ` · "${c.resolutionNotes}"`}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </PageLayout>
  );
};

export default ManageComplaints;