import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { verifyOTP, resendOTP } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import ErrorBanner from '../../components/common/ErrorBanner';
import SuccessBanner from '../../components/common/SuccessBanner';
import { LuBuilding2 } from 'react-icons/lu';
import { FiMail, FiRefreshCw } from 'react-icons/fi';

const ROLE_REDIRECTS = { student: '/student', warden: '/warden', admin: '/admin' };

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // userId is passed via navigation state from Register page
  const userId = location.state?.userId;
  const email = location.state?.email;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  // Redirect if no userId in state
  useEffect(() => {
    if (!userId) navigate('/register');
  }, [userId, navigate]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown === 0) { setCanResend(true); return; }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (index, value) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // only last character (handles paste into single input)
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otp];
    pasted.split('').forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);
    // Focus last filled or next empty
    const lastIndex = Math.min(pasted.length, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }
    setError(''); setSuccess('');
    setLoading(true);
    try {
      const res = await verifyOTP({ userId, otp: otpString });
      login(res.data.token, res.data.user);
      navigate(ROLE_REDIRECTS[res.data.user.role] || '/student');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setResending(true);
    setError(''); setSuccess('');
    try {
      await resendOTP({ userId });
      setSuccess('A new OTP has been sent to your email');
      setCountdown(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-primary rounded-2xl mb-4">
            <LuBuilding2 size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Check your email</h1>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            We sent a 6-digit code to
            <br />
            <span className="font-medium text-gray-700">{email || 'your email address'}</span>
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-card p-6">
          <div className="flex items-center gap-2 bg-primary-light text-primary px-3 py-2 rounded-lg text-xs font-medium mb-5">
            <FiMail size={13} />
            OTP expires in 10 minutes
          </div>

          <ErrorBanner message={error} />
          <SuccessBanner message={success} />

          <form onSubmit={handleSubmit}>
            <div className="flex items-center gap-2 justify-center mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className={`
                    w-11 h-12 text-center text-lg font-bold border rounded-xl
                    focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                    transition-colors
                    ${digit ? 'border-primary bg-primary-light text-primary' : 'border-gray-300 text-gray-900'}
                  `}
                />
              ))}
            </div>

            <Button
              type="submit"
              className="w-full"
              loading={loading}
              disabled={otp.join('').length !== 6}
            >
              {loading ? 'Verifying...' : 'Verify account'}
            </Button>
          </form>

          <div className="text-center mt-4">
            <button
              onClick={handleResend}
              disabled={!canResend || resending}
              className={`
                inline-flex items-center gap-1.5 text-sm transition-colors
                ${canResend ? 'text-primary hover:text-primary-hover font-medium' : 'text-gray-400 cursor-not-allowed'}
              `}
            >
              <FiRefreshCw size={13} className={resending ? 'animate-spin' : ''} />
              {canResend ? 'Resend OTP' : `Resend in ${countdown}s`}
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
          Wrong email?{' '}
          <a href="/register" className="text-primary font-medium hover:underline">Start over</a>
        </p>
      </div>
    </div>
  );
};

export default VerifyOTP;