import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  LayoutDashboard, 
  UserPlus, 
  Users, 
  LogOut, 
  Loader2, 
  CheckCircle2, 
  XCircle,
  Briefcase,
  Wallet,
  UserCircle,
  ShieldCheck,
  Calendar,
  CreditCard,
  FileText,
  PieChart,
  Settings,
  Activity,
  Search,
  Bell,
  Grid,
  Trash2
} from 'lucide-react';

import HRDashboard from './HRDashboard';
import AccountantDashboard from './AccountantDashboard';

const SidebarLink = ({ to, icon: Icon, label, active }) => (
  <Link 
    to={to} 
    style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '16px', 
      padding: '16px 20px', 
      textDecoration: 'none', 
      color: active ? 'var(--text-primary)' : 'var(--text-muted)',
      background: active ? 'var(--primary)' : 'transparent',
      borderRadius: '24px',
      marginBottom: '8px',
      transition: '0.3s ease',
      fontWeight: active ? '700' : '500'
    }}
  >
    <Icon size={24} />
    {!window.matchMedia("(max-width: 1024px)").matches && <span>{label}</span>}
  </Link>
);

const UserManagement = () => {
  const [formData, setFormData] = useState({ email: '', password: '', full_name: '', role: 'Employee' });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8005/users', { headers: { Authorization: `Bearer ${token}` } });
      setUsers(response.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg({ text: '', type: '' });
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8005/create-user', formData, { headers: { Authorization: `Bearer ${token}` } });
      setMsg({ text: 'User provisioned successfully', type: 'success' });
      setFormData({ email: '', password: '', full_name: '', role: 'Employee' });
      fetchUsers();
    } catch (err) {
      setMsg({ text: err.response?.data?.detail || 'Provisioning failed', type: 'error' });
    } finally { setLoading(false); }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Permanent Action: Are you sure you want to de-provision this account?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8005/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.detail || "Action failed");
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '40px' }}>
        <div className="glass-card">
          <h3 style={{ marginBottom: '24px' }}>New Provision</h3>
          <form onSubmit={handleCreateUser}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>FULL NAME</label>
              <input type="text" required value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>EMAIL</label>
              <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>PASSWORD</label>
              <input type="password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
            </div>
            <div style={{ marginBottom: '32px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>SYSTEM ROLE</label>
              <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                <option value="HR">HR Manager</option>
                <option value="Accountant">Accountant</option>
                <option value="Employee">Employee</option>
                <option value="Admin">Administrator</option>
              </select>
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', background: 'var(--primary)', color: 'black' }}>
              {loading ? <Loader2 className="animate-spin" /> : 'Provision User'}
            </button>
            {msg.text && <p style={{ marginTop: '16px', textAlign: 'center', color: msg.type === 'success' ? '#2e7d32' : '#c62828', fontSize: '0.85rem' }}>{msg.text}</p>}
          </form>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h3>System Roster</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{users.length} Active Users</span>
          </div>
          <table style={{ width: '100%' }}>
            <thead>
              <tr style={{ textAlign: 'left' }}>
                <th style={{ padding: '0 0 16px' }}>User</th>
                <th style={{ padding: '0 0 16px' }}>Role</th>
                <th style={{ padding: '0 0 16px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td style={{ padding: '16px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{u.full_name.charAt(0)}</div>
                      <div>
                        <div style={{ fontWeight: '600' }}>{u.full_name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge" style={{ background: u.role === 'Admin' ? 'var(--primary)' : '#eee', color: 'black' }}>{u.role}</span>
                  </td>
                  <td>
                    <button 
                      onClick={() => handleDeleteUser(u._id)}
                      style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Trash2 size={18} color="#ef4444" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <div style={{ marginBottom: '60px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ background: 'var(--primary)', padding: '10px', borderRadius: '15px' }}>
            <Activity size={28} color="black" />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>ERP-HQ</h2>
        </div>

        <div style={{ flex: 1 }}>
          <SidebarLink to="/admin" icon={Grid} label="Dashboard" active={location.pathname === '/admin'} />
          <SidebarLink to="/admin/users" icon={Users} label="Team Access" active={location.pathname === '/admin/users'} />
          <SidebarLink to="/admin/hr" icon={Briefcase} label="HR Ops" active={location.pathname === '/admin/hr'} />
          <SidebarLink to="/admin/accounts" icon={Wallet} label="Financials" active={location.pathname === '/admin/accounts'} />
          <div style={{ margin: '40px 0 20px', height: '1px', background: '#eee' }}></div>
          <SidebarLink to="/admin/settings" icon={Settings} label="System" />
        </div>

        <button onClick={handleLogout} style={{ border: '1px solid #eee', background: 'transparent', borderRadius: '20px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', cursor: 'pointer' }}>
          <LogOut size={20} color="#ef4444" />
          <span style={{ color: '#ef4444', fontWeight: '600' }}>Exit</span>
        </button>
      </div>

      <div className="main-content">
        <div className="top-bar">
          <div className="search-box">
            <Search size={20} color="var(--text-muted)" />
            <input type="text" placeholder="Search system records..." style={{ border: 'none', background: 'transparent', padding: 0 }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ position: 'relative' }}>
              <Bell size={24} />
              <div style={{ position: 'absolute', top: -4, right: -4, width: '10px', height: '100%', background: 'var(--primary)', border: '2px solid white', borderRadius: '50%' }}></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'white', padding: '6px 20px 6px 6px', borderRadius: '30px', boxShadow: 'var(--shadow)' }}>
               <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>A</div>
               <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>Admin</span>
            </div>
          </div>
        </div>

        <Routes>
          <Route path="/" element={
            <div className="animate-fade-in">
              <h1 style={{ marginBottom: '40px' }}>Global Overview</h1>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '40px' }}>
                <div>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px' }}>
                      <div className="glass-card" style={{ background: 'var(--secondary)', color: 'white' }}>
                        <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>System Uptime</p>
                        <h2 style={{ marginTop: '10px' }}>99.9%</h2>
                        <div style={{ marginTop: '20px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
                           <div style={{ width: '99%', height: '100%', background: 'var(--primary)', borderRadius: '2px' }}></div>
                        </div>
                      </div>
                      <div className="glass-card">
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Security Layer</p>
                        <h2 style={{ marginTop: '10px' }}>Shield V2</h2>
                        <span className="badge badge-success" style={{ display: 'inline-block', marginTop: '15px' }}>Active</span>
                      </div>
                   </div>
                   <div className="glass-card">
                      <h3>Deployment Intelligence</h3>
                      <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '15px', marginTop: '40px' }}>
                         {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                           <div key={i} style={{ flex: 1, height: `${h}%`, background: h > 75 ? 'var(--primary)' : 'var(--secondary)', borderRadius: '10px 10px 0 0' }}></div>
                         ))}
                      </div>
                   </div>
                </div>
                <div className="glass-card">
                   <h3>Audit Logs</h3>
                   <div style={{ marginTop: '30px' }}>
                      {[1,2,3,4].map(i => (
                        <div key={i} style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
                           <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: i===1 ? 'var(--primary)' : '#eee', marginTop: '5px' }}></div>
                           <div>
                              <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>User Creation Event</div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Successfully provisioned EMP_00{i}</div>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              </div>
            </div>
          } />
          
          <Route path="/users" element={<UserManagement />} />
          <Route path="/hr/*" element={<HRDashboard isAdminView={true} />} />
          <Route path="/accounts/*" element={<AccountantDashboard isAdminView={true} />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;
