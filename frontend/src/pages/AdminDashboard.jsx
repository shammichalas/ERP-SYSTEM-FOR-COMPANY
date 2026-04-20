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
  Trash2,
  Clock,
  Fingerprint
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
  const [formData, setFormData] = useState({ email: '', password: '', full_name: '', role: 'Employee', permissions: [] });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
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
      setMsg({ text: 'User provisioned with permissions', type: 'success' });
      setFormData({ email: '', password: '', full_name: '', role: 'Employee', permissions: [] });
      fetchUsers();
    } catch (err) {
      setMsg({ text: err.response?.data?.detail || 'Provisioning failed', type: 'error' });
    } finally { setLoading(false); }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("CRITICAL: Are you sure you want to revoke system access?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8005/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.detail || "Action failed");
    }
  };

  const filteredUsers = users.filter(u => u.full_name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '40px' }}>
        <div className="glass-card">
          <h3 style={{ marginBottom: '24px' }}>Strategic Provisioning</h3>
          <form onSubmit={handleCreateUser}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>FULL LEGAL NAME</label>
              <input type="text" required value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>SYSTEM EMAIL</label>
              <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>TEMPORARY PASSWORD</label>
              <input type="password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>SYSTEM ROLE</label>
              <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                <option value="HR">People Operations (HR)</option>
                <option value="Accountant">Fiscal Controller (Acc)</option>
                <option value="Employee">Staff Member</option>
                <option value="Admin">System Superuser</option>
              </select>
            </div>
            <div style={{ marginBottom: '32px' }}>
               <label style={{ fontSize: '0.75rem', fontWeight: '800', marginBottom: '12px', display: 'block', letterSpacing: '0.05em' }}>PERMISSIONS LAYER</label>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {['read_all', 'write_all', 'delete_access', 'export_data'].map(p => (
                    <label key={p} className="permission-pill">
                       <input 
                        type="checkbox" 
                        checked={formData.permissions.includes(p)} 
                        onChange={e => {
                          const newP = e.target.checked ? [...formData.permissions, p] : formData.permissions.filter(x => x !== p);
                          setFormData({...formData, permissions: newP});
                        }} 
                       />
                       <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-primary)' }}>{p.replace('_', ' ').toUpperCase()}</span>
                    </label>
                  ))}
               </div>
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', background: 'var(--primary)', color: 'black' }}>
              {loading ? <Loader2 className="animate-spin" /> : 'Authorize User'}
            </button>
            {msg.text && <p style={{ marginTop: '16px', textAlign: 'center', color: msg.type === 'success' ? '#2e7d32' : '#c62828', fontSize: '0.85rem' }}>{msg.text}</p>}
          </form>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h3>Identity Vault</h3>
            <div className="search-box" style={{ width: '250px', background: 'var(--bg-main)' }}>
               <Search size={16} color="var(--text-muted)" />
               <input type="text" placeholder="Filter identities..." value={search} onChange={e => setSearch(e.target.value)} style={{ border: 'none', background: 'transparent', width: '100%' }} />
            </div>
          </div>
          <table style={{ width: '100%' }}>
            <thead>
              <tr style={{ textAlign: 'left' }}>
                <th style={{ padding: '0 0 16px' }}>User</th>
                <th style={{ padding: '0 0 16px' }}>Role</th>
                <th style={{ padding: '0 0 16px' }}>Clearance</th>
                <th style={{ padding: '0 0 16px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
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
                    <span className="badge" style={{ background: u.role === 'Admin' ? 'black' : '#eee', color: u.role === 'Admin' ? 'white' : 'black' }}>{u.role}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.permissions?.length || 0} Layers</span>
                  </td>
                  <td>
                    <button 
                      onClick={() => handleDeleteUser(u._id)}
                      style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer' }}
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
  const [auditLogs, setAuditLogs] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8005/audit-logs', { headers: { Authorization: `Bearer ${token}` } });
      setAuditLogs(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchLogs(); }, []);

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
          <SidebarLink to="/admin" icon={Grid} label="Security Core" active={location.pathname === '/admin'} />
          <SidebarLink to="/admin/users" icon={Users} label="Identity Vault" active={location.pathname === '/admin/users'} />
          <SidebarLink to="/admin/hr" icon={Briefcase} label="People Ops" active={location.pathname === '/admin/hr'} />
          <SidebarLink to="/admin/accounts" icon={Wallet} label="Fiscal Ledger" active={location.pathname === '/admin/accounts'} />
          <div style={{ margin: '40px 0 20px', height: '1px', background: '#eee' }}></div>
          <SidebarLink to="/admin/settings" icon={Settings} label="Global Config" />
        </div>

        <button onClick={handleLogout} style={{ border: '1px solid #eee', background: 'transparent', borderRadius: '20px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', cursor: 'pointer' }}>
          <LogOut size={20} color="#ef4444" />
          <span style={{ color: '#ef4444', fontWeight: '600' }}>Exit Engine</span>
        </button>
      </div>

      <div className="main-content">
        <div className="top-bar">
          <div className="search-box">
            <Search size={20} color="var(--text-muted)" />
            <input type="text" placeholder="Global system query..." style={{ border: 'none', background: 'transparent', padding: 0 }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ position: 'relative' }}>
              <Bell size={24} />
              <div style={{ position: 'absolute', top: -4, right: -4, width: '10px', height: '100%', background: 'var(--primary)', border: '2px solid white', borderRadius: '50%' }}></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'white', padding: '6px 20px 6px 6px', borderRadius: '30px', boxShadow: 'var(--shadow)' }}>
               <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>HQ</div>
               <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>Command Centre</span>
            </div>
          </div>
        </div>

        <Routes>
          <Route path="/" element={
            <div className="animate-fade-in">
              <h1 style={{ marginBottom: '40px' }}>Strategic Overview</h1>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '40px' }}>
                <div>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px' }}>
                      <div className="glass-card" style={{ background: '#000', color: 'white' }}>
                        <p style={{ opacity: 0.8, fontSize: '0.8rem', letterSpacing: '1px' }}>SYSTEM UPTIME</p>
                        <h2 style={{ marginTop: '10px', fontSize: '2.5rem' }}>99.99%</h2>
                        <div style={{ marginTop: '20px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
                           <div style={{ width: '99%', height: '100%', background: 'var(--primary)', borderRadius: '2px' }}></div>
                        </div>
                      </div>
                      <div className="glass-card">
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', letterSpacing: '1px' }}>ACTIVE SESSIONS</p>
                        <h2 style={{ marginTop: '10px', fontSize: '2.5rem' }}>14</h2>
                        <span className="badge badge-success" style={{ display: 'inline-block', marginTop: '15px' }}>SECURE</span>
                      </div>
                   </div>
                   <div className="glass-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                        <h3>Operational Intelligence</h3>
                        <div style={{ display: 'flex', gap: '10px' }}>
                           <div style={{ padding: '4px 12px', borderRadius: '20px', background: 'var(--primary)', fontSize: '0.7rem', fontWeight: 'bold' }}>DEPLOYED</div>
                        </div>
                      </div>
                      <div style={{ height: '220px', display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
                         {[40, 70, 45, 90, 65, 80, 55, 30, 85, 60].map((h, i) => (
                           <div key={i} style={{ flex: 1, height: `${h}%`, background: h > 75 ? 'black' : 'var(--primary)', borderRadius: '8px', transition: '0.5s', cursor: 'pointer' }}></div>
                         ))}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                         <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span>
                      </div>
                   </div>
                </div>
                <div className="glass-card" style={{ padding: '0' }}>
                   <div style={{ padding: '32px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                         <Clock size={20} color="var(--primary)" />
                         <h3 style={{ margin: 0 }}>Immutable Audit Log</h3>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                        {auditLogs.slice(0, 8).map((log, i) => (
                          <div key={i} style={{ display: 'flex', gap: '20px', padding: '20px 32px', borderBottom: i === 7 ? 'none' : '1px solid #f5f5f5', transition: '0.3s' }}>
                             <div style={{ marginTop: '5px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: log.action === 'DELETE' ? '#ef4444' : 'var(--primary)' }}></div>
                             </div>
                             <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                   <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>{log.action}</span>
                                   <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                </div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>{log.performed_by} modified {log.target}</p>
                             </div>
                          </div>
                        ))}
                      </div>
                   </div>
                   <button onClick={fetchLogs} style={{ width: '100%', padding: '16px', background: '#fcfcfc', border: 'none', borderTop: '1px solid #eee', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>Refresh Logs</button>
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
