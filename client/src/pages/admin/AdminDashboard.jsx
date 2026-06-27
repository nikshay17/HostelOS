import { useEffect, useState } from 'react';
import { getAdminSummary } from '../../services/dashboardService';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import Loader from '../../components/common/Loader';

const AdminDashboard = () => {
  const { token } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminSummary(token)
      .then(res => setSummary(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <main style={{ padding: '1rem', flex: 1 }}>
          <h2>Admin Dashboard</h2>
          {loading ? <Loader /> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
                <h4>Total Students</h4>
                <p>{summary.totalStudents}</p>
              </div>
              <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
                <h4>Total Wardens</h4>
                <p>{summary.totalWardens}</p>
              </div>
              <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
                <h4>Total Rooms</h4>
                <p>{summary.totalRooms}</p>
              </div>
              <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
                <h4>Occupied Rooms</h4>
                <p>{summary.occupiedRooms}</p>
              </div>
              <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
                <h4>Unpaid Mess Bills</h4>
                <p>{summary.totalUnpaidBills}</p>
              </div>
              <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
                <h4>Open Complaints</h4>
                <p>{summary.openComplaints}</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;