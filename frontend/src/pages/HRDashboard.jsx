import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  LogOut, 
  Briefcase, 
  Users, 
  Calendar, 
  CreditCard, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  XCircle,
  Loader2,
  Download
} from 'lucide-react';

const HRDashboard = ({ isAdminView = false }) => {
  const [activeTab, setActiveTab] = useState('directory');
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const navigate = useNavigate();

  const API_BASE = 'http://localhost:8005/hr';
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      if (activeTab === 'directory') {
        const res = await axios.get(`${API_BASE}/employees`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEmployees(res.data);
      } else if (activeTab === 'leaves') {
        const res = await axios.get(`${API_BASE}/leaves`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLeaves(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const TabButton = ({ value, label, icon: Icon }) => (
    <button 
      onClick={() => setActiveTab(value)}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '16px', 
        padding: '16px 20px', 
        width: '100%',
        background: activeTab === value ? 'var(--primary)' : 'transparent',
        border: 'none',
        color: 'black',
        cursor: 'pointer',
        textAlign: 'left',
        borderRadius: '24px',
        marginBottom: '4px',
        transition: '0.3s',
        fontWeight: activeTab === value ? '700' : '500'
      }}
    >
      <Icon size={22} color={activeTab === value ? "black" : "#757575"} />
      <span style={{ color: activeTab === value ? "black" : "#757575" }}>{label}</span>
    </button>
  );

  return (
    <div className={isAdminView ? "" : "dashboard-container"}>
      {!isAdminView && (
        <div className="sidebar">
          <div style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'var(--accent)', padding: '8px', borderRadius: '8px' }}>
              <Briefcase size={24} color="white" />
            </div>
            <h2 style={{ fontSize: '1.25rem' }}>HR Portal</h2>
          </div>
          
          <div style={{ flex: 1 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '600', padding: '0 16px 12px', letterSpacing: '0.05em' }}>MAIN MENU</p>
            <TabButton value="directory" label="Employee Directory" icon={Users} />
            <TabButton value="add" label="Add Employee" icon={Plus} />
            <TabButton value="leaves" label="Leave Management" icon={Calendar} />
            <TabButton value="payroll" label="Payroll System" icon={CreditCard} />
          </div>

          <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', cursor: 'pointer', fontWeight: '500' }}>
            <LogOut size={20} /> Sign Out
          </button>
        </div>
      )}

      <div className={isAdminView ? "" : "main-content"}>
        {isAdminView && (
           <div style={{ display: 'flex', gap: '15px', marginBottom: '32px', borderBottom: '1px solid var(--border)', paddingBottom: '20px' }}>
              <button onClick={() => setActiveTab('directory')} style={{ background: activeTab === 'directory' ? 'var(--primary)' : 'transparent', color: 'black', border: 'none', padding: '10px 20px', borderRadius: '15px', cursor: 'pointer', fontWeight: '700' }}>Directory</button>
              <button onClick={() => setActiveTab('add')} style={{ background: activeTab === 'add' ? 'var(--primary)' : 'transparent', color: 'black', border: 'none', padding: '10px 20px', borderRadius: '15px', cursor: 'pointer', fontWeight: '700' }}>Add Employee</button>
              <button onClick={() => setActiveTab('leaves')} style={{ background: activeTab === 'leaves' ? 'var(--primary)' : 'transparent', color: 'black', border: 'none', padding: '10px 20px', borderRadius: '15px', cursor: 'pointer', fontWeight: '700' }}>Leaves</button>
              <button onClick={() => setActiveTab('payroll')} style={{ background: activeTab === 'payroll' ? 'var(--primary)' : 'transparent', color: 'black', border: 'none', padding: '10px 20px', borderRadius: '15px', cursor: 'pointer', fontWeight: '700' }}>Payroll</button>
           </div>
        )}
        <header style={{ marginBottom: '40px' }}>
          <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ')}</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your workspace and team efficiently.</p>
        </header>

        {activeTab === 'directory' && (
          <div className="glass-card animate-fade-in" style={{ padding: '24px' }}>
             <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                  <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Employee ID</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Name</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Dept / Role</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Salary</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp.employee_id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px', fontWeight: '600' }}>{emp.employee_id}</td>
                    <td style={{ padding: '12px' }}>{emp.full_name}<br/><span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{emp.email}</span></td>
                    <td style={{ padding: '12px' }}>{emp.department}<br/><span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{emp.designation}</span></td>
                    <td style={{ padding: '12px' }}>${emp.salary.toLocaleString()}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>{emp.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'add' && <AddEmployeeForm setTab={setActiveTab} token={token} API={API_BASE} />}
        
        {activeTab === 'leaves' && (
           <div className="glass-card animate-fade-in" style={{ padding: '24px' }}>
           <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Employee</th>
                <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Type</th>
                <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Duration</th>
                <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Reason</th>
                <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Status</th>
                <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map(l => (
                <tr key={l._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px' }}>{l.employee_id}</td>
                  <td style={{ padding: '12px' }}>{l.type}</td>
                  <td style={{ padding: '12px' }}>{l.start_date} to {l.end_date}</td>
                  <td style={{ padding: '12px' }}>{l.reason}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '0.75rem', 
                      background: l.status === 'Approved' ? 'rgba(16, 185, 129, 0.1)' : l.status === 'Pending' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: l.status === 'Approved' ? '#10b981' : l.status === 'Pending' ? '#f59e0b' : '#ef4444'
                    }}>
                      {l.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {l.status === 'Pending' && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={async () => {
                           await axios.patch(`${API_BASE}/leaves/${l._id}?status=Approved`, {}, { headers: { Authorization: `Bearer ${token}` }});
                           fetchData();
                        }} style={{ padding: '4px', background: 'rgba(16, 185, 129, 0.1)', border: 'none', borderRadius: '4px', color: '#10b981', cursor: 'pointer' }}><CheckCircle2 size={16}/></button>
                        <button onClick={async () => {
                           await axios.patch(`${API_BASE}/leaves/${l._id}?status=Rejected`, {}, { headers: { Authorization: `Bearer ${token}` }});
                           fetchData();
                        }} style={{ padding: '4px', background: 'rgba(239, 68, 68, 0.1)', border: 'none', borderRadius: '4px', color: '#ef4444', cursor: 'pointer' }}><XCircle size={16}/></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}

        {activeTab === 'payroll' && <PayrollSystem token={token} API={API_BASE} />}
      </div>
    </div>
  );
};

const AddEmployeeForm = ({ setTab, token, API }) => {
  const [formData, setFormData] = useState({
    full_name: '', email: '', employee_id: '', department: 'Engineering', designation: '', joining_date: '', salary: 0
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API}/employees`, formData, { headers: { Authorization: `Bearer ${token}` }});
      setTab('directory');
    } catch (err) {
      alert(err.response?.data?.detail || "Error adding employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card animate-fade-in" style={{ padding: '32px', maxWidth: '600px' }}>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ gridColumn: 'span 2' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Full Name</label>
          <input required type="text" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Employee ID</label>
          <input required type="text" placeholder="EMP001" value={formData.employee_id} onChange={e => setFormData({...formData, employee_id: e.target.value})} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Department</label>
          <select value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}>
            <option>Engineering</option>
            <option>HR</option>
            <option>Sales</option>
            <option>Finance</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Joined Date</label>
          <input required type="date" value={formData.joining_date} onChange={e => setFormData({...formData, joining_date: e.target.value})} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Monthly Salary</label>
          <input required type="number" value={formData.salary} onChange={e => setFormData({...formData, salary: parseFloat(e.target.value)})} />
        </div>
        <div style={{ gridColumn: 'span 2' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Email</label>
          <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
        </div>
        <div style={{ gridColumn: 'span 2' }}>
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : 'Register Employee'}
          </button>
        </div>
      </form>
    </div>
  );
};

const PayrollSystem = ({ token, API }) => {
  const [month, setMonth] = useState('April 2024');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      await axios.post(`${API}/payroll/generate?month=${month}`, {}, { headers: { Authorization: `Bearer ${token}` }});
      alert(`Payroll generated for ${month}`);
    } catch (err) {
      alert("Error generating payroll");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card animate-fade-in" style={{ padding: '40px', textAlign: 'center' }}>
      <CreditCard size={48} style={{ color: 'var(--accent)', marginBottom: '16px' }} />
      <h3>Monthly Payroll Generation</h3>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Generate and distribute payslips for all active employees.</p>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', maxWidth: '400px', margin: '0 auto' }}>
        <select value={month} onChange={e => setMonth(e.target.value)} style={{ flex: 1 }}>
          <option>April 2024</option>
          <option>May 2024</option>
          <option>June 2024</option>
        </select>
        <button className="btn-primary" onClick={handleGenerate} disabled={loading} style={{ flex: 1 }}>
          {loading ? <Loader2 className="animate-spin" /> : 'Process Payroll'}
        </button>
      </div>
    </div>
  );
};

export default HRDashboard;
