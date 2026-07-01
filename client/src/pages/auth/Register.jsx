import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import ErrorBanner from '../../components/common/ErrorBanner';
import { LuBuilding2 } from 'react-icons/lu';
import { FiMail, FiLock, FiUser, FiHash, FiPhone } from 'react-icons/fi';

const ROLE_REDIRECTS = { student: '/student', warden: '/warden', admin: '/admin' };

const Field = ({ label, icon: Icon, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
    <div className="relative">
      {Icon && <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />}
      <input
        className={`w-full ${Icon ? 'pl-9' : 'pl-3'} pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors`}
        {...props}
      />
    </div>
  </div>
);

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', studentId: '', roomNumber: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await registerUser(form);
      login(res.data.token, res.data.user);
      navigate(ROLE_REDIRECTS[res.data.user.role] || '/login');
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
          <div className="inline-flex p-3 bg-primary rounded-2xl mb-4">
            <LuBuilding2 size={28} className="text-white" />
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
            <Field label="Password" icon={FiLock} type="password" placeholder="Min. 8 characters" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} required />
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