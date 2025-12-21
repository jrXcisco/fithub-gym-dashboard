import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './components/layout';
import { DashboardPage } from './features/dashboard';
import { MembersListPage, MemberDetailPage } from './features/members';
import { TrainersPage } from './features/trainers';
import { FollowUpsPage } from './features/followups';
import { EventsPage } from './features/events';
import { ResourcesPage } from './features/resources';
import { LoginPage, SignupPage } from './features/auth';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/signup" replace />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<DashboardPage />} />
          <Route path="members" element={<MembersListPage />} />
          <Route path="members/:id" element={<MemberDetailPage />} />
          <Route path="trainers" element={<TrainersPage />} />
          <Route path="follow-ups" element={<FollowUpsPage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="resources" element={<ResourcesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
