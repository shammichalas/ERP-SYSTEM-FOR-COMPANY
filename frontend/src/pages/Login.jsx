import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock, Mail, Loader2, ShieldCheck, Activity } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:8005/login', { email, password });
      const { access_token, role } = response.data;
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('role', role);
      
      if (role === 'Admin') navigate('/admin');
      else if (role === 'HR') navigate('/hr');
      else if (role === 'Accountant') navigate('/accountant');
      else navigate('/employee');
      
    } catch (err) {
      setError(err.response?.data?.detail || 'Identity verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left Branding Side */}
      <div style={{ flex: 1.2, background: 'var(--secondary)', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '40px', left: '40px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ background: 'var(--primary)', padding: '10px', borderRadius: '15px' }}>
            <Activity size={28} color="black" />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>ERP-HQ</h2>
        </div>
        
        <h1 style={{ color: 'white', fontSize: '4rem', maxWidth: '600px', lineHeight: 1.1 }}>Optimize your <span style={{ color: 'var(--primary)' }}>Business intelligence</span> with precision.</h1>
        <p style={{ marginTop: '30px', opacity: 0.7, fontSize: '1.2rem', maxWidth: '500px' }}>Experience a new era of management with our AI-powered ecosystem designed for modern enterprises.</p>
        
        <div style={{ display: 'flex', gap: '20px', marginTop: '60px' }}>
           <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '24px', flex: 1 }}>
              <h3 style={{ color: 'var(--primary)' }}>99.9%</h3>
              <p style={{ fontSize: '0.9rem', opacity: 0.6 }}>System Uptime</p>
           </div>
           <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '24px', flex: 1 }}>
              <h3 style={{ color: 'var(--primary)' }}>Shield V2</h3>
              <p style={{ fontSize: '0.9rem', opacity: 0.6 }}>Security Active</p>
           </div>
        </div>
      </div>

      {/* Right Form Side */}
      <div style={{ flex: 1, background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '450px', padding: '50px' }}>
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ marginBottom: '10px' }}>Identity Login</h2>
            <p style={{ color: 'var(--text-muted)' }}>Enter your system credentials below.</p>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.85rem', fontWeight: 'bold' }}>SYSTEM EMAIL</label>
              <div style={{ position: 'relative' }}>
                <Mail style={{ position: 'absolute', left: '16px', top: '15px', color: 'var(--text-muted)' }} size={18} />
                <input 
                  type="email" 
                  placeholder="name@system.com" 
                  style={{ paddingLeft: '48px' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.85rem', fontWeight: 'bold' }}>PASSWORD</label>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: '16px', top: '15px', color: 'var(--text-muted)' }} size={18} />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  style={{ paddingLeft: '48px' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '24px', textAlign: 'center' }}>{error}</p>}

            <button type="submit" className="btn-primary" style={{ width: '100%', background: 'var(--primary)', color: 'black' }} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : 'Authenticate'}
            </button>
          </form>

          <p style={{ marginTop: '40px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Protected Environment. System logs recorded.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
