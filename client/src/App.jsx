import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ProtectedRoute from './components/common/ProtectedRoute';
import StudentDashboard from './pages/student/StudentDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import WardenDashboard from './pages/warden/WardenDashboard';
import CreateStaff from './pages/admin/CreateStaff';
import RoomBooking from './pages/student/RoomBooking';
import ManageRooms from './pages/admin/ManageRooms';
import ManageBookings from './pages/warden/ManageBookings';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          // student, admin, and warden routes are protected based on user roles
          <Route path="/student" element={
            <ProtectedRoute allowedRole="student"><StudentDashboard /></ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>
          } />

          <Route path="/warden" element={
            <ProtectedRoute allowedRole="warden"><WardenDashboard /></ProtectedRoute>
          } />

          <Route path="/admin/create-staff" element={
            <ProtectedRoute allowedRole="admin"><CreateStaff /></ProtectedRoute>
          } />

          <Route path="/student/room-booking" element={
            <ProtectedRoute allowedRoles={['student']}><RoomBooking /></ProtectedRoute>
          } />

          <Route path="/admin/manage-rooms" element={
            <ProtectedRoute allowedRoles={['admin', 'warden']}><ManageRooms /></ProtectedRoute>
          } />
          <Route path="/warden/bookings" element={
            <ProtectedRoute allowedRoles={['warden', 'admin']}><ManageBookings /></ProtectedRoute>
          } />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
