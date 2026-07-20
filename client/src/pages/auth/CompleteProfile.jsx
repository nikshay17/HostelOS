import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { completeProfile, getCurrentUser } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import ErrorBanner from '../../components/common/ErrorBanner';
import HostelLogo from '../../components/common/HostelLogo';
import { FiHash, FiPhone, FiCheckCircle } from 'react-icons/fi';

const ROLE_REDIRECTS = { student: '/student', warden: '/warden', admin: '/admin' };

const CompleteProfile = () => {
  const navigate = useNavigate();
  const { user, token, login, loading } = useAuth();
  const [form, setForm] = useState({ studentId: '', phone: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        studentId: user.studentId && !user.studentId.startsWith('PENDING-') ? user.studentId : '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  if (!loading && !user) {
    return <Navigate to="/login" />;
  }

  if (!loading && user && user.profileComplete) {
    return <Navigate to={ROLE_REDIRECTS[user.role] || '/student'} />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      await completeProfile(form, token);
      const res = await getCurrentUser(token);
      login(token, res.data.user ?? res.data);
      navigate(ROLE_REDIRECTS[user?.role || 'student'] || '/student', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not complete your profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex p-1.5 bg-white rounded-2xl mb-4 shadow-sm border border-gray-200">
            <HostelLogo size={52} showText={false} wrapperClassName="" imageClassName="rounded-xl" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Complete your profile</h1>
          <p className="text-sm text-gray-500 mt-1">Add your student details to finish setup</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-card p-6">
          <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-2 rounded-lg text-xs font-medium mb-5">
            <FiCheckCircle size={13} />
            Google sign-in verified your email. We still need your hostel details.
          </div>

          <ErrorBanner message={error} />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Student ID</label>
              <div className="relative">
                <FiHash size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={form.studentId}
                  onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                  placeholder="S001234"
                  required
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
              <div className="relative">
                <FiPhone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="9876543210"
                  required
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" loading={saving}>
              {saving ? 'Saving...' : 'Finish profile'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;
