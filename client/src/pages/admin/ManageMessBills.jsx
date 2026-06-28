import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { generateBills, getAllBills, markBillPaid, deleteBill } from '../../services/messBillService';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import Loader from '../../components/common/Loader';

const ManageMessBills = () => {
  const { token } = useAuth();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [genForm, setGenForm] = useState({ month: '', amount: '', dueDate: '' });
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
      setMessage(err.response?.data?.message || 'Failed to load bills');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBills(); }, [token, filterMonth, filterStatus]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await generateBills(genForm, token);
      setMessage(res.data.message);
      setGenForm({ month: '', amount: '', dueDate: '' });
      fetchBills();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Generation failed');
    }
  };

  const handleMarkPaid = async (id) => {
    try {
      await markBillPaid(id, token);
      fetchBills();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to mark as paid');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteBill(id, token);
      fetchBills();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <main style={{ padding: '1rem', flex: 1 }}>
          <h2>Manage Mess Bills</h2>
          {message && <p style={{ color: 'blue' }}>{message}</p>}

          <h3>Generate Bills for a Month</h3>
          <form onSubmit={handleGenerate} style={{ marginBottom: '1.5rem' }}>
            <input placeholder="Month (e.g. 2026-06)" value={genForm.month}
              onChange={(e) => setGenForm({ ...genForm, month: e.target.value })} required />
            <input type="number" placeholder="Amount" value={genForm.amount}
              onChange={(e) => setGenForm({ ...genForm, amount: Number(e.target.value) })} required />
            <input type="date" value={genForm.dueDate}
              onChange={(e) => setGenForm({ ...genForm, dueDate: e.target.value })} required />
            <button type="submit">Generate for All Students</button>
          </form>

          <h3>All Bills</h3>
          <div style={{ marginBottom: '1rem' }}>
            <input placeholder="Filter by month" value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)} />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">All statuses</option>
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          {loading ? <Loader /> : bills.length === 0 ? <p>No bills found.</p> : (
            <table border="1" cellPadding="8">
              <thead>
                <tr><th>Student</th><th>Month</th><th>Amount</th><th>Due</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {bills.map(b => (
                  <tr key={b._id}>
                    <td>{b.student.name} ({b.student.studentId})</td>
                    <td>{b.month}</td>
                    <td>₹{b.amount}</td>
                    <td>{new Date(b.dueDate).toLocaleDateString()}</td>
                    <td>{b.status}</td>
                    <td>
                      {b.status !== 'paid' && (
                        <button onClick={() => handleMarkPaid(b._id)}>Mark Paid</button>
                      )}
                      <button onClick={() => handleDelete(b._id)} style={{ marginLeft: '0.5rem' }}>Delete</button>
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

export default ManageMessBills;