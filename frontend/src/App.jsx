import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import BookingForm from './components/BookingForm';
import ProviderDashboard from './components/ProviderDashboard';
import CustomerBookings from './components/CustomerBookings';
import AdminPanel from './components/AdminPanel';
import AuthPage from './pages/AuthPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Home, Briefcase, Settings, LogOut, Calendar } from 'lucide-react';

function NavBar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const isActive = (path) => location.pathname === path ? 'active' : '';

  if (!user) return null; // Don't show navbar if not logged in

  return (
    <nav className="header">
      <Link to="/" style={{ textDecoration: 'none' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--primary)', fontWeight: 'bold', letterSpacing: '-0.025em' }}>
            ServiceSync
        </h1>
      </Link>
      <div className="nav-links" style={{ display: 'flex', alignItems: 'center' }}>
        {user.role === 'customer' && (
            <>
                <Link to="/" className={isActive('/')}><Home size={18} style={{ marginBottom: '-3px' }}/> Home</Link>
                <Link to="/my-bookings" className={isActive('/my-bookings')}><Calendar size={18} style={{ marginBottom: '-3px' }}/> My Bookings</Link>
            </>
        )}
        {user.role === 'provider' && <Link to="/partner" className={isActive('/partner')}><Briefcase size={18} style={{ marginBottom: '-3px' }}/> Partner</Link>}
        {user.role === 'admin' && <Link to="/admin" className={isActive('/admin')}><Settings size={18} style={{ marginBottom: '-3px' }}/> Admin</Link>}
        
        <button onClick={logout} className="btn btn-outline" style={{ marginLeft: '2rem', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
            <LogOut size={14}/> Logout ({user.name})
        </button>
      </div>
    </nav>
  );
}

const ProtectedRoute = ({ children, roles }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/auth" />;
    if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
    return children;
};

function AppRoutes() {
    return (
        <div className="container">
          <NavBar />
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            
            <Route path="/" element={
              <ProtectedRoute roles={['customer']}>
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '3rem', alignItems: 'start' }}>
                    <BookingForm />
                    <div style={{ paddingTop: '1rem', animation: 'fadeIn 0.5s ease-out' }}>
                        <h1 style={{ fontSize: '3.5rem', fontWeight: '800', lineHeight: '1.1', marginBottom: '1.5rem', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                            Home services,<br/> 
                            <span style={{ 
                                background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)', 
                                WebkitBackgroundClip: 'text', 
                                WebkitTextFillColor: 'transparent',
                                display: 'inline-block' 
                            }}>
                                On demand.
                            </span>
                        </h1>
                        <p style={{ fontSize: '1.25rem', color: 'var(--text-body)', marginBottom: '2.5rem', maxWidth: '480px', lineHeight: '1.6' }}>
                            Book trusted professionals for cleaning, maintenance, and repairs in less than <strong style={{ color: 'var(--text-main)' }}>60 seconds</strong>.
                        </p>
                    </div>
                </div>
              </ProtectedRoute>
            } />

            <Route path="/my-bookings" element={
                <ProtectedRoute roles={['customer']}>
                    <CustomerBookings />
                </ProtectedRoute>
            } />
            
            <Route path="/partner" element={
                <ProtectedRoute roles={['provider']}>
                    <ProviderDashboard />
                </ProtectedRoute>
            } />
            
            <Route path="/admin" element={
                <ProtectedRoute roles={['admin']}>
                    <AdminPanel />
                </ProtectedRoute>
            } />
          </Routes>
        </div>
    );
}

import { ToastProvider } from './context/ToastContext';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
            <AppRoutes />
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
