import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import CitizenDashboard from './pages/CitizenDashboard';
import AllMyIssues from './pages/AllMyIssues';
import OfficerDashboard from './pages/OfficerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PendingVerification from './pages/PendingVerification';
import ChatPage from './pages/ChatPage';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const location = useLocation();
  const hideNavbarRoutes = ['/login', '/register', '/'];
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname)
    && !location.pathname.startsWith('/chat');

  return (
    <div className="min-h-screen bg-gray-50">
      {shouldShowNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/pending-verification" element={<PendingVerification />} />

        {/* Protected Routes */}
        <Route
          path="/citizen"
          element={
            <ProtectedRoute role="citizen">
              <CitizenDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-issues"
          element={
            <ProtectedRoute role="citizen">
              <AllMyIssues />
            </ProtectedRoute>
          }
        />
        <Route
          path="/officer"
          element={
            <ProtectedRoute role="officer">
              <OfficerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat/:issueId"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;

