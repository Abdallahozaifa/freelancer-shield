import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useAuthStore } from './stores/authStore';
import { Loading, ToastContainer } from './components/ui';
import { LoginPage, RegisterPage, ProfilePage } from './pages';
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

// Placeholder pages - will be replaced by modules
function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
      <p className="text-gray-500">Module F09 - Coming Soon</p>
    </div>
  );
}

function ClientsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Clients</h1>
      <p className="text-gray-500">Module F04 - Coming Soon</p>
    </div>
  );
}

function ProjectsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Projects</h1>
      <p className="text-gray-500">Module F05 - Coming Soon</p>
    </div>
  );
}

function ScopeItemsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Scope Items</h1>
      <p className="text-gray-500">Module F06 - Coming Soon</p>
    </div>
  );
}

function RequestsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Client Requests</h1>
      <p className="text-gray-500">Module F07 - Coming Soon</p>
    </div>
  );
}

function ProposalsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Proposals</h1>
      <p className="text-gray-500">Module F08 - Coming Soon</p>
    </div>
  );
}

function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
      <p className="text-gray-500">Coming Soon</p>
    </div>
  );
}

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
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
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

          {/* Protected routes with AppLayout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/dashboard" element={<Navigate to="/" replace />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/clients" element={<ClientsPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/scope-items" element={<ScopeItemsPage />} />
              <Route path="/requests" element={<RequestsPage />} />
              <Route path="/proposals" element={<ProposalsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          {/* Catch all - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ToastContainer />
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
