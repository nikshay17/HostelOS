import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { enrollFace, verifyFace, getEnrollmentStatus } from '../../services/faceService';
import WebcamCapture from '../../components/face/WebcamCapture';
import PageLayout from '../../components/common/PageLayout';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import ErrorBanner from '../../components/common/ErrorBanner';
import SuccessBanner from '../../components/common/SuccessBanner';
import { FiCamera, FiCheckCircle, FiShield } from 'react-icons/fi';

const FaceVerify = () => {
  const { token } = useAuth();
  const [enrolled, setEnrolled] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await getEnrollmentStatus(token);
      setEnrolled(res.data.faceEncoded);
    } catch (err) {
      setError('Failed to check enrollment status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStatus(); }, [token]);

  const handleEnroll = async (base64Image) => {
    setMessage(''); setError('');
    setSubmitting(true);
    try {
      const res = await enrollFace(base64Image, token);
      setMessage(res.data.message);
      fetchStatus();
    } catch (err) {
      setError(err.response?.data?.message || 'Enrollment failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (base64Image) => {
    setMessage(''); setError('');
    setSubmitting(true);
    try {
      const res = await verifyFace(base64Image, token);
      setMessage(`Face verified successfully (distance: ${res.data.distance.toFixed(3)})`);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageLayout>
      <PageHeader
        title="Face Verification"
        description="Enroll your face for biometric attendance verification"
      />
      <ErrorBanner message={error} />
      <SuccessBanner message={message} />

      {loading ? <Loader /> : (
        <div className="max-w-lg">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2.5 rounded-xl ${enrolled ? 'bg-success-light' : 'bg-warning-light'}`}>
                {enrolled ? <FiCheckCircle size={20} className="text-success" /> : <FiCamera size={20} className="text-warning" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {enrolled ? 'Face Enrolled' : 'Not Yet Enrolled'}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {enrolled ? 'Your face is registered for verification' : 'Enroll your face to use biometric check-in'}
                </p>
              </div>
            </div>

            <WebcamCapture
              onCapture={enrolled ? handleVerify : handleEnroll}
              buttonLabel={submitting ? 'Processing...' : enrolled ? 'Verify My Face' : 'Enroll My Face'}
            />

            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <FiShield size={12} />
                Your face data is stored securely and used only for attendance verification
              </p>
            </div>
          </Card>
        </div>
      )}
    </PageLayout>
  );
};

export default FaceVerify;