import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { FiLock } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { setGoogleUserPassword } from '../../services/authService';
import Button from '../../components/common/Button';
import ErrorBanner from '../../components/common/ErrorBanner';
import HostelLogo from '../../components/common/HostelLogo';

const SetPassword = () => {
  const { user, token, loading } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (!loading && (!user || user.role !== 'student' || user.authProvider !== 'google')) {
    return <Navigate to="/student" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSaving(true);
    try {
      await setGoogleUserPassword(password, token);
      navigate('/student', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not set your password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex p-1.5 bg-white rounded-2xl mb-4 shadow-sm border border-gray-200">
            <HostelLogo size={52} showText={false} wrapperClassName="" imageClassName="rounded-xl" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Create a password</h1>
          <p className="text-sm text-gray-500 mt-1">Use either Google or email and password next time.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl shadow-card p-6 space-y-4">
          <ErrorBanner message={error} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">New password</label>
            <div className="relative">
              <FiLock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength="8"
                required
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm password</label>
            <div className="relative">
              <FiLock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                minLength="8"
                required
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
          </div>
          <Button type="submit" className="w-full" loading={saving}>
            {saving ? 'Saving...' : 'Set password'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SetPassword;
