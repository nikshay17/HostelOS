import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { markAttendance, getMyAttendance } from '../../services/attendanceService';
import { verifyFace } from '../../services/faceService';
import WebcamCapture from '../../components/face/WebcamCapture';
import PageLayout from '../../components/common/PageLayout';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import ErrorBanner from '../../components/common/ErrorBanner';
import SuccessBanner from '../../components/common/SuccessBanner';
import EmptyState from '../../components/common/EmptyState';
import { FiCalendar, FiMapPin, FiCamera, FiCheckCircle } from 'react-icons/fi';

const Attendance = () => {
  const { token } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [checkingIn, setCheckingIn] = useState(false);
  const [showFaceCheck, setShowFaceCheck] = useState(false);
  const [faceVerified, setFaceVerified] = useState(false);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await getMyAttendance(token);
      setRecords(res.data);
    } catch (err) {
      setError('Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecords(); }, [token]);

  const handleFaceCapture = async (base64Image) => {
    try {
      await verifyFace(base64Image, token);
      setFaceVerified(true);
      setShowFaceCheck(false);
      setMessage('Face verified — now click check-in to complete attendance');
    } catch (err) {
      setError(err.response?.data?.message || 'Face verification failed');
    }
  };

  const handleCheckIn = () => {
    setMessage(''); setError('');
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    setCheckingIn(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          await markAttendance({ latitude, longitude, faceVerified }, token);
          setMessage('Attendance marked successfully');
          setFaceVerified(false);
          fetchRecords();
        } catch (err) {
          setError(err.response?.data?.message || 'Check-in failed');
        } finally {
          setCheckingIn(false);
        }
      },
      () => {
        setError('Location access denied — please enable location permissions');
        setCheckingIn(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <PageLayout>
      <PageHeader title="Attendance" description="Mark your daily attendance with location verification" />
      <ErrorBanner message={error} />
      <SuccessBanner message={message} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="p-5 lg:col-span-2">
          <p className="text-base font-semibold text-gray-900 dark:text-white mb-4">Mark Today's Attendance</p>
          <div className="space-y-3">
            {!faceVerified ? (
              <div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowFaceCheck(!showFaceCheck)}
                  iconLeft={<FiCamera size={13} />}
                >
                  {showFaceCheck ? 'Close Camera' : 'Verify Face First (Optional)'}
                </Button>
                {showFaceCheck && (
                  <div className="mt-3">
                    <WebcamCapture onCapture={handleFaceCapture} buttonLabel="Verify Face" />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-success font-medium">
                <FiCheckCircle size={15} />
                Face verified for today
              </div>
            )}
            <Button
              onClick={handleCheckIn}
              loading={checkingIn}
              iconLeft={<FiMapPin size={13} />}
            >
              {checkingIn ? 'Getting location...' : 'Mark Attendance'}
            </Button>
          </div>
        </Card>

        <Card className="p-5">
          <p className="text-base font-semibold text-gray-900 dark:text-white mb-1">This Month</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">Attendance summary</p>
          <div className="space-y-2">
            {['present', 'absent', 'late'].map(status => (
              <div key={status} className="flex items-center justify-between">
                <Badge status={status} />
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {records.filter(r => r.status === status).length}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <p className="text-base font-semibold text-gray-900 dark:text-white mb-3">Attendance History</p>
      {loading ? <Loader /> : records.length === 0 ? (
        <EmptyState title="No attendance records" description="Your check-in history will appear here" icon={FiCalendar} />
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Face Verified</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records.map(r => (
                  <tr key={r._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{new Date(r.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3"><Badge status={r.status} /></td>
                    <td className="px-4 py-3">
                      {r.verifiedByFace
                        ? <span className="text-success text-xs font-medium flex items-center gap-1"><FiCheckCircle size={12} /> Verified</span>
                        : <span className="text-gray-400 dark:text-gray-500 text-xs">Not verified</span>
                      }
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{new Date(r.date).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default Attendance;