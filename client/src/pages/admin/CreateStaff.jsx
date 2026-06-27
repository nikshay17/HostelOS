import { useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const CreateStaff = () => {
  const { token } = useAuth();
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'warden',
    employeeId: '', designation: '', department: '', phone: ''
  });
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/create-staff', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to create staff account');
    }
  };

  return (
    <div>
      <h2>Create Warden / Admin Account</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <input placeholder="Name" value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input type="email" placeholder="Email" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input type="password" placeholder="Temporary Password" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="warden">Warden</option>
          <option value="admin">Admin (Dean/Professor)</option>
        </select>
        <input placeholder="Employee ID" value={form.employeeId}
          onChange={(e) => setForm({ ...form, employeeId: e.target.value })} required />
        <input placeholder="Designation (e.g. Hostel Warden, Dean)" value={form.designation}
          onChange={(e) => setForm({ ...form, designation: e.target.value })} required />
        <input placeholder="Department" value={form.department}
          onChange={(e) => setForm({ ...form, department: e.target.value })} />
        <input placeholder="Phone" value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <button type="submit">Create Account</button>
      </form>
    </div>
  );
};

export default CreateStaff;