import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getFullAnalytics, getAttendanceTrend } from '../../services/analyticsService';
import BarChart from '../../components/charts/BarChart';
import PieChart from '../../components/charts/PieChart';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import Loader from '../../components/common/Loader';

const Analytics = () => {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [attendanceTrend, setAttendanceTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [fullRes, trendRes] = await Promise.all([
          getFullAnalytics(token),
          getAttendanceTrend(token)
        ]);
        setData(fullRes.data);
        setAttendanceTrend(trendRes.data.trend);
      } catch (err) {
        setMessage(err.response?.data?.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [token]);

  // Reshape attendance trend data: group by date, separate status as keys
  const reshapeAttendanceTrend = (trend) => {
    const byDate = {};
    trend.forEach(item => {
      const date = item._id.date;
      const status = item._id.status;
      if (!byDate[date]) byDate[date] = { _id: date };
      byDate[date][status] = item.count;
    });
    return Object.values(byDate);
  };

  return (
    <div>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <main style={{ padding: '1rem', flex: 1 }}>
          <h2>Admin Analytics</h2>
          {message && <p style={{ color: 'red' }}>{message}</p>}

          {loading ? <Loader /> : data && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>

              <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
                <h4>Room Occupancy by Status</h4>
                <PieChart data={data.occupancy} />
              </div>

              <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
                <h4>Complaints by Category</h4>
                <BarChart data={data.complaints} barColor="#ef4444" />
              </div>

              <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
                <h4>Mess Bills by Status</h4>
                <BarChart data={data.bills} barColor="#22c55e" />
              </div>

              <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
                <h4>Gate Passes by Status</h4>
                <PieChart data={data.gatepasses} />
              </div>

              <div style={{ border: '1px solid #ccc', padding: '1rem', gridColumn: 'span 2' }}>
                <h4>Attendance — Last 7 Days</h4>
                <BarChart data={reshapeAttendanceTrend(attendanceTrend)} dataKey="present" barColor="#4f46e5" />
              </div>

              <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
                <h4>Population</h4>
                <p>Students: <strong>{data.totalStudents}</strong></p>
                <p>Wardens: <strong>{data.totalWardens}</strong></p>
              </div>

            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Analytics;