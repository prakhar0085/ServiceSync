import React, { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

export default function ProviderDashboard() {
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('available');
  const { user } = useAuth();
  const { addToast } = useToast();

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings');
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBookings();
    const interval = setInterval(fetchBookings, 5000); 
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (id, action, payload = {}) => {
    try {
        if (action === 'assign') {
            await api.patch(`/bookings/${id}/assign`);
            addToast('Job Accepted! 🚀', 'success');
        } else if (action === 'status') {
            await api.patch(`/bookings/${id}/status`, { ...payload });
            addToast(`Status updated to ${payload.status || 'Pending'}`, 'info');
        }
        fetchBookings();
    } catch (err) {
        addToast(err.response?.data?.error || 'Action failed', 'error');
    }
  };

  const [ignoredIds, setIgnoredIds] = useState([]);

  const handleIgnore = (id) => {
    setIgnoredIds(prev => [...prev, id]);
  };
  
  // Guard clause if user is not loaded yet
  if (!user) return <p>Loading...</p>;

  // Filter for Partner View
  // "Available" are Pending bookings that are NOT assigned to anyone (provider is null)
  // AND NOT locally ignored
  const availableJobs = bookings.filter(b => b.status === 'Pending' && !b.provider && !ignoredIds.includes(b._id));
  
  // "My Jobs" are bookings assigned to ME (user._id)
  const myJobs = bookings.filter(b => b.provider?._id === user.id && b.status !== 'Completed' && b.status !== 'Cancelled');
  
  // --- Stats Calculation ---
  // "Past Jobs" - Completed or Cancelled/Rejected by me
  const pastJobs = bookings.filter(b => b.provider?._id === user.id && (b.status === 'Completed' || b.status === 'Cancelled'));
  
  const completedCount = pastJobs.filter(b => b.status === 'Completed').length;
  const activeCount = myJobs.length;



  const getServiceIcon = (type) => {
    // Simple mock icon mapping or default
    return <Clock size={20} className="text-secondary" />;
  };

  return (
    <div className="animate-enter">
      {/* Header Section */}
      <div style={{ 
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', 
          padding: '2rem', 
          borderRadius: '16px', 
          color: 'white',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.4)'
      }}>
        <div>
            <h2 style={{ margin: 0, color: 'white' }}>Partner Dashboard</h2>
            <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>Welcome back, <strong>{user?.name}</strong></p>
        </div>
        <div style={{ textAlign: 'right' }}>
            <div className="status-badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
                ● Online
            </div>
            <div style={{ marginTop: '0.5rem' }}>
                <button onClick={fetchBookings} className="btn" style={{ background: 'white', color: 'var(--primary)', padding: '0.4rem 0.8rem', fontSize: '0.8rem', border: 'none' }}>
                    Refresh
                </button>
            </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
          <div className="stat-card">
              <div className="stat-label">Jobs Completed</div>
              <div className="stat-value">{completedCount}</div>
              <small className="text-muted">Top Rated Pro 🌟</small>
          </div>
          <div className="stat-card">
              <div className="stat-label">Active Jobs</div>
              <div className="stat-value">{activeCount}</div>
              <small className="text-muted">Currently in progress</small>
          </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', marginBottom: '2rem' }}>
          <button 
            className={`btn ${activeTab === 'available' ? 'btn-primary' : 'btn-outline'}`} 
            style={{ borderRadius: '0', border: 'none', borderBottom: activeTab === 'available' ? '2px solid var(--primary)' : '2px solid transparent', background: 'transparent', color: activeTab === 'available' ? 'var(--primary)' : 'var(--text-muted)' }}
            onClick={() => setActiveTab('available')}
          >
              Available Jobs ({availableJobs.length})
          </button>
          <button 
            className={`btn ${activeTab === 'active' ? 'btn-primary' : 'btn-outline'}`} 
            style={{ borderRadius: '0', border: 'none', borderBottom: activeTab === 'active' ? '2px solid var(--primary)' : '2px solid transparent', background: 'transparent', color: activeTab === 'active' ? 'var(--primary)' : 'var(--text-muted)' }}
            onClick={() => setActiveTab('active')}
          >
              Active Jobs ({myJobs.length})
          </button>
          <button 
            className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-outline'}`} 
            style={{ borderRadius: '0', border: 'none', borderBottom: activeTab === 'history' ? '2px solid var(--primary)' : '2px solid transparent', background: 'transparent', color: activeTab === 'history' ? 'var(--primary)' : 'var(--text-muted)' }}
            onClick={() => setActiveTab('history')}
          >
              History
          </button>
      </div>
      
      {/* Content Area */}
{/* Content Area */}
      {/* Global Skeleton Loader if Initial Fetching */}
      {bookings.length === 0 && (
           <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
               <div className="animate-pulse" style={{ width: '40px', height: '40px', background: 'var(--border)', borderRadius: '50%', margin: '0 auto 1rem' }}></div>
               <p>Searching for opportunities...</p>
           </div>
      )}

      {activeTab === 'available' && bookings.length > 0 && (
          <div className="grid animate-enter">
            {availableJobs.length === 0 && (
                <div className="card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', border: '2px dashed var(--border)', backgroundColor: 'var(--bg-page)' }}>
                    <div style={{ background: '#e0f2fe', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#0284c7' }}>
                        <CheckCircle size={32} />
                    </div>
                    <h3 style={{ marginBottom: '0.5rem' }}>All Caught Up</h3>
                    <p className="text-muted">There are no new open jobs right now. Great work!</p>
                </div>
            )}
            {availableJobs.map(booking => (
              <div key={booking._id} className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'start' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ background: 'var(--primary-light)', padding: '0.6rem', borderRadius: '12px', color: 'white' }}>
                            <Clock size={20} /> 
                        </div>
                        <div>
                            <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{booking.serviceType}</h4>
                            <small className="text-muted">Posted {new Date(booking.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small>
                        </div>
                    </div>
                    <span className="status-badge status-Pending">OPEN</span>
                </div>
                
                <div style={{ background: 'var(--bg-page)', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="text-muted">Date</span>
                        <strong>{booking.date}</strong>
                     </div>
                     <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="text-muted">Customer</span>
                        <strong>{booking.customer?.name || 'Unknown'}</strong>
                     </div>
                     {/* Est. Earning removed */}
                </div>
                
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="btn btn-primary" onClick={() => handleAction(booking._id, 'assign')} style={{ flex: 2 }}>
                    Accept Job
                  </button>
                  <button className="btn btn-outline" onClick={() => handleIgnore(booking._id)} style={{ flex: 1 }}>
                     Skip
                  </button>
                </div>
              </div>
            ))}
          </div>
      )}

      {activeTab === 'active' && bookings.length > 0 && (
          <div className="grid animate-enter">
            {myJobs.length === 0 && (
                 <div className="card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', border: '2px dashed var(--border)', backgroundColor: 'var(--bg-page)' }}>
                    <div style={{ background: '#f3e8ff', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#7e22ce' }}>
                        <CheckCircle size={32} />
                    </div>
                    <h3>No Active Jobs</h3>
                    <p className="text-muted" style={{ marginBottom: '1.5rem' }}>You don't have any jobs in progress. Check the 'Available' tab.</p>
                    <button className="btn btn-primary" onClick={() => setActiveTab('available')}>Browse Markets</button>
                </div>
            )}
            {myJobs.map(booking => (
              <div key={booking._id} className="card" style={{ borderColor: 'var(--primary)', borderWidth: '2px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, right: 0, padding: '0.4rem 1rem', background: booking.status === 'In-progress' ? 'var(--primary)' : 'var(--info-bg)', color: booking.status === 'In-progress' ? 'white' : 'var(--info-text)', borderBottomLeftRadius: '12px', fontWeight: 'bold', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    {booking.status}
                </div>

                <div style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.4rem' }}>{booking.serviceType}</h3>
                    <p className="text-muted" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                         For: <strong>{booking.customer?.name || 'Client'}</strong>
                    </p>
                </div>
                
                <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-page)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <div>
                        <div className="text-muted" style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>Scheduled</div>
                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{booking.date}</div>
                     </div>
                     {/* Payout removed */}
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {booking.status === 'Assigned' && (
                      <button className="btn btn-primary" style={{ flex: 1, padding: '0.8rem' }} onClick={() => handleAction(booking._id, 'status', { status: 'In-progress' })}>
                          Start Job
                      </button>
                  )}
                  {booking.status === 'In-progress' && (
                      <button className="btn btn-success" style={{ flex: 1, padding: '0.8rem' }} onClick={() => handleAction(booking._id, 'status', { status: 'Completed' })}>
                          Mark Complete
                      </button>
                  )}
                  
                  <button className="btn btn-danger" style={{ padding: '0.8rem' }} title="Cancel Job" onClick={() => handleAction(booking._id, 'status', { status: 'Pending' })}>
                     <XCircle size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
      )}

      {activeTab === 'history' && bookings.length > 0 && (
          <div className="grid animate-enter">
             {pastJobs.length === 0 && <p className="text-muted">Your completed history will show here.</p>}
              {pastJobs.map(booking => (
                <div key={booking._id} className="card" style={{ background: '#f8fafc', opacity: 0.8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                             <h4 style={{ color: 'var(--text-muted)', margin: '0 0 0.25rem 0' }}>{booking.serviceType}</h4>
                             <small>{booking.date} • {booking.customer?.name}</small>
                        </div>
                        <span className={`status-badge status-${booking.status}`}>{booking.status}</span>
                    </div>
                </div>
              ))}
          </div>
      )}
    </div>
  );
}
