import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getMyBills, payBill } from '../../services/messBillService';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import Loader from '../../components/common/Loader';

const MessBills = () => {
  const { token } = useAuth();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchBills = async () => {
    setLoading(true);
    try {
      const res = await getMyBills(token);
      setBills(res.data);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to load bills');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBills(); }, [token]);

  const handlePay = async (billId) => {
    setMessage('');
    try {
      await payBill(billId, token);
      setMessage('Payment successful');
      fetchBills();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Payment failed');
    }
  };

  const statusColor = (status) => {
    if (status === 'paid') return 'green';
    if (status === 'overdue') return 'red';
    return 'orange';
  };

  return (
    <div>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <main style={{ padding: '1rem', flex: 1 }}>
          <h2>Mess Bills</h2>
          {message && <p style={{ color: 'blue' }}>{message}</p>}
          {loading ? <Loader /> : bills.length === 0 ? <p>No bills yet.</p> : (
            <table border="1" cellPadding="8">
              <thead>
                <tr><th>Month</th><th>Amount</th><th>Due Date</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {bills.map(b => (
                  <tr key={b._id}>
                    <td>{b.month}</td>
                    <td>₹{b.amount}</td>
                    <td>{new Date(b.dueDate).toLocaleDateString()}</td>
                    <td style={{ color: statusColor(b.status), fontWeight: 'bold' }}>{b.status}</td>
                    <td>
                      {b.status !== 'paid' && (
                        <button onClick={() => handlePay(b._id)}>Pay Now</button>
                      )}
                    </td>
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

export default MessBills;