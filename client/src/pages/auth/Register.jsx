import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../services/authService';
import Button from '../../components/common/Button';
import ErrorBanner from '../../components/common/ErrorBanner';
import HostelLogo from '../../components/common/HostelLogo';
import { FiMail, FiLock, FiUser, FiHash, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi';

const Field = ({ label, icon: Icon, type = 'text', showPasswordToggle = false, showPassword = false, onTogglePassword, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
    <div className="relative">
      {Icon && <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />}
      <input
        type={type}
        className={`w-full ${Icon ? 'pl-9' : 'pl-3'} ${showPasswordToggle ? 'pr-10' : 'pr-3'} py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors`}
        {...props}
      />
      {showPasswordToggle && (
        <button
          type="button"
          onClick={onTogglePassword}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
        </button>
      )}
    </div>
  </div>
);

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', studentId: '', roomNumber: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);
  try {
    const res = await registerUser(form);
    navigate('/verify-otp', {
      state: {
        pendingId: res.data.pendingId, // ← changed from userId
        email: form.email,
      }
    });
  } catch (err) {
    setError(err.response?.data?.message || 'Registration failed');
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
          <h1 className="text-2xl font-semibold text-gray-900">Create your account</h1>
          <p className="text-sm text-gray-500 mt-1">Student registration</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-card p-6">
          <ErrorBanner message={error} />
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Full Name" icon={FiUser} placeholder="John Doe" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Field label="Email" icon={FiMail} type="email" placeholder="you@hostel.edu" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <Field label="Password" icon={FiLock} type={showPassword ? 'text' : 'password'} placeholder="Min. 8 characters" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} required showPasswordToggle onTogglePassword={() => setShowPassword((prev) => !prev)} showPassword={showPassword} />
            <Field label="Student ID" icon={FiHash} placeholder="S001" value={form.studentId}
              onChange={(e) => setForm({ ...form, studentId: e.target.value })} required />
            <Field label="Room Number" icon={FiHash} placeholder="A101 (optional)" value={form.roomNumber}
              onChange={(e) => setForm({ ...form, roomNumber: e.target.value })} />
            <Field label="Phone" icon={FiPhone} placeholder="9999999999 (optional)" value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Button type="submit" className="w-full" loading={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account?{' '}
          <a href="/login" className="text-primary font-medium hover:underline">Sign in</a>
        </p>
      </div>
    </div>
  );
};

export default Register;