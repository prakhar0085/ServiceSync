import React, { useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Briefcase, ArrowRight, ShieldCheck } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const endpoint = isLogin ? '/auth/login' : '/auth/signup';
    
    try {
      const res = await api.post(endpoint, formData);
      login(res.data.user, res.data.token);
      
      // Redirect based on role
      if (res.data.user.role === 'admin') navigate('/admin');
      else if (res.data.user.role === 'provider') navigate('/partner');
      else navigate('/'); // customer
      
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <div style={{ maxWidth: '420px', width: '100%' }} className="card animate-slide">
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ 
                    width: '60px', height: '60px', 
                    background: 'var(--primary-light)', 
                    borderRadius: '50%', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    margin: '0 auto 1rem', 
                    color: 'white' 
                }}>
                    <ShieldCheck size={32} />
                </div>
                <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                <p className="text-muted">{isLogin ? 'Sign in to access your dashboard' : 'Join ServiceSync today'}</p>
            </div>
      
            {error && <div style={{ background: 'var(--error-bg)', color: 'var(--error-text)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}
      
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {!isLogin && (
                <>
                    <div style={{ position: 'relative' }}>
                        <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input 
                            type="text" 
                            placeholder="Full Name"
                            required 
                            value={formData.name} 
                            onChange={e => setFormData({...formData, name: e.target.value})} 
                            style={{ paddingLeft: '2.8rem', width: '100%', boxSizing: 'border-box' }}
                        />
                    </div>
                    
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>I am a...</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button 
                                type="button"
                                className={formData.role === 'customer' ? 'btn btn-primary' : 'btn btn-outline'}
                                onClick={() => setFormData({...formData, role: 'customer'})}
                                style={{ flex: 1, justifyContent: 'center', padding: '0.6rem' }}
                            >
                                <User size={16} /> Customer
                            </button>
                            <button 
                                type="button"
                                className={formData.role === 'provider' ? 'btn btn-primary' : 'btn btn-outline'}
                                onClick={() => setFormData({...formData, role: 'provider'})}
                                style={{ flex: 1, justifyContent: 'center', padding: '0.6rem' }}
                            >
                                <Briefcase size={16} /> Partner
                            </button>
                        </div>
                    </div>
                </>
                )}
                
                <div style={{ position: 'relative' }}>
                    <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                        type="email" 
                        placeholder="Email Address"
                        required 
                        value={formData.email} 
                        onChange={e => setFormData({...formData, email: e.target.value})} 
                        style={{ paddingLeft: '2.8rem', width: '100%', boxSizing: 'border-box' }}
                    />
                </div>
                
                <div style={{ position: 'relative' }}>
                    <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                        type="password" 
                        placeholder="Password"
                        required 
                        value={formData.password} 
                        onChange={e => setFormData({...formData, password: e.target.value})} 
                        style={{ paddingLeft: '2.8rem', width: '100%', boxSizing: 'border-box' }}
                    />
                </div>
                
                <button className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', padding: '1rem', fontSize: '1rem', justifyContent: 'center' }} disabled={loading}>
                    {loading ? 'Processing...' : (isLogin ? 'Login' : 'Create Account')} <ArrowRight size={20} style={{ marginLeft: '0.5rem' }}/>
                </button>
            </form>
            
            <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)' }}>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button 
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', padding: 0 }} 
                    onClick={() => { setIsLogin(!isLogin); setError(''); }}
                >
                    {isLogin ? 'Sign Up' : 'Login'}
                </button>
            </p>
        </div>
    </div>
  );
}
