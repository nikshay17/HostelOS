import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import ErrorBanner from '../../components/common/ErrorBanner';
import HostelLogo from '../../components/common/HostelLogo';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

const ROLE_REDIRECTS = { student: '/student', warden: '/warden', admin: '/admin' };

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginUser(form);
      login(res.data.token, res.data.user);
      navigate(ROLE_REDIRECTS[res.data.user.role] || '/login');
    } catch (err) {
        const data = err.response?.data;
        // If user exists but hasn't verified email, redirect to OTP screen
        if (data?.requiresVerification) {
          navigate('/verify-otp', {
            state: { userId: data.userId, email: form.email }
          });
          return;
        }
        setError(data?.message || 'Login failed');
      } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex p-1.5 bg-white rounded-2xl mb-4 shadow-sm border border-gray-200">
            <HostelLogo size={52} showText={false} wrapperClassName="" imageClassName="rounded-xl" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Welcome back</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to your hostel account</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-card p-6">
          <ErrorBanner message={error} />
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <FiMail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  placeholder="you@hostel.edu"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <FiLock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  className="w-full pl-9 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" loading={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
          New student?{' '}
          <a href="/register" className="text-primary font-medium hover:underline">Create an account</a>
        </p>
      </div>
    </div>
  );
};

export default Login;