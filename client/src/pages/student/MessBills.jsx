import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getMyBills, payBill } from '../../services/messBillService';
import PageLayout from '../../components/common/PageLayout';
import PageHeader from '../../components/common/PageHeader';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import ErrorBanner from '../../components/common/ErrorBanner';
import SuccessBanner from '../../components/common/SuccessBanner';
import EmptyState from '../../components/common/EmptyState';
import { FiCreditCard } from 'react-icons/fi';

const MessBills = () => {
  const { token } = useAuth();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [paying, setPaying] = useState(null);

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

  const handlePay = async (billId) => {
    setMessage(''); setError('');
    setPaying(billId);
    try {
      await payBill(billId, token);
      setMessage('Payment successful');
      fetchBills();
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed');
    } finally {
      setPaying(null);
    }
  };

  const totalUnpaid = bills.filter(b => b.status !== 'paid').reduce((sum, b) => sum + b.amount, 0);

  return (
    <PageLayout>
      <PageHeader
        title="Mess Bills"
        description="View and pay your monthly mess dues"
      />
      <ErrorBanner message={error} />
      <SuccessBanner message={message} />

      {loading ? <Loader /> : (
        <>
          {totalUnpaid > 0 && (
            <div className="bg-danger-light border border-red-200 rounded-xl p-4 mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-danger-dark">Outstanding Balance</p>
                <p className="text-2xl font-bold text-danger-dark mt-0.5">₹{totalUnpaid.toLocaleString()}</p>
              </div>
              <FiCreditCard size={32} className="text-danger opacity-40" />
            </div>
          )}

          {bills.length === 0 ? (
            <EmptyState
              title="No bills yet"
              description="Your mess bills will appear here once generated"
              icon={FiCreditCard}
            />
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-card">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Month</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Due Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {bills.map(b => (
                      <tr key={b._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900">{b.month}</td>
                        <td className="px-4 py-3 text-gray-700 font-semibold">₹{b.amount.toLocaleString()}</td>
                        <td className="px-4 py-3 text-gray-500">{new Date(b.dueDate).toLocaleDateString()}</td>
                        <td className="px-4 py-3"><Badge status={b.status} /></td>
                        <td className="px-4 py-3">
                          {b.status !== 'paid' && (
                            <Button
                              size="sm"
                              loading={paying === b._id}
                              onClick={() => handlePay(b._id)}
                              iconLeft={<FiCreditCard size={12} />}
                            >
                              Pay Now
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </PageLayout>
  );
};

export default MessBills;