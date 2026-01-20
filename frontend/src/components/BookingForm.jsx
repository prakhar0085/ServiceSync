import React, { useState } from 'react';
import api from '../api';
import { Calendar, User, Wrench, MapPin, DollarSign, Sparkles, ArrowRight } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function BookingForm() {
  const [formData, setFormData] = useState({
    serviceType: 'Home Cleaning',
    date: '',
    location: '', // Added location
  });
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const prices = {
      'Home Cleaning': 50,
      'Plumbing': 80,
      'Electrician': 75,
      'AC Repair': 100
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!formData.date || !formData.location) {
        addToast('Please fill in all fields', 'error');
        return;
    }

    setLoading(true);
    try {
      await api.post('/bookings', { ...formData, price: prices[formData.serviceType] });
      addToast('Booking Request Sent! 🚀', 'success');
      setFormData({ serviceType: 'Home Cleaning', date: '', location: '' });
    } catch (err) {
      console.error('Booking Error:', err);
      const errorMsg = err.response?.data?.error || 'Failed to create booking.';
      addToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card animate-slide" style={{ maxWidth: '450px', borderTop: '4px solid var(--primary)' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0, fontSize: '1.5rem' }}>
            <div style={{ background: 'var(--info-bg)', padding: '0.6rem', borderRadius: '12px', color: 'var(--primary)' }}>
                <Sparkles size={24} />
            </div>
            Book a Service
        </h2>
        <p className="text-muted" style={{ margin: '0.5rem 0 0 0' }}>Tell us what you need, we'll find a pro.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Service Type Selection */}
        <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-body)' }}>Service Required</label>
            <div style={{ position: 'relative' }}>
                <Wrench size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <select 
                value={formData.serviceType}
                onChange={(e) => setFormData({...formData, serviceType: e.target.value})}
                style={{ width: '100%', paddingLeft: '2.8rem', appearance: 'none', cursor: 'pointer' }}
                >
                    {Object.keys(prices).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {/* Price badge removed as requested */}
            </div>
        </div>

        {/* Date & Location Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-body)' }}>Date</label>
                <div style={{ position: 'relative' }}>
                    <Calendar size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                        type="date" 
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        style={{ width: '100%', paddingLeft: '2.8rem', boxSizing: 'border-box' }}
                        required
                    />
                </div>
            </div>
            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-body)' }}>Location</label>
                <div style={{ position: 'relative' }}>
                    <MapPin size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                        type="text" 
                        placeholder="Zip / Area"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        style={{ width: '100%', paddingLeft: '2.8rem', boxSizing: 'border-box' }}
                        required
                    />
                </div>
            </div>
        </div>

        {/* Action Button */}
        <button className="btn btn-primary" style={{ marginTop: '0.5rem', padding: '1rem', fontSize: '1rem', justifyContent: 'space-between' }} disabled={loading}>
          <span>{loading ? 'Finding Professionals...' : 'Confirm Request'}</span>
          {!loading && <ArrowRight size={20} />}
        </button>
      </form>
    </div>
  );
}
