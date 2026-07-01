import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getTodayAttendance, markAbsent } from '../../services/attendanceService';
import LocationMap from '../../components/attendance/LocationMap';
import PageLayout from '../../components/common/PageLayout';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import ErrorBanner from '../../components/common/ErrorBanner';
import SuccessBanner from '../../components/common/SuccessBanner';
import EmptyState from '../../components/common/EmptyState';
import { FiCalendar, FiMapPin, FiUserX } from 'react-icons/fi';

const AttendanceLogs = () => {
  const { token } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [manualStudentId, setManualStudentId] = useState('');
  const [marking, setMarking] = useState(false);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await getTodayAttendance(token);
      setRecords(res.data);
    } catch (err) {
      setError('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecords(); }, [token]);

  const handleMarkAbsent = async (e) => {
    e.preventDefault();
    setMessage(''); setError('');
    setMarking(true);
    try {
      await markAbsent(manualStudentId, token);
      setMessage('Student marked absent');
      setManualStudentId('');
      fetchRecords();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark absent');
    } finally {
      setMarking(false);
    }
  };

  const presentCount = records.filter(r => r.status === 'present').length;
  const absentCount = records.filter(r => r.status === 'absent').length;

  return (
    <PageLayout>
      <PageHeader title="Attendance Logs" description={`Today — ${new Date().toLocaleDateString()}`} />
      <ErrorBanner message={error} />
      <SuccessBanner message={message} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-success">{presentCount}</p>
          <p className="text-sm text-gray-500 mt-1">Present</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-danger">{absentCount}</p>
          <p className="text-sm text-gray-500 mt-1">Absent</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-gray-900">{records.length}</p>
          <p className="text-sm text-gray-500 mt-1">Total Records</p>
        </Card>
      </div>

      <Card className="p-5 mb-6">
        <p className="text-sm font-semibold text-gray-900 mb-3">Mark Student Absent</p>
        <form onSubmit={handleMarkAbsent} className="flex items-center gap-3 max-w-md">
          <input
            placeholder="Student MongoDB _id"
            value={manualStudentId}
            onChange={(e) => setManualStudentId(e.target.value)}
            required
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
          <Button type="submit" variant="danger" size="sm" loading={marking} iconLeft={<FiUserX size={13} />}>
            Mark Absent
          </Button>
        </form>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {loading ? <Loader /> : records.length === 0 ? (
            <EmptyState title="No records today" description="No attendance has been marked yet" icon={FiCalendar} />
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-card">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {records.map(r => (
                      <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={r.student.name} size="sm" />
                            <div>
                              <p className="font-medium text-gray-900">{r.student.name}</p>
                              <p className="text-xs text-gray-400">{r.student.studentId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3"><Badge status={r.status} /></td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{new Date(r.date).toLocaleTimeString()}</td>
                        <td className="px-4 py-3">
                          {r.location?.latitude ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedLocation(r.location)}
                              iconLeft={<FiMapPin size={12} />}
                            >
                              View
                            </Button>
                          ) : (
                            <span className="text-xs text-gray-400">No location</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {selectedLocation && (
          <Card className="p-4">
            <p className="text-sm font-semibold text-gray-900 mb-3">Check-in Location</p>
            <LocationMap latitude={selectedLocation.latitude} longitude={selectedLocation.longitude} />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedLocation(null)}
              className="mt-2 w-full"
            >
              Close Map
            </Button>
          </Card>
        )}
      </div>
    </PageLayout>
  );
};

export default AttendanceLogs;