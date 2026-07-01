import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { generateBills, getAllBills, markBillPaid, deleteBill } from '../../services/messBillService';
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
import { FiCreditCard, FiFilter, FiTrash2, FiCheck, FiZap } from 'react-icons/fi';

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

  const fetchBills = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (filterMonth) filters.month = filterMonth;
      if (filterStatus) filters.status = filterStatus;
      const res = await getAllBills(token, filters);
      setBills(res.data);
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

  const inputClass = "px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors";

  return (
    <PageLayout>
      <PageHeader title="Manage Mess Bills" description="Generate and track student mess bills" />
      <ErrorBanner message={error} />
      <SuccessBanner message={message} />

      <Card className="p-6 mb-6">
        <SectionHeader title="Generate Monthly Bills" description="Creates one bill per registered student" />
        <form onSubmit={handleGenerate} className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Month</label>
            <input
              placeholder="2026-06"
              value={genForm.month}
              onChange={(e) => setGenForm({ ...genForm, month: e.target.value })}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Amount (₹)</label>
            <input
              type="number"
              placeholder="3500"
              value={genForm.amount}
              onChange={(e) => setGenForm({ ...genForm, amount: Number(e.target.value) })}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Due Date</label>
            <input
              type="date"
              value={genForm.dueDate}
              onChange={(e) => setGenForm({ ...genForm, dueDate: e.target.value })}
              required
              className={inputClass}
            />
          </div>
          <Button type="submit" loading={generating} iconLeft={<FiZap size={13} />}>
            Generate Bills
          </Button>
        </form>
      </Card>

      <div className="flex items-center gap-3 mb-5">
        <FiFilter size={14} className="text-gray-400" />
        <input
          placeholder="Filter by month"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className={`${inputClass} w-36`}
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={inputClass}
        >
          <option value="">All statuses</option>
          <option value="unpaid">Unpaid</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {loading ? <Loader /> : bills.length === 0 ? (
        <EmptyState title="No bills found" description="Generate bills above or adjust your filters" icon={FiCreditCard} />
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Month</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Due</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bills.map(b => (
                  <tr key={b._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={b.student.name} size="sm" />
                        <div>
                          <p className="font-medium text-gray-900">{b.student.name}</p>
                          <p className="text-xs text-gray-400">{b.student.studentId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{b.month}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">₹{b.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(b.dueDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3"><Badge status={b.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {b.status !== 'paid' && (
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
                          className="text-danger hover:bg-danger-light"
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
    </PageLayout>
  );
};

export default ManageMessBills;