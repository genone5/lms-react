import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Spin } from 'antd';
import { MainLayout } from '../layout/MainLayout/MainLayout';
import { LoginPage } from '../features/login/LoginPage';
import { UnauthorizedPage } from '../features/login/UnauthorizedPage';
import { useAuthContext } from '../core/auth/AuthProvider';

const DashboardPage = lazy(() => import('../features/dashboard/pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const PatientListPage = lazy(() => import('../features/patients/pages/PatientListPage').then(m => ({ default: m.PatientListPage })));
const PatientDetailsPage = lazy(() => import('../features/patients/pages/PatientDetailsPage').then(m => ({ default: m.PatientDetailsPage })));
const TestListPage = lazy(() => import('../features/tests/pages/TestListPage').then(m => ({ default: m.TestListPage })));
const OrderListPage = lazy(() => import('../features/orders/pages/OrderListPage').then(m => ({ default: m.OrderListPage })));
const SampleCollectionPage = lazy(() => import('../features/samples/pages/SampleCollectionPage').then(m => ({ default: m.SampleCollectionPage })));
const ResultEntryPage = lazy(() => import('../features/results/pages/ResultEntryPage').then(m => ({ default: m.ResultEntryPage })));
const ReportListPage = lazy(() => import('../features/reports/pages/ReportListPage').then(m => ({ default: m.ReportListPage })));
const InvoiceListPage = lazy(() => import('../features/billing/pages/InvoiceListPage').then(m => ({ default: m.InvoiceListPage })));
const PaymentListPage = lazy(() => import('../features/billing/pages/PaymentListPage').then(m => ({ default: m.PaymentListPage })));
const UserListPage = lazy(() => import('../features/users/pages/UserListPage').then(m => ({ default: m.UserListPage })));
const RoleListPage = lazy(() => import('../features/roles/pages/RoleListPage').then(m => ({ default: m.RoleListPage })));
const BranchListPage = lazy(() => import('../features/branches/pages/BranchListPage').then(m => ({ default: m.BranchListPage })));
const AnalyticsPage = lazy(() => import('../features/analytics/pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const SettingsPage = lazy(() => import('../features/settings/pages/SettingsPage').then(m => ({ default: m.SettingsPage })));

const Loading = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
    <Spin size="large" />
  </div>
);

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthContext();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Suspense fallback={<Loading />}><DashboardPage /></Suspense>} />
        <Route path="patients" element={<Suspense fallback={<Loading />}><PatientListPage /></Suspense>} />
        <Route path="patients/:id" element={<Suspense fallback={<Loading />}><PatientDetailsPage /></Suspense>} />
        <Route path="tests" element={<Suspense fallback={<Loading />}><TestListPage /></Suspense>} />
        <Route path="orders" element={<Suspense fallback={<Loading />}><OrderListPage /></Suspense>} />
        <Route path="samples" element={<Suspense fallback={<Loading />}><SampleCollectionPage /></Suspense>} />
        <Route path="results" element={<Suspense fallback={<Loading />}><ResultEntryPage /></Suspense>} />
        <Route path="reports" element={<Suspense fallback={<Loading />}><ReportListPage /></Suspense>} />
        <Route path="billing" element={<Suspense fallback={<Loading />}><InvoiceListPage /></Suspense>} />
        <Route path="payments" element={<Suspense fallback={<Loading />}><PaymentListPage /></Suspense>} />
        <Route path="users" element={<Suspense fallback={<Loading />}><UserListPage /></Suspense>} />
        <Route path="roles" element={<Suspense fallback={<Loading />}><RoleListPage /></Suspense>} />
        <Route path="branches" element={<Suspense fallback={<Loading />}><BranchListPage /></Suspense>} />
        <Route path="analytics" element={<Suspense fallback={<Loading />}><AnalyticsPage /></Suspense>} />
        <Route path="settings" element={<Suspense fallback={<Loading />}><SettingsPage /></Suspense>} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
