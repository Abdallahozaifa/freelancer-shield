import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useAuthStore } from './stores/authStore';
import { AuthInitializer } from './components/AuthInitializer';
import { Loading, ToastContainer } from './components/ui';
import { LoginPage, RegisterPage, ProfilePage, ClientsPage, ClientDetailPage, DashboardPage, ForgotPasswordPage, ResetPasswordPage } from './pages';
import { ProjectsPage, ProjectDetailPage, ProjectNewPage, ProjectEditPage } from './pages/projects';
import { RequestsPage, RequestEditPage } from './pages/projects/requests';
import { ScopeItemsPage, ScopeItemEditPage } from './pages/projects/scope';
import { ProposalsPage, ProposalEditPage } from './pages/projects/proposals';
import { LandingPage } from './pages/landing';
import { BillingPage } from './pages/settings';
import { PrivacyPage, SupportPage } from './pages/legal';
import { AppLayout } from './layouts';

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Protected route wrapper
function ProtectedRoute({ children }: { children?: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading text="Loading..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}

// Public route wrapper (redirect to dashboard if authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading text="Loading..." />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthInitializer>
          <Routes>
            {/* Landing page - public, but redirects to dashboard if authenticated */}
            <Route
              path="/"
              element={
                <PublicRoute>
                  <LandingPage />
                </PublicRoute>
              }
            />

            {/* Auth routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <PublicRoute>
                  <ForgotPasswordPage />
                </PublicRoute>
              }
            />
            <Route
              path="/reset-password"
              element={
                <PublicRoute>
                  <ResetPasswordPage />
                </PublicRoute>
              }
            />

            {/* Legal pages - accessible to everyone */}
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/support" element={<SupportPage />} />

            {/* Protected routes with AppLayout */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/clients" element={<ClientsPage />} />
                <Route path="/clients/:id" element={<ClientDetailPage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/projects/new" element={<ProjectNewPage />} />
                <Route path="/projects/:id" element={<ProjectDetailPage />} />
                <Route path="/projects/:id/edit" element={<ProjectEditPage />} />
                <Route path="/projects/:id/scope/new" element={<ScopeItemEditPage />} />
                <Route path="/projects/:id/scope/edit" element={<ScopeItemEditPage />} />
                <Route path="/projects/:id/requests/new" element={<RequestEditPage />} />
                <Route path="/projects/:id/requests/edit" element={<RequestEditPage />} />
                <Route path="/projects/:id/proposals/new" element={<ProposalEditPage />} />
                <Route path="/projects/:id/proposals/edit" element={<ProposalEditPage />} />
                <Route path="/scope-items" element={<ScopeItemsPage />} />
                <Route path="/requests" element={<RequestsPage />} />
                <Route path="/proposals" element={<ProposalsPage />} />
                <Route path="/settings" element={<Navigate to="/settings/billing" replace />} />
                <Route path="/settings/billing" element={<BillingPage />} />
              </Route>
            </Route>

            {/* Catch all - redirect to landing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <ToastContainer />
        </AuthInitializer>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
