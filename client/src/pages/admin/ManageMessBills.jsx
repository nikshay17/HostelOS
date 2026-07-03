import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  generateBills, getAllBills, approvePayment,
  rejectPayment, markBillPaid, deleteBill
} from '../../services/messBillService';
import PageLayout from '../../components/common/PageLayout';
import PageHeader from '../../components/common/PageHeader';
import SectionHeader from '../../components/common/SectionHeader';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import Loader from '../../components/common/Loader';
import ErrorBanner from '../../components/common/ErrorBanner';
import SuccessBanner from '../../components/common/SuccessBanner';
import EmptyState from '../../components/common/EmptyState';
import {
  FiCreditCard, FiFilter, FiTrash2, FiCheck,
  FiZap, FiX, FiEye, FiAlertTriangle, FiHash
} from 'react-icons/fi';

// Rejection modal
const RejectModal = ({ bill, onClose, onSuccess }) => {
  const { token } = useAuth();
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await rejectPayment(bill._id, { rejectionReason: reason || 'Payment could not be verified' }, token);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Rejection failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-danger-light dark:bg-danger/20 rounded-lg">
              <FiAlertTriangle size={14} className="text-danger" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Reject Payment</h3>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
            <FiX size={14} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <ErrorBanner message={error} />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Student: <span className="font-semibold text-gray-900 dark:text-white">{bill.student?.name}</span>
              <br />
              Transaction ID: <span className="font-mono font-semibold text-gray-900 dark:text-white">{bill.transactionId}</span>
            </p>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Rejection reason
            </label>
            <textarea
              placeholder="e.g. Transaction ID not found, Amount mismatch..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-danger/30 focus:border-danger bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors resize-none"
            />
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="danger" className="flex-1" loading={submitting} iconLeft={<FiX size={13} />}>
              Reject Payment
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Transaction detail panel
const TransactionDetail = ({ bill, onClose, onApprove, onReject }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
    <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary-light dark:bg-primary/20 rounded-lg">
            <FiEye size={14} className="text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Payment Proof</h3>
        </div>
        <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
          <FiX size={14} />
        </button>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <Avatar name={bill.student?.name || '?'} size="md" />
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{bill.student?.name}</p>
            <p className="text-xs text-gray-400">{bill.student?.studentId} · Room {bill.student?.roomNumber || 'N/A'}</p>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-3 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">Month</span>
            <span className="text-xs font-semibold text-gray-900 dark:text-white">{bill.month}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">Amount</span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">₹{bill.amount?.toLocaleString()}</span>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">Transaction ID</span>
              <span className="text-xs font-mono font-bold text-primary">{bill.transactionId}</span>
            </div>
            {bill.paymentMethod && (
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">Payment method</span>
                <span className="text-xs font-semibold text-gray-900 dark:text-white capitalize">{bill.paymentMethod}</span>
              </div>
            )}
            {bill.paymentNote && (
              <div className="mt-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">Student note</span>
                <p className="text-xs text-gray-700 dark:text-gray-300 mt-0.5 italic">"{bill.paymentNote}"</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="danger"
            size="sm"
            className="flex-1"
            onClick={onReject}
            iconLeft={<FiX size={13} />}
          >
            Reject
          </Button>
          <Button
            variant="success"
            size="sm"
            className="flex-1"
            onClick={onApprove}
            iconLeft={<FiCheck size={13} />}
          >
            Approve
          </Button>
        </div>
      </div>
    </div>
  </div>
);

const ManageMessBills = () => {
  const { token } = useAuth();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [genForm, setGenForm] = useState({ month: '', amount: '', dueDate: '' });
  const [generating, setGenerating] = useState(false);
  const [filterMonth, setFilterMonth] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [viewBill, setViewBill] = useState(null);
  const [rejectBill, setRejectBill] = useState(null);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (filterMonth) filters.month = filterMonth;
      if (filterStatus) filters.status = filterStatus;
      const res = await getAllBills(token, filters);
      setBills(res.data.filter(b => b.student !== null));
    } catch (err) {
      setError('Failed to load bills');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBills(); }, [token, filterMonth, filterStatus]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setMessage(''); setError('');
    setGenerating(true);
    try {
      const res = await generateBills(genForm, token);
      setMessage(res.data.message);
      setGenForm({ month: '', amount: '', dueDate: '' });
      fetchBills();
    } catch (err) {
      setError(err.response?.data?.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleApprove = async (billId) => {
    try {
      await approvePayment(billId, token);
      setViewBill(null);
      setMessage('Payment approved and student notified');
      fetchBills();
    } catch (err) {
      setError(err.response?.data?.message || 'Approval failed');
    }
  };

  const handleMarkPaid = async (id) => {
    try {
      await markBillPaid(id, token);
      fetchBills();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark as paid');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteBill(id, token);
      fetchBills();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  const pendingVerificationCount = bills.filter(b => b.status === 'pending_verification').length;

  const inputClass = `
    px-3 py-2 text-sm border border-gray-300 dark:border-gray-700
    rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
    bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors
  `;

  return (
    <PageLayout>
      <PageHeader
        title="Manage Mess Bills"
        description="Generate bills and verify student payment submissions"
      />
      <ErrorBanner message={error} />
      <SuccessBanner message={message} />

      {/* Pending verification alert */}
      {pendingVerificationCount > 0 && (
        <div className="bg-primary-light dark:bg-primary/10 border border-primary/20 rounded-2xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-light dark:bg-primary/20 rounded-xl">
              <FiHash size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-primary">
                {pendingVerificationCount} payment{pendingVerificationCount > 1 ? 's' : ''} awaiting verification
              </p>
              <p className="text-xs text-primary/70 mt-0.5">
                Filter by "Pending Verification" to review
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => setFilterStatus('pending_verification')}
          >
            Review now
          </Button>
        </div>
      )}

      {/* Generate form */}
      <Card className="p-6 mb-6">
        <SectionHeader title="Generate Monthly Bills" description="Creates one bill per registered student" />
        <form onSubmit={handleGenerate} className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Month</label>
            <input placeholder="2026-07" value={genForm.month}
              onChange={(e) => setGenForm({ ...genForm, month: e.target.value })}
              required className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Amount (₹)</label>
            <input type="number" placeholder="3500" value={genForm.amount}
              onChange={(e) => setGenForm({ ...genForm, amount: Number(e.target.value) })}
              required className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Due Date</label>
            <input type="date" value={genForm.dueDate}
              onChange={(e) => setGenForm({ ...genForm, dueDate: e.target.value })}
              required className={inputClass} />
          </div>
          <Button type="submit" loading={generating} iconLeft={<FiZap size={13} />}>
            Generate Bills
          </Button>
        </form>
      </Card>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <FiFilter size={14} className="text-gray-400 shrink-0" />
        <input placeholder="Filter by month"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className={`${inputClass} w-36`}
        />
        <select value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={inputClass}
        >
          <option value="">All statuses</option>
          <option value="unpaid">Unpaid</option>
          <option value="pending_verification">Pending Verification</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </select>
        {filterStatus && (
          <Button variant="ghost" size="sm" onClick={() => setFilterStatus('')} iconLeft={<FiX size={12} />}>
            Clear
          </Button>
        )}
      </div>

      {/* Bills table */}
      {loading ? <Loader /> : bills.length === 0 ? (
        <EmptyState title="No bills found" description="Generate bills above or adjust your filters" icon={FiCreditCard} />
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Month</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Due</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Transaction</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {bills.map(b => (
                  <tr key={b._id} className={`transition-colors ${
                    b.status === 'pending_verification'
                      ? 'bg-primary-light/30 dark:bg-primary/5 hover:bg-primary-light/50 dark:hover:bg-primary/10'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={b.student?.name || '?'} size="sm" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">{b.student?.name}</p>
                          <p className="text-xs text-gray-400">{b.student?.studentId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{b.month}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                      ₹{b.amount?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                      {new Date(b.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3"><Badge status={b.status} /></td>
                    <td className="px-4 py-3">
                      {b.transactionId ? (
                        <span className="font-mono text-xs text-primary font-semibold bg-primary-light dark:bg-primary/20 px-2 py-0.5 rounded-lg">
                          {b.transactionId}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 dark:text-gray-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {b.status === 'pending_verification' && (
                          <Button
                            size="sm"
                            onClick={() => setViewBill(b)}
                            iconLeft={<FiEye size={12} />}
                          >
                            Review
                          </Button>
                        )}
                        {b.status !== 'paid' && b.status !== 'pending_verification' && (
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleMarkPaid(b._id)}
                            iconLeft={<FiCheck size={12} />}
                          >
                            Mark Paid
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(b._id)}
                          iconLeft={<FiTrash2 size={12} />}
                          className="text-danger hover:bg-danger-light dark:hover:bg-danger/20"
                        >
                          Delete
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

      {/* Transaction detail modal */}
      {viewBill && (
        <TransactionDetail
          bill={viewBill}
          onClose={() => setViewBill(null)}
          onApprove={() => handleApprove(viewBill._id)}
          onReject={() => { setRejectBill(viewBill); setViewBill(null); }}
        />
      )}

      {/* Rejection modal */}
      {rejectBill && (
        <RejectModal
          bill={rejectBill}
          onClose={() => setRejectBill(null)}
          onSuccess={() => {
            setRejectBill(null);
            setMessage('Payment rejected and student notified');
            fetchBills();
          }}
        />
      )}
    </PageLayout>
  );
};

export default ManageMessBills;