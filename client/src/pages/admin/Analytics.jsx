import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getFullAnalytics, getAttendanceTrend } from '../../services/analyticsService';
import BarChart from '../../components/charts/BarChart';
import PieChart from '../../components/charts/PieChart';
import PageLayout from '../../components/common/PageLayout';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import ErrorBanner from '../../components/common/ErrorBanner';
import SectionHeader from '../../components/common/SectionHeader';

const Analytics = () => {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [attendanceTrend, setAttendanceTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        setError('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [token]);

  const reshapeAttendanceTrend = (trend) => {
    const byDate = {};
    trend.forEach(item => {
      const date = item._id.date;
      if (!byDate[date]) byDate[date] = { _id: date };
      byDate[date][item._id.status] = item.count;
    });
    return Object.values(byDate);
  };

  return (
    <PageLayout>
      <PageHeader title="Analytics" description="Hostel performance metrics and insights" />
      <ErrorBanner message={error} />

      {loading ? <Loader /> : data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card className="p-5">
            <SectionHeader title="Room Occupancy by Status" />
            <PieChart data={data.occupancy} />
          </Card>

          <Card className="p-5">
            <SectionHeader title="Complaints by Category" />
            <BarChart data={data.complaints} barColor="#ef4444" />
          </Card>

          <Card className="p-5">
            <SectionHeader title="Mess Bills by Status" />
            <BarChart data={data.bills} barColor="#22c55e" />
          </Card>

          <Card className="p-5">
            <SectionHeader title="Gate Passes by Status" />
            <PieChart data={data.gatepasses} />
          </Card>

          <Card className="p-5 lg:col-span-2">
            <SectionHeader title="Attendance — Last 7 Days" />
            <BarChart data={reshapeAttendanceTrend(attendanceTrend)} dataKey="present" barColor="#4f46e5" />
          </Card>
        </div>
      )}
    </PageLayout>
  );
};

export default Analytics;