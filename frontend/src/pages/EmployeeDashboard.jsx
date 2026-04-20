import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  LogOut, 
  UserCircle, 
  Calendar, 
  FileText, 
  Bell, 
  MapPin, 
  Mail, 
  Phone,
  Loader2,
  Send
} from 'lucide-react';

const EmployeeDashboard = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState(null);
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const HR_API = 'http://localhost:8005/hr';
  const BASE_API = 'http://localhost:8005';
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${BASE_API}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data);
      // Fetch payslips for this employee using their full name or id (simulated)
      const payRes = await axios.get(`${HR_API}/payslips/EMP001`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayslips(payRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (loading) return <div className="flex-center" style={{ height: '100vh' }}><Loader2 className="animate-spin" /></div>;

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <div style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'var(--primary)', padding: '8px', borderRadius: '8px' }}>
            <UserCircle size={24} color="white" />
          </div>
          <h2 style={{ fontSize: '1.25rem' }}>Self Service</h2>
        </div>

        <div style={{ flex: 1 }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '600', padding: '0 16px 12px' }}>MY PORTAL</p>
          <button onClick={() => setActiveTab('profile')} style={{ ...tabStyle, background: activeTab === 'profile' ? 'rgba(99, 102, 241, 0.1)' : 'transparent', color: activeTab === 'profile' ? 'white' : 'var(--text-muted)', borderLeft: activeTab === 'profile' ? '3px solid var(--primary)' : '3px solid transparent' }}>
            <UserCircle size={20} /> My Profile
          </button>
          <button onClick={() => setActiveTab('leave')} style={{ ...tabStyle, background: activeTab === 'leave' ? 'rgba(99, 102, 241, 0.1)' : 'transparent', color: activeTab === 'leave' ? 'white' : 'var(--text-muted)', borderLeft: activeTab === 'leave' ? '3px solid var(--primary)' : '3px solid transparent' }}>
            <Calendar size={20} /> Apply Leave
          </button>
          <button onClick={() => setActiveTab('payslip')} style={{ ...tabStyle, background: activeTab === 'payslip' ? 'rgba(99, 102, 241, 0.1)' : 'transparent', color: activeTab === 'payslip' ? 'white' : 'var(--text-muted)', borderLeft: activeTab === 'payslip' ? '3px solid var(--primary)' : '3px solid transparent' }}>
            <FileText size={20} /> Payslips
          </button>
        </div>

        <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', padding: '12px', color: '#ef4444', display: 'flex', gap: '12px', cursor: 'pointer' }}>
          <LogOut size={20} /> Sign Out
        </button>
      </div>

      <div className="main-content">
        {activeTab === 'profile' && profile && (
          <div className="animate-fade-in">
            <div className="glass-card" style={{ padding: '40px', display: 'flex', gap: '40px', alignItems: 'center', marginBottom: '32px' }}>
               <div style={{ width: '120px', height: '120px', background: 'var(--primary)', borderRadius: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 'bold' }}>
                  {profile.full_name.charAt(0)}
               </div>
               <div>
                  <h1>{profile.full_name}</h1>
                  <p style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '1.1rem' }}>{profile.role} • ERP System</p>
                  <div style={{ display: 'flex', gap: '24px', marginTop: '16px', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={16}/> {profile.email}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={16}/> Head Office, NY</span>
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'leave' && <ApplyLeaveForm token={token} API={HR_API} />}

        {activeTab === 'payslip' && (
          <div className="glass-card animate-fade-in" style={{ padding: '24px' }}>
             <h3>My Salary Slips</h3>
             <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                    <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Month</th>
                    <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Amount</th>
                    <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Status</th>
                    <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {payslips.map(p => (
                    <tr key={p._id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px' }}>{p.month}</td>
                      <td style={{ padding: '12px' }}>${p.base_salary.toLocaleString()}</td>
                      <td style={{ padding: '12px' }}><span style={{ color: '#10b981' }}>{p.status}</span></td>
                      <td style={{ padding: '12px' }}><button style={{ background: 'transparent', border: '1px solid var(--border)', color: 'white', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>Download</button></td>
                    </tr>
                  ))}
                  {payslips.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No payslips generated yet.</td></tr>}
                </tbody>
             </table>
          </div>
        )}
      </div>
    </div>
  );
};

const ApplyLeaveForm = ({ token, API }) => {
  const [formData, setFormData] = useState({ type: 'Casual', start_date: '', end_date: '', reason: '', employee_id: 'USER_CURRENT' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API}/leaves`, formData, { headers: { Authorization: `Bearer ${token}` }});
      alert("Leave application submitted!");
    } catch (err) { alert("Error submitting request"); }
    finally { setLoading(false); }
  };

  return (
    <div className="glass-card animate-fade-in" style={{ padding: '32px', maxWidth: '500px' }}>
      <h3>Apply for Leave</h3>
      <form onSubmit={handleSubmit} style={{ marginTop: '24px' }}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Leave Type</label>
          <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
            <option>Casual</option>
            <option>Sick</option>
            <option>Annual</option>
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>From</label>
            <input type="date" required value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>To</label>
            <input type="date" required value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} />
          </div>
        </div>
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Reason</label>
          <input type="text" required value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} />
        </div>
        <button className="btn-primary" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : <><Send size={18}/> Submit Request</>}
        </button>
      </form>
    </div>
  );
};

const tabStyle = {
  display: 'flex', 
  alignItems: 'center', 
  gap: '12px', 
  padding: '12px 16px', 
  width: '100%',
  border: 'none',
  cursor: 'pointer',
  textAlign: 'left',
  borderRadius: '0 8px 8px 0',
  marginBottom: '4px',
  transition: '0.3s',
  fontSize: '1rem'
};

export default EmployeeDashboard;
