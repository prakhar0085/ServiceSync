import React, { useEffect, useState } from 'react';
import api from '../api';
import { Clock, CheckCircle, AlertTriangle, Calendar, MapPin, XCircle, Plus } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { Link } from 'react-router-dom';

export default function CustomerBookings() {
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('active');
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
    const interval = setInterval(fetchBookings, 3000);
    return () => clearInterval(interval);
  }, []);

  const cancelBooking = async (id) => {
      if(!window.confirm('Are you sure you want to cancel?')) return;
      
      // Optimistic Update: Move to cancelled/history immediately
      const previousBookings = [...bookings];
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status: 'Cancelled' } : b));

      try {
          await api.patch(`/bookings/${id}/status`, { status: 'Cancelled' });
          addToast('Booking cancelled.', 'info');
          // No need to fetch immediately if we trust local state
      } catch (err) {
          setBookings(previousBookings); // Revert
          addToast('Failed to cancel.', 'error');
      }
  };

  // Filter Bookings
  const activeBookings = bookings.filter(b => ['Pending', 'Assigned', 'In-progress'].includes(b.status));
  const pastBookings = bookings.filter(b => ['Completed', 'Cancelled'].includes(b.status));

  // Helper for Status Steps
  const getProgressStep = (status) => {
      if (status === 'Pending') return 1;
      if (status === 'Assigned') return 2;
      if (status === 'In-progress') return 3;
      return 0;
  };

  return (
    <div style={{ marginTop: '2rem' }} className="animate-enter">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
                <h3>My Bookings</h3>
                <p className="text-muted" style={{ margin: 0 }}>Manage your home services</p>
            </div>
            <div style={{ background: 'var(--bg-input)', padding: '0.25rem', borderRadius: '8px', display: 'flex' }}>
                <button 
                  className={`btn ${activeTab === 'active' ? 'btn-primary' : ''}`}
                  style={{ borderRadius: '6px', padding: '0.4rem 1rem', fontSize: '0.85rem', border: 'none', background: activeTab === 'active' ? 'white' : 'transparent', color: activeTab === 'active' ? 'var(--primary)' : 'var(--text-muted)', boxShadow: activeTab === 'active' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
                  onClick={() => setActiveTab('active')}
                >
                    Active
                </button>
                <button 
                  className={`btn ${activeTab === 'history' ? 'btn-primary' : ''}`}
                  style={{ borderRadius: '6px', padding: '0.4rem 1rem', fontSize: '0.85rem', border: 'none', background: activeTab === 'history' ? 'white' : 'transparent', color: activeTab === 'history' ? 'var(--primary)' : 'var(--text-muted)', boxShadow: activeTab === 'history' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
                  onClick={() => setActiveTab('history')}
                >
                    History
                </button>
            </div>
        </div>

        {bookings.length === 0 && (
             <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                <div className="animate-pulse" style={{ width: '40px', height: '40px', background: 'var(--border)', borderRadius: '50%', margin: '0 auto 1rem' }}></div>
                <p>Syncing your bookings...</p>
             </div>
        )}

        {activeTab === 'active' && bookings.length > 0 && (
            <div className="grid animate-enter">
                {activeBookings.length === 0 && (
                    <div className="card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', border: '2px dashed var(--border)', background: 'var(--bg-page)' }}>
                        <div style={{ background: 'var(--bg-input)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--primary)' }}>
                            <Calendar size={32} />
                        </div>
                        <h3 style={{ marginBottom: '0.5rem' }}>No Active Bookings</h3>
                        <p className="text-muted" style={{ maxWidth: '400px', margin: '0 auto 2rem' }}>You don't have any upcoming services scheduled. Ready to book your first pro?</p>
                        <Link to="/" onClick={() => window.scrollTo(0,0)} className="btn btn-primary" style={{ padding: '0.8rem 2rem', fontSize: '1rem' }}>
                            <Plus size={18}/> Book a Service
                        </Link>
                    </div>
                )}
                {activeBookings.map(b => {
                    const step = getProgressStep(b.status);
                    return (
                        <div key={b._id} className="card" style={{ position: 'relative', overflow: 'hidden', borderTop: '4px solid var(--primary)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 0.25rem' }}>{b.serviceType}</h3>
                                    <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>
                                        {b.status === 'Pending' ? 'Finding the best pro for you...' : 
                                         b.status === 'Assigned' ? 'Provider is on the way!' : 
                                         'Job in progress'}
                                    </p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span className={`status-badge status-${b.status}`} style={{ marginBottom: '0.25rem' }}>{b.status}</span>
                                    {/* Price display removed */}
                                </div>
                            </div>
                            
                            {/* Visual Progress Tracker */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                <div style={{ flex: 1, height: '4px', background: step >= 1 ? 'var(--primary)' : 'var(--border)', borderRadius: '2px' }}></div>
                                <div style={{ flex: 1, height: '4px', background: step >= 2 ? 'var(--primary)' : 'var(--border)', borderRadius: '2px' }}></div>
                                <div style={{ flex: 1, height: '4px', background: step >= 3 ? 'var(--primary)' : 'var(--border)', borderRadius: '2px' }}></div>
                            </div>

                            <div style={{ background: 'var(--bg-page)', padding: '1rem', borderRadius: '12px', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Calendar size={18} className="text-muted" /> 
                                    <span style={{ fontWeight: 500 }}>{b.date}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                                    <div style={{ width: '24px', height: '24px', background: 'var(--primary-light)', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                                        {b.provider?.name ? b.provider.name[0] : '?'}
                                    </div>
                                    <span>{b.provider?.name || 'Searching...'}</span>
                                </div>
                            </div>

                            {(b.status === 'Pending' || b.status === 'Assigned') && (
                                <button className="btn btn-outline btn-danger-hover" style={{ width: '100%', justifyContent: 'center', borderColor: 'rgba(239, 68, 68, 0.2)', color: 'var(--error-text)' }} onClick={() => cancelBooking(b._id)}>
                                    Cancel Booking
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        )}

        {/* Improved History Tab - Compact List */}
        {activeTab === 'history' && bookings.length > 0 && (
            <div className="animate-enter">
                {pastBookings.length === 0 && (
                    <div className="card text-muted" style={{ textAlign: 'center', padding: '3rem' }}>No past bookings found.</div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {pastBookings.map(b => (
                        <div key={b._id} className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.85 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '40px', height: '40px', background: b.status === 'Completed' ? 'var(--success-bg)' : 'var(--error-bg)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: b.status === 'Completed' ? 'var(--success-text)' : 'var(--error-text)' }}>
                                    {b.status === 'Completed' ? <CheckCircle size={20}/> : <XCircle size={20}/>}
                                </div>
                                <div>
                                    <h4 style={{ margin: 0 }}>{b.serviceType}</h4>
                                    <small className="text-muted">{b.date}</small>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span className={`status-badge status-${b.status}`}>{b.status}</span>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{b.provider?.name}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
  );
}
