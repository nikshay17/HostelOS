import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import PageLayout from '../../components/common/PageLayout';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import ErrorBanner from '../../components/common/ErrorBanner';
import SuccessBanner from '../../components/common/SuccessBanner';
import { FiUserPlus, FiMail, FiLock, FiHash, FiBriefcase, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi';

const CreateStaff = () => {
  const { token } = useAuth();
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'warden',
    employeeId: '', designation: '', department: '', phone: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); setError('');
    setSubmitting(true);
    try {
      const res = await api.post('/auth/create-staff', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage(res.data.message);
      setForm({ name: '', email: '', password: '', role: 'warden', employeeId: '', designation: '', department: '', phone: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create staff account');
    } finally {
      setSubmitting(false);
    }
  };

  const Field = ({ label, icon: Icon, type = 'text', showPasswordToggle = false, showPassword = false, onTogglePassword, ...props }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
      <div className="relative">
        {Icon && <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />}
        <input
          type={type}
          className={`w-full ${Icon ? 'pl-9' : 'pl-3'} ${showPasswordToggle ? 'pr-10' : 'pr-3'} py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors`}
          {...props}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <FiEyeOff size={14} /> : <FiEye size={14} />}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <PageLayout>
      <PageHeader
        title="Create Staff Account"
        description="Add a new warden or admin to the system"
      />
      <ErrorBanner message={error} />
      <SuccessBanner message={message} />

      <div className="max-w-lg">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Account Type</label>
              <div className="flex gap-3">
                {['warden', 'admin'].map(role => (
                  <label
                    key={role}
                    className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg border text-sm font-medium cursor-pointer transition-colors capitalize
                      ${form.role === role ? 'bg-primary-light border-primary text-primary' : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                  >
                    <input type="radio" name="role" value={role} checked={form.role === role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })} className="sr-only" />
                    {role}
                  </label>
                ))}
              </div>
            </div>
            <Field label="Full Name" icon={FiUserPlus} placeholder="Dr. Rajesh Kumar" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Field label="Email" icon={FiMail} type="email" placeholder="staff@hostel.edu" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <Field label="Password" icon={FiLock} type={showPassword ? 'text' : 'password'} placeholder="Min. 8 characters" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} required showPasswordToggle onTogglePassword={() => setShowPassword((prev) => !prev)} showPassword={showPassword} />
            <Field label="Employee ID" icon={FiHash} placeholder="EMP001" value={form.employeeId}
              onChange={(e) => setForm({ ...form, employeeId: e.target.value })} required />
            <Field label="Designation" icon={FiBriefcase} placeholder="Hostel Warden / Dean" value={form.designation}
              onChange={(e) => setForm({ ...form, designation: e.target.value })} required />
            <Field label="Department" icon={FiBriefcase} placeholder="Student Affairs" value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })} />
            <Field label="Phone" icon={FiPhone} placeholder="9999999999 (optional)" value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Button type="submit" loading={submitting} className="w-full" iconLeft={<FiUserPlus size={13} />}>
              Create {form.role} Account
            </Button>
          </form>
        </Card>
      </div>
    </PageLayout>
  );
};

export default CreateStaff;