import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './components/layout/ProtectedRoute'

import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import OAuthCallback from './pages/auth/OAuthCallback'
import DashboardPage from './pages/DashboardPage'
import ResourceCataloguePage from './pages/resources/ResourceCataloguePage'
import ResourceDetailPage from './pages/resources/ResourceDetailPage'
import ResourceFormPage from './pages/resources/ResourceFormPage'
import PlaceholderPage from './pages/PlaceholderPage'
import UsersPage from './pages/admin/UsersPage'
import NotificationsPage from './pages/NotificationsPage'
import BookingsPage from './pages/bookings/BookingsPage'
import BookingFormPage from './pages/bookings/BookingFormPage'
import BookingDetailPage from './pages/bookings/BookingDetailPage'
import MyWaitlistPage from './pages/MyWaitlistPage'

import TicketsPage from './pages/tickets/TicketsPage'
import TicketDetailPage from './pages/tickets/TicketDetailPage'
import CreateTicketPage from './pages/tickets/CreateTicketPage'

export default function App() {
  return (
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Toaster
                position="top-right"
                toastOptions={{
                  style: {
                    background: '#16162a',
                    color: '#e2e8f0',
                    border: '1px solid #2a2a45',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontFamily: 'DM Sans, sans-serif',
                  },
                  success: { iconTheme: { primary: '#6366f1', secondary: 'white' } },
                  error: { iconTheme: { primary: '#ef4444', secondary: 'white' } },
                }}
            />

            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/oauth2/callback" element={<OAuthCallback />} />

              {/* Protected routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute><DashboardPage /></ProtectedRoute>
              } />

              {/* Module A — Resources */}
              <Route path="/resources" element={
                <ProtectedRoute><ResourceCataloguePage /></ProtectedRoute>
              } />
              <Route path="/resources/new" element={
                <ProtectedRoute requiredRole="ADMIN"><ResourceFormPage /></ProtectedRoute>
              } />
              <Route path="/resources/:id" element={
                <ProtectedRoute><ResourceDetailPage /></ProtectedRoute>
              } />
              <Route path="/resources/:id/edit" element={
                <ProtectedRoute requiredRole="ADMIN"><ResourceFormPage /></ProtectedRoute>
              } />

              {/* Module B — Bookings */}
              <Route path="/bookings" element={
                <ProtectedRoute><BookingsPage /></ProtectedRoute>
              } />
              <Route path="/bookings/new" element={
                <ProtectedRoute><BookingFormPage /></ProtectedRoute>
              } />
              <Route path="/bookings/:id" element={
                <ProtectedRoute><BookingDetailPage /></ProtectedRoute>
              } />
                
              {/* Module B — Waitlist */}
              <Route path="/waitlist" element={
                <ProtectedRoute><MyWaitlistPage /></ProtectedRoute>
              } />

              {/* Module C — Tickets  */}
              <Route path="/tickets" element={
                <ProtectedRoute><TicketsPage /></ProtectedRoute>
              } />

              <Route path="/tickets/new" element={
                <ProtectedRoute><CreateTicketPage /></ProtectedRoute>
              } />

              <Route path="/tickets/:id" element={
                <ProtectedRoute><TicketDetailPage /></ProtectedRoute>
              } />


              {/* Module D — Notifications */}
              <Route path="/notifications" element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              } />

              {/* Admin routes */}
              <Route path="/admin/users" element={
                <ProtectedRoute requiredRole="ADMIN">
                  <UsersPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/analytics" element={
                <ProtectedRoute requiredRole="MANAGER">
                  <PlaceholderPage title="Analytics" subtitle="Campus usage insights and reports" />
                </ProtectedRoute>
              } />

              {/* Redirects */}
              <Route path="/" element={<Navigate to="/resources" replace />} />
              <Route path="*" element={<Navigate to="/resources" replace />} />
              <Route path="/tickets/*" element={<Navigate to="/tickets" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
  )
}
