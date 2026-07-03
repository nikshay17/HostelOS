import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getMyBills, submitPaymentProof } from '../../services/messBillService';
import PageLayout from '../../components/common/PageLayout';
import PageHeader from '../../components/common/PageHeader';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import ErrorBanner from '../../components/common/ErrorBanner';
import SuccessBanner from '../../components/common/SuccessBanner';
import EmptyState from '../../components/common/EmptyState';
import { FiCreditCard, FiX, FiSend, FiCheckCircle, FiAlertTriangle, FiClock, FiHash } from 'react-icons/fi';

// Payment proof modal
const PaymentModal = ({ bill, onClose, onSuccess }) => {
  const { token } = useAuth();
  const [form, setForm] = useState({ transactionId: '', paymentMethod: 'upi', paymentNote: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.transactionId.trim()) {
      setError('Transaction ID is required');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await submitPaymentProof(bill._id, form, token);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Submit Payment Proof</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Mess bill for {bill.month} — ₹{bill.amount.toLocaleString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          >
            <FiX size={16} />
          </button>
        </div>

        {/* Modal body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <ErrorBanner message={error} />

          {/* Info box */}
          <div className="bg-primary-light dark:bg-primary/10 border border-primary/20 rounded-xl p-3">
            <p className="text-xs text-primary dark:text-primary-light font-medium">
              After submitting, your payment will be reviewed by the warden/admin. You will receive a notification once it's verified.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Transaction ID <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <FiHash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                placeholder="e.g. UPI123456789 / TXN987654321"
                value={form.transactionId}
                onChange={(e) => setForm({ ...form, transactionId: e.target.value })}
                required
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
              />
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Enter the exact transaction/reference ID from your payment app
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'upi', label: 'UPI' },
                { value: 'netbanking', label: 'Net Banking' },
                { value: 'card', label: 'Card' },
                { value: 'cash', label: 'Cash' },
                { value: 'other', label: 'Other' },
              ].map(({ value, label }) => (
                <label
                  key={value}
                  className={`flex items-center justify-center px-3 py-2 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                    form.paymentMethod === value
                      ? 'bg-primary-light dark:bg-primary/20 border-primary text-primary'
                      : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={value}
                    checked={form.paymentMethod === value}
                    onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                    className="sr-only"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Note (optional)
            </label>
            <textarea
              placeholder="Any additional info for the admin (e.g. paid via PhonePe to 9999999999)"
              value={form.paymentNote}
              onChange={(e) => setForm({ ...form, paymentNote: e.target.value })}
              rows={2}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              loading={submitting}
              iconLeft={<FiSend size={13} />}
            >
              Submit Proof
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Status config for bill cards
const STATUS_CONFIG = {
  unpaid: {
    icon: FiCreditCard,
    iconColor: 'text-warning',
    iconBg: 'bg-warning-light dark:bg-warning/20',
    label: 'Unpaid',
    description: 'Click "Pay Now" to submit your payment proof',
  },
  pending_verification: {
    icon: FiClock,
    iconColor: 'text-primary',
    iconBg: 'bg-primary-light dark:bg-primary/20',
    label: 'Pending Verification',
    description: 'Your payment proof is under review',
  },
  paid: {
    icon: FiCheckCircle,
    iconColor: 'text-success',
    iconBg: 'bg-success-light dark:bg-success/20',
    label: 'Paid',
    description: 'Payment verified and confirmed',
  },
  overdue: {
    icon: FiAlertTriangle,
    iconColor: 'text-danger',
    iconBg: 'bg-danger-light dark:bg-danger/20',
    label: 'Overdue',
    description: 'Due date has passed — pay immediately',
  },
};

const MessBills = () => {
  const { token } = useAuth();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [selectedBill, setSelectedBill] = useState(null);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const res = await getMyBills(token);
      setBills(res.data);
    } catch (err) {
      setError('Failed to load bills');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBills(); }, [token]);

  const handlePaymentSuccess = () => {
    setSelectedBill(null);
    setMessage('Payment proof submitted — your warden will verify it shortly');
    fetchBills();
  };

  const totalOutstanding = bills
    .filter(b => b.status !== 'paid')
    .reduce((sum, b) => sum + b.amount, 0);

  const pendingVerification = bills.filter(b => b.status === 'pending_verification').length;

  return (
    <PageLayout>
      <PageHeader
        title="Mess Bills"
        description="View your monthly mess bills and submit payment proof"
      />
      <ErrorBanner message={error} />
      <SuccessBanner message={message} />

      {loading ? <Loader /> : (
        <>
          {/* Summary bar */}
          {(totalOutstanding > 0 || pendingVerification > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {totalOutstanding > 0 && (
                <div className="bg-danger-light dark:bg-danger/10 border border-red-200 dark:border-danger/30 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-danger-dark dark:text-danger uppercase tracking-wider mb-1">
                      Outstanding Balance
                    </p>
                    <p className="text-3xl font-bold text-danger-dark dark:text-danger">
                      ₹{totalOutstanding.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 bg-danger-light dark:bg-danger/20 rounded-xl">
                    <FiCreditCard size={24} className="text-danger" />
                  </div>
                </div>
              )}
              {pendingVerification > 0 && (
                <div className="bg-primary-light dark:bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                      Awaiting Verification
                    </p>
                    <p className="text-3xl font-bold text-primary">
                      {pendingVerification}
                    </p>
                    <p className="text-xs text-primary/70 mt-1">
                      {pendingVerification === 1 ? 'bill' : 'bills'} under review
                    </p>
                  </div>
                  <div className="p-3 bg-primary-light dark:bg-primary/20 rounded-xl">
                    <FiClock size={24} className="text-primary" />
                  </div>
                </div>
              )}
            </div>
          )}

          {bills.length === 0 ? (
            <EmptyState
              title="No bills yet"
              description="Your mess bills will appear here once generated by the admin"
              icon={FiCreditCard}
            />
          ) : (
            <div className="space-y-3">
              {bills.map(b => {
                const config = STATUS_CONFIG[b.status] || STATUS_CONFIG.unpaid;
                const StatusIcon = config.icon;

                return (
                  <Card key={b._id} className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={`shrink-0 p-2.5 rounded-xl ${config.iconBg}`}>
                        <StatusIcon size={18} className={config.iconColor} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {b.month}
                          </p>
                          <Badge status={b.status} />
                          {b.status === 'overdue' && (
                            <span className="text-xs text-danger font-semibold">OVERDUE</span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-2">
                          <span className="font-semibold text-gray-900 dark:text-white text-base">
                            ₹{b.amount.toLocaleString()}
                          </span>
                          <span>Due: {new Date(b.dueDate).toLocaleDateString()}</span>
                        </div>

                        {/* Status-specific info */}
                        {b.status === 'pending_verification' && b.transactionId && (
                          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 mt-2">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                              Payment proof submitted — under review
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-gray-400 dark:text-gray-500">Transaction ID</span>
                                <p className="font-mono font-semibold text-gray-900 dark:text-white mt-0.5">
                                  {b.transactionId}
                                </p>
                              </div>
                              {b.paymentMethod && (
                                <div>
                                  <span className="text-gray-400 dark:text-gray-500">Method</span>
                                  <p className="font-semibold text-gray-900 dark:text-white capitalize mt-0.5">
                                    {b.paymentMethod}
                                  </p>
                                </div>
                              )}
                            </div>
                            {b.paymentNote && (
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 italic">
                                Note: {b.paymentNote}
                              </p>
                            )}
                          </div>
                        )}

                        {b.status === 'paid' && (
                          <div className="flex items-center gap-1.5 text-xs text-success font-medium mt-1">
                            <FiCheckCircle size={12} />
                            Paid on {b.paidAt ? new Date(b.paidAt).toLocaleDateString() : '—'}
                            {b.transactionId && b.transactionId !== 'MANUAL' && (
                              <span className="text-gray-400 dark:text-gray-500 font-normal ml-1">
                                · TXN: {b.transactionId}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Rejection reason */}
                        {b.rejectionReason && (
                          <div className="bg-danger-light dark:bg-danger/10 border border-red-200 dark:border-danger/30 rounded-lg p-2.5 mt-2">
                            <p className="text-xs text-danger-dark dark:text-danger">
                              <span className="font-semibold">Previous payment rejected:</span> {b.rejectionReason}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Action button */}
                      {(b.status === 'unpaid' || b.status === 'overdue') && (
                        <div className="shrink-0">
                          <Button
                            size="sm"
                            onClick={() => setSelectedBill(b)}
                            iconLeft={<FiSend size={12} />}
                          >
                            Pay Now
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Payment proof modal */}
      {selectedBill && (
        <PaymentModal
          bill={selectedBill}
          onClose={() => setSelectedBill(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </PageLayout>
  );
};

export default MessBills;