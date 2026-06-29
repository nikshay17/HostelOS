import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { enrollFace, verifyFace, getEnrollmentStatus } from '../../services/faceService';
import WebcamCapture from '../../components/face/WebcamCapture';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import Loader from '../../components/common/Loader';

const FaceVerify = () => {
  const { token } = useAuth();
  const [enrolled, setEnrolled] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await getEnrollmentStatus(token);
      setEnrolled(res.data.faceEncoded);
    } catch (err) {
      setMessage('Failed to check enrollment status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStatus(); }, [token]);

  const handleEnroll = async (base64Image) => {
    setMessage('');
    setSubmitting(true);
    try {
      const res = await enrollFace(base64Image, token);
      setMessage(res.data.message);
      fetchStatus();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Enrollment failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (base64Image) => {
    setMessage('');
    setSubmitting(true);
    try {
      const res = await verifyFace(base64Image, token);
      setMessage(`✅ ${res.data.message} (distance: ${res.data.distance.toFixed(3)})`);
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.message || 'Verification failed'}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <main style={{ padding: '1rem', flex: 1 }}>
          <h2>Face Verification</h2>
          {message && <p style={{ color: 'blue' }}>{message}</p>}

          {loading ? <Loader /> : (
            <>
              {!enrolled ? (
                <div>
                  <p>You haven't enrolled your face yet. Look at the camera and capture a clear photo.</p>
                  <WebcamCapture onCapture={handleEnroll} buttonLabel={submitting ? 'Enrolling...' : 'Enroll My Face'} />
                </div>
              ) : (
                <div>
                  <p>✅ Face already enrolled. You can test verification below.</p>
                  <WebcamCapture onCapture={handleVerify} buttonLabel={submitting ? 'Verifying...' : 'Verify My Face'} />
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default FaceVerify;