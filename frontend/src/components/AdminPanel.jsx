import React, { useEffect, useState } from 'react';
import api from '../api';
import { RefreshCw, Trash2, AlertTriangle, Search, User, Briefcase, DollarSign, CheckCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function AdminPanel() {
  const [bookings, setBookings] = useState([]);
  const [providers, setProviders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { addToast } = useToast();

  const fetchData = async () => {
    try {
      const res = await api.get('/bookings');
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProviders = async () => {
      try {
          const res = await api.get('/users/providers');
          setProviders(res.data);
      } catch (err) {
          console.log('Failed to fetch providers');
      }
  };

  useEffect(() => {
    fetchData();
    fetchProviders();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAssign = async (bookingId) => {
      const providerId = prompt('Enter Provider ID to assign (copy from list below):');
      if(!providerId) return;

      // Optimistic Update
      const previousBookings = [...bookings];
      setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: 'Assigned', provider: { name: 'Assigned Provider' } } : b));

      try {
          await api.patch(`/bookings/${bookingId}/assign`, { providerId });
          addToast('Provider assigned successfully', 'success');
          fetchData(); // Re-sync to get actual provider details
      } catch(err) {
          setBookings(previousBookings); // Revert
          addToast('Assignment failed', 'error');
      }
  };

  const handleOverride = async (id, status) => {
    if(!window.confirm(`Force status to ${status}?`)) return;

    // Optimistic Update
    const previousBookings = [...bookings];
    setBookings(prev => prev.map(b => b._id === id ? { ...b, status } : b));

    try {
        await api.patch(`/bookings/${id}/status`, { status });
        addToast(`Status updated to ${status}`, 'info');
        // No need to fetch immediately if we trust our optimism, but fetching ensures consistency
        // setTimeout(fetchData, 1000); 
    } catch (err) {
        setBookings(previousBookings); // Revert
        addToast('Override failed', 'error');
    }
  };

  const handleDelete = async (id) => {
      if(!window.confirm('Delete this booking permanently?')) return;
      try {
          await api.delete(`/bookings/${id}`);
          addToast('Booking deleted', 'success');
          fetchData();
      } catch (err) {
          addToast('Delete failed', 'error');
      }
  }

  // Derived Stats
  const totalRevenue = bookings.filter(b => b.status === 'Completed').length * 50; 
  const pendingCount = bookings.filter(b => b.status === 'Pending').length;
  const activeCount = bookings.filter(b => b.status === 'In-progress').length;

  // Filter Logic
  const filteredBookings = bookings.filter(b => 
    b.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b._id.includes(searchTerm)
  );

  return (
    <div className="animate-enter">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
            <h2>Admin Ops Center</h2>
            <p className="text-muted">Manage network activity and overrides</p>
        </div>
        <button className="btn btn-outline" onClick={() => { fetchData(); fetchProviders(); }}>
            <RefreshCw size={16}/> Refresh Data
        </button>
      </div>
      


      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'start', flexWrap: 'wrap' }}>
          
          {/* Main Booking Table Area */}
          <div style={{ flex: 2, minWidth: '300px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3>All Bookings ({bookings.length})</h3>
                  <div style={{ position: 'relative' }}>
                      <input 
                        placeholder="Search ID, Customer..." 
                        style={{ paddingLeft: '2.5rem', width: '250px', margin: 0 }}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                      />
                      <Search size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)' }} />
                  </div>
              </div>

              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: '#f8fafc' }}>
                        <tr>
                        <th style={{ padding: '1rem', fontSize: '0.8rem', textTransform: 'uppercase' }}>ID</th>
                        <th style={{ padding: '1rem', fontSize: '0.8rem', textTransform: 'uppercase' }}>Request</th>
                        <th style={{ padding: '1rem', fontSize: '0.8rem', textTransform: 'uppercase' }}>Provider</th>
                        <th style={{ padding: '1rem', fontSize: '0.8rem', textTransform: 'uppercase' }}>Status</th>
                        <th style={{ padding: '1rem', fontSize: '0.8rem', textTransform: 'uppercase' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBookings.map(b => (
                        <tr key={b._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }} className="hover-row">
                            <td style={{ padding: '1rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{b._id.slice(-4)}</td>
                            <td style={{ padding: '1rem' }}>
                                <strong>{b.serviceType}</strong><br/>
                                <small className="text-muted">{b.customer?.name}</small>
                            </td>
                            <td style={{ padding: '1rem' }}>{b.provider?.name || <span className="text-muted">-</span>}</td>
                            <td style={{ padding: '1rem' }}>
                            <span className={`status-badge status-${b.status}`}>{b.status}</span>
                            </td>
                            <td style={{ padding: '1rem' }}>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {/* Assignment Logic */}
                                    {b.status === 'Pending' ? (
                                        <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={() => handleAssign(b._id)}>
                                            <User size={14} /> Assign
                                        </button>
                                    ) : (
                                        // Allow re-assign for any non-terminal state
                                        (b.status !== 'Completed' && b.status !== 'Cancelled') && (
                                            <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={() => handleAssign(b._id)}>
                                                <RefreshCw size={14} /> Reassign
                                            </button>
                                        )
                                    )}

                                    {/* Force Status Overrides */}
                                    {b.status !== 'Completed' && b.status !== 'Cancelled' && (
                                        <>
                                            <button className="btn btn-success" title="Force Complete" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={() => handleOverride(b._id, 'Completed')}>
                                                <CheckCircle size={14} /> Force Complete
                                            </button>
                                            <button className="btn btn-danger" title="Force Cancel" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={() => handleOverride(b._id, 'Cancelled')}>
                                                <Trash2 size={14} /> Cancel
                                            </button>
                                        </>
                                    )}
                                    
                                    {/* Delete for cleanup (only terminal states or if really needed) */}
                                    {(b.status === 'Completed' || b.status === 'Cancelled') && (
                                        <button className="btn btn-outline" title="Delete Record" style={{ padding: '0.4rem', color: 'var(--text-muted)' }} onClick={() => handleDelete(b._id)}>
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                    {filteredBookings.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No bookings match search.</div>}
                </div>
              </div>
          </div>

          {/* Sidebar Area */}
          <div style={{ flex: 1, minWidth: '250px' }}>
              {/* Provider List Helper */}
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                      <Briefcase size={16}/> Available Providers
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
                      {providers.map(p => (
                          <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '6px', background: '#f8fafc' }}>
                              <span>{p.name}</span>
                              <code style={{ fontSize: '0.7rem', padding: '2px 4px', background: 'white', borderRadius: '4px' }}>{p._id}</code>
                          </div>
                      ))}
                      {providers.length === 0 && <span className="text-muted">No providers online.</span>}
                  </div>
              </div>

               {/* Activity Log */}
               <div className="card">
                    <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <RefreshCw size={16}/> Live Activity
                    </h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {bookings
                            .flatMap(b => b.history.map(h => ({ ...h, bookingId: b._id, service: b.serviceType })))
                            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                            .slice(0, 5)
                            .map((h, i) => (
                                <li key={i} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                        <strong>{h.action}</strong>
                                        <span className="text-muted">{new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <span className="text-muted">by {h.user || 'System'} on {h.service}</span>
                                </li>
                            ))
                        }
                    </ul>
                </div>
          </div>
      </div>
    </div>
  );
}
