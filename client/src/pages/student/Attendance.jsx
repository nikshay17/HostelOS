import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { markAttendance, getMyAttendance } from '../../services/attendanceService';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import Loader from '../../components/common/Loader';
import WebcamCapture from '../../components/face/WebcamCapture';
import { verifyFace } from '../../services/faceService';

const Attendance = () => {
  const { token } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [checkingIn, setCheckingIn] = useState(false);
  const [showFaceCheck, setShowFaceCheck] = useState(false);
  const [faceVerified, setFaceVerified] = useState(false);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await getMyAttendance(token);
      setRecords(res.data);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecords(); }, [token]);

  const handleCheckIn = () => {
    setMessage('');
    if (!navigator.geolocation) {
      setMessage('Geolocation is not supported by your browser');
      return;
    }

    setCheckingIn(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          await markAttendance({ latitude, longitude, faceVerified }, token);
          setMessage('Attendance marked successfully ✅');
          fetchRecords();
        } catch (err) {
          setMessage(err.response?.data?.message || 'Check-in failed');
        } finally {
          setCheckingIn(false);
        }
      },
      (err) => {
        setMessage('Location access denied — please enable location permissions to check in');
        setCheckingIn(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleFaceCapture = async (base64Image) => {
    try {
      await verifyFace(base64Image, token);
      setFaceVerified(true);
      setShowFaceCheck(false);
      setMessage('Face verified — now click check-in to complete attendance');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Face verification failed');
    }
  };

  return (
    <div>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <main style={{ padding: '1rem', flex: 1 }}>
          <h2>Attendance</h2>
          {message && <p style={{ color: 'blue' }}>{message}</p>}

          {!faceVerified && (
            <div style={{ marginBottom: '1rem' }}>
              <button onClick={() => setShowFaceCheck(!showFaceCheck)}>
                {showFaceCheck ? 'Close Camera' : 'Verify Face First (Optional)'}
              </button>
              {showFaceCheck && <WebcamCapture onCapture={handleFaceCapture} buttonLabel="Verify" />}
            </div>
          )}
          {faceVerified && <p style={{ color: 'green' }}>✅ Face verified for today's check-in</p>}

          <button onClick={handleCheckIn} disabled={checkingIn} style={{ marginBottom: '1.5rem' }}>
            {checkingIn ? 'Checking in...' : "Mark Today's Attendance"}
          </button>

          <h3>My Attendance History</h3>
          {loading ? <Loader /> : records.length === 0 ? <p>No records yet.</p> : (
            <table border="1" cellPadding="8">
              <thead>
                <tr><th>Date</th><th>Status</th><th>Face Verified</th></tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r._id}>
                    <td>{new Date(r.date).toLocaleDateString()}</td>
                    <td style={{ color: r.status === 'present' ? 'green' : r.status === 'late' ? 'orange' : 'red' }}>
                      {r.status}
                    </td>
                    <td>{r.verifiedByFace ? '✅' : '—'}</td>
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

export default Attendance;