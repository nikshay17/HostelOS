import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
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
import MessBills from './pages/student/MessBills';
import ManageMessBills from './pages/admin/ManageMessBills';
import GatePass from './pages/student/GatePass';
import ApproveGatePass from './pages/admin/ApproveGatePass';
import Attendance from './pages/student/Attendance';
import AttendanceLogs from './pages/admin/AttendanceLogs';
import FaceVerify from './pages/student/FaceVerify';
import ManageComplaints from './pages/admin/ManageComplaints';
import Complaints from './pages/student/Complaints';
import Feedback from './pages/student/Feedback';
import FeedbackOverview from './pages/admin/FeedbackOverview';
import Analytics from './pages/admin/Analytics';
import Broadcast from './pages/admin/Broadcast';
import SecuritySettings from './pages/admin/SecuritySettings';
import Landing from './pages/Landing';
import VerifyOTP from './pages/auth/VerifyOTP';
import CompleteProfile from './pages/auth/CompleteProfile';
import SetPassword from './pages/auth/SetPassword';
import { ThemeProvider } from './context/ThemeContext';
import OAuthSuccess from './pages/auth/OAuthSuccess';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
      <NotificationProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/oauth-success" element={<OAuthSuccess />} />
          <Route path="/register" element={<Register />} />

          {/* student, admin, and warden routes are protected based on user roles */}
          <Route path="/student" element={
            <ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>
          } />

          <Route path="/warden" element={
            <ProtectedRoute allowedRoles={['warden']}><WardenDashboard /></ProtectedRoute>
          } />

          <Route path="/admin/create-staff" element={
            <ProtectedRoute allowedRoles={['admin']}><CreateStaff /></ProtectedRoute>
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

          <Route path="/student/mess-bills" element={
            <ProtectedRoute allowedRoles={['student']}><MessBills /></ProtectedRoute>
          } />

          <Route path="/admin/manage-bills" element={
            <ProtectedRoute allowedRoles={['admin', 'warden']}><ManageMessBills /></ProtectedRoute>
          } />

          <Route path="/student/gate-pass" element={
            <ProtectedRoute allowedRoles={['student']}><GatePass /></ProtectedRoute>
          } />

          <Route path="/warden/gate-passes" element={
            <ProtectedRoute allowedRoles={['warden', 'admin']}><ApproveGatePass /></ProtectedRoute>
          } />

          <Route path="/student/attendance" element={
            <ProtectedRoute allowedRoles={['student']}><Attendance /></ProtectedRoute>
          } />

          <Route path="/warden/attendance" element={
            <ProtectedRoute allowedRoles={['warden', 'admin']}><AttendanceLogs /></ProtectedRoute>
          } />

          <Route path="/student/face-verify" element={
            <ProtectedRoute allowedRoles={['student']}><FaceVerify /></ProtectedRoute>
          } />

          <Route path="/warden/complaints" element={
            <ProtectedRoute allowedRoles={['warden', 'admin']}><ManageComplaints /></ProtectedRoute>
          } />

          <Route path="/student/complaints" element={
            <ProtectedRoute allowedRoles={['student']}><Complaints /></ProtectedRoute>
          } />

          <Route path="/student/feedback" element={
            <ProtectedRoute allowedRoles={['student']}><Feedback /></ProtectedRoute>
          } />

          <Route path="/admin/feedback" element={
            <ProtectedRoute allowedRoles={['warden', 'admin']}><FeedbackOverview /></ProtectedRoute>
          } />

          <Route path="/admin/analytics" element={
            <ProtectedRoute allowedRoles={['admin']}><Analytics /></ProtectedRoute>
          } />
          
          <Route path="/admin/broadcast" element={
            <ProtectedRoute allowedRoles={['warden', 'admin']}><Broadcast /></ProtectedRoute>
          } />

          <Route path="/admin/security" element={
            <ProtectedRoute allowedRoles={['admin']}><SecuritySettings /></ProtectedRoute>
          } />
          <Route path="/" element={<Landing />} />

          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/complete-profile" element={
            <ProtectedRoute allowedRoles={['student']}><CompleteProfile /></ProtectedRoute>
          } />
          <Route path="/set-password" element={
            <ProtectedRoute allowedRoles={['student']}><SetPassword /></ProtectedRoute>
          } />


        </Routes>
      </BrowserRouter>
      </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
