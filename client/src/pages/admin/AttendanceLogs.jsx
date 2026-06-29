import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getTodayAttendance, markAbsent } from '../../services/attendanceService';
import LocationMap from '../../components/attendance/LocationMap';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import Loader from '../../components/common/Loader';

const AttendanceLogs = () => {
  const { token } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [manualStudentId, setManualStudentId] = useState('');

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await getTodayAttendance(token);
      setRecords(res.data);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecords(); }, [token]);

  const handleMarkAbsent = async (e) => {
    e.preventDefault();
    try {
      await markAbsent(manualStudentId, token);
      setMessage('Marked absent');
      setManualStudentId('');
      fetchRecords();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to mark absent');
    }
  };

  return (
    <div>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <main style={{ padding: '1rem', flex: 1 }}>
          <h2>Today's Attendance Logs</h2>
          {message && <p style={{ color: 'blue' }}>{message}</p>}

          <form onSubmit={handleMarkAbsent} style={{ marginBottom: '1.5rem' }}>
            <input placeholder="Student MongoDB _id" value={manualStudentId}
              onChange={(e) => setManualStudentId(e.target.value)} required />
            <button type="submit">Mark Student Absent</button>
          </form>

          {loading ? <Loader /> : records.length === 0 ? <p>No attendance records today.</p> : (
            <div style={{ display: 'flex', gap: '2rem' }}>
              <table border="1" cellPadding="8">
                <thead>
                  <tr><th>Student</th><th>Status</th><th>Time</th><th>Location</th></tr>
                </thead>
                <tbody>
                  {records.map(r => (
                    <tr key={r._id}>
                      <td>{r.student.name} ({r.student.studentId})</td>
                      <td style={{ color: r.status === 'present' ? 'green' : 'red' }}>{r.status}</td>
                      <td>{new Date(r.date).toLocaleTimeString()}</td>
                      <td>
                        {r.location?.latitude ? (
                          <button onClick={() => setSelectedLocation(r.location)}>View Map</button>
                        ) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {selectedLocation && (
                <div>
                  <h4>Check-in Location</h4>
                  <LocationMap latitude={selectedLocation.latitude} longitude={selectedLocation.longitude} />
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AttendanceLogs;