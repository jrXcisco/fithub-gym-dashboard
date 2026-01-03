import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from './lib/apollo';
import { DashboardLayout } from './components/layout';
import { DashboardPage } from './features/dashboard';
import { MembersListPage, MemberDetailPage } from './features/members';
import { TrainersPage, TeamDetailPage } from './features/trainers';
import { FollowUpsPage, FollowupDetailPage } from './features/followups';
import { EventsPage, EventDetailPage } from './features/events';
import { ResourcesPage, ResourceDetailPage } from './features/resources';
import { LoginPage, SignupPage } from './features/auth';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { GymLoader } from './components/ui/GymLoader';
import { useLoadingStore } from './stores/loadingStore';

function App() {
  const isLoading = useLoadingStore((state) => state.isLoading);

  return (
    <ApolloProvider client={apolloClient}>
    {isLoading && <GymLoader />}
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
          <Route path="team" element={<TrainersPage />} />
          <Route path="team/:id" element={<TeamDetailPage />} />
          <Route path="follow-ups" element={<FollowUpsPage />} />
          <Route path="follow-ups/:id" element={<FollowupDetailPage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="events/:id" element={<EventDetailPage />} />
          <Route path="resources" element={<ResourcesPage />} />
          <Route path="resources/:id" element={<ResourceDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </ApolloProvider>
  );
}

export default App;
