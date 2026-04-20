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
  Download,
  Search,
  Filter,
  UserCheck,
  FileSpreadsheet,
  UploadCloud
} from 'lucide-react';

const exportToCSV = (data, fileName) => {
    if (!data || !data.length) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => Object.values(obj).join(',')).join('\n');
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${fileName}.csv`);
    document.body.appendChild(link);
    link.click();
};

const HRDashboard = ({ isAdminView = false }) => {
  const [activeTab, setActiveTab] = useState('directory');
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('All');
  
  const navigate = useNavigate();
  const API_BASE = 'http://localhost:8005/hr';
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
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
      } else if (activeTab === 'recruitment') {
        const res = await axios.get(`${API_BASE}/recruitment/candidates`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCandidates(res.data);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
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

  const filteredEmps = employees.filter(e => {
    const matchSearch = e.full_name.toLowerCase().includes(search.toLowerCase()) || e.employee_id.toLowerCase().includes(search.toLowerCase());
    const matchDept = filterDept === 'All' || e.department === filterDept;
    return matchSearch && matchDept;
  });

  return (
    <div className={isAdminView ? "" : "dashboard-container"}>
      {!isAdminView && (
        <div className="sidebar">
          <div style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'var(--primary)', padding: '8px', borderRadius: '8px' }}>
              <Briefcase size={24} color="black" />
            </div>
            <h2 style={{ fontSize: '1.25rem' }}>Core Staffing</h2>
          </div>
          
          <div style={{ flex: 1 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '600', padding: '0 16px 12px', letterSpacing: '0.05em' }}>PEOPLE OPS</p>
            <TabButton value="directory" label="Employee Roster" icon={Users} />
            <TabButton value="add" label="New Onboarding" icon={Plus} />
            <TabButton value="recruitment" label="Hiring Pipeline" icon={UserCheck} />
            <TabButton value="leaves" label="Absence Control" icon={Calendar} />
            <TabButton value="payroll" label="Salary Engine" icon={CreditCard} />
          </div>

          <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', cursor: 'pointer', fontWeight: '600' }}>
            <LogOut size={20} /> Sign Out
          </button>
        </div>
      )}

      <div className={isAdminView ? "" : "main-content"}>
        {isAdminView && (
           <div style={{ display: 'flex', gap: '15px', marginBottom: '32px', borderBottom: '1px solid var(--border)', paddingBottom: '20px' }}>
              <button onClick={() => setActiveTab('directory')} style={{ background: activeTab === 'directory' ? 'var(--primary)' : 'transparent', color: 'black', border: 'none', padding: '10px 20px', borderRadius: '15px', cursor: 'pointer', fontWeight: '700' }}>Roster</button>
              <button onClick={() => setActiveTab('add')} style={{ background: activeTab === 'add' ? 'var(--primary)' : 'transparent', color: 'black', border: 'none', padding: '10px 20px', borderRadius: '15px', cursor: 'pointer', fontWeight: '700' }}>Onboard</button>
              <button onClick={() => setActiveTab('recruitment')} style={{ background: activeTab === 'recruitment' ? 'var(--primary)' : 'transparent', color: 'black', border: 'none', padding: '10px 20px', borderRadius: '15px', cursor: 'pointer', fontWeight: '700' }}>Recruitment</button>
              <button onClick={() => setActiveTab('leaves')} style={{ background: activeTab === 'leaves' ? 'var(--primary)' : 'transparent', color: 'black', border: 'none', padding: '10px 20px', borderRadius: '15px', cursor: 'pointer', fontWeight: '700' }}>Leaves</button>
              <button onClick={() => setActiveTab('payroll')} style={{ background: activeTab === 'payroll' ? 'var(--primary)' : 'transparent', color: 'black', border: 'none', padding: '10px 20px', borderRadius: '15px', cursor: 'pointer', fontWeight: '700' }}>Payroll</button>
           </div>
        )}
        <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
             <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ')} Control</h1>
             <p style={{ color: 'var(--text-muted)' }}>Enterprise human resource and lifecycle management.</p>
          </div>
          {activeTab === 'directory' && (
             <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                   onClick={() => exportToCSV(filteredEmps, 'staff_roster')}
                   style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#f8f9fa', border: '1px solid #eee', borderRadius: '15px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}
                >
                   <FileSpreadsheet size={18} /> Export Staff
                </button>
                <div className="search-box" style={{ width: '300px' }}>
                   <Search size={18} color="var(--text-muted)" />
                   <input type="text" placeholder="Search by name or ID..." value={search} onChange={e => setSearch(e.target.value)} style={{ border: 'none', background: 'transparent' }} />
                </div>
                <select value={filterDept} onChange={e => setFilterDept(e.target.value)} style={{ width: '150px', background: 'white' }}>
                   <option value="All">All Departments</option>
                   <option>Engineering</option>
                   <option>HR</option>
                   <option>Sales</option>
                   <option>Finance</option>
                </select>
             </div>
          )}
        </header>

        {activeTab === 'directory' && (
          <div className="glass-card animate-fade-in" style={{ padding: '32px' }}>
             <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                  <th style={{ padding: '16px', color: 'var(--text-muted)' }}>Staff Member</th>
                  <th style={{ padding: '16px', color: 'var(--text-muted)' }}>Department</th>
                  <th style={{ padding: '16px', color: 'var(--text-muted)' }}>Base Salary</th>
                  <th style={{ padding: '16px', color: 'var(--text-muted)' }}>Lifecycle</th>
                  <th style={{ padding: '16px', color: 'var(--text-muted)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmps.map(emp => (
                  <tr key={emp.employee_id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{emp.full_name.charAt(0)}</div>
                          <div>
                             <div style={{ fontWeight: '700' }}>{emp.full_name}</div>
                             <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{emp.employee_id} • {emp.email}</div>
                          </div>
                       </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                       <div style={{ fontWeight: '600' }}>{emp.department}</div>
                       <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{emp.designation}</div>
                    </td>
                    <td style={{ padding: '16px', fontWeight: '800' }}>${emp.salary.toLocaleString()}</td>
                    <td style={{ padding: '16px', fontSize: '0.85rem' }}>{new Date(emp.joining_date).toLocaleDateString()}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>{emp.status.toUpperCase()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'add' && <AddEmployeeForm setTab={setActiveTab} token={token} API={API_BASE} />}
        
        {activeTab === 'leaves' && (
           <div className="glass-card animate-fade-in" style={{ padding: '32px' }}>
              <h3>Time-Off Workflow</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                <th style={{ padding: '16px', color: 'var(--text-muted)' }}>Employee ID</th>
                <th style={{ padding: '16px', color: 'var(--text-muted)' }}>Type</th>
                <th style={{ padding: '16px', color: 'var(--text-muted)' }}>Timeline</th>
                <th style={{ padding: '16px', color: 'var(--text-muted)' }}>Justification</th>
                <th style={{ padding: '16px', color: 'var(--text-muted)' }}>Status</th>
                <th style={{ padding: '16px', textAlign: 'center' }}>Workflow</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map(l => (
                <tr key={l._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px', fontWeight: 'bold' }}>{l.employee_id}</td>
                  <td style={{ padding: '16px' }}><span className="badge">{l.type}</span></td>
                  <td style={{ padding: '16px' }}>
                     <div style={{ fontSize: '0.9rem' }}>{l.start_date} → {l.end_date}</div>
                     <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Applied: {new Date(l.applied_on).toLocaleDateString()}</div>
                  </td>
                  <td style={{ padding: '16px', maxWidth: '200px', fontSize: '0.85rem' }}>{l.reason}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      padding: '6px 12px', 
                      borderRadius: '20px', 
                      fontSize: '0.75rem', 
                      fontWeight: '800',
                      background: l.status === 'Approved' ? 'rgba(16, 185, 129, 0.1)' : l.status === 'Pending' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: l.status === 'Approved' ? '#10b981' : l.status === 'Pending' ? '#f59e0b' : '#ef4444'
                    }}>
                      {l.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    {l.status === 'Pending' && (
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <button onClick={async () => {
                           await axios.patch(`${API_BASE}/leaves/${l._id}?status=Approved`, {}, { headers: { Authorization: `Bearer ${token}` }});
                           fetchData();
                        }} style={{ width: '36px', height: '36px', background: '#dcfce7', border: 'none', borderRadius: '10px', color: '#166534', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle2 size={18}/></button>
                        <button onClick={async () => {
                           await axios.patch(`${API_BASE}/leaves/${l._id}?status=Rejected`, {}, { headers: { Authorization: `Bearer ${token}` }});
                           fetchData();
                        }} style={{ width: '36px', height: '36px', background: '#fee2e2', border: 'none', borderRadius: '10px', color: '#991b1b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><XCircle size={18}/></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}

        {activeTab === 'recruitment' && (
           <div className="glass-card animate-fade-in" style={{ padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', alignItems: 'center' }}>
                 <h3>Talent Pipeline (Hiring Workflow)</h3>
                 <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>APPLIED → INTERVIEW → SELECTED</span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                    <th style={{ padding: '16px' }}>Candidate</th>
                    <th style={{ padding: '16px' }}>Position</th>
                    <th style={{ padding: '16px' }}>Current State</th>
                    <th style={{ padding: '16px', textAlign: 'center' }}>Advance Workflow</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map(c => (
                    <tr key={c._id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px' }}>
                         <div style={{ fontWeight: '700' }}>{c.full_name}</div>
                         <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.email}</div>
                      </td>
                      <td style={{ padding: '16px' }}><span className="badge">{c.position}</span></td>
                      <td style={{ padding: '16px' }}>
                         <span style={{ 
                            padding: '6px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '900',
                            background: c.status === 'Selected' ? '#dcfce7' : c.status === 'Rejected' ? '#fee2e2' : '#fef9c3',
                            color: c.status === 'Selected' ? '#166534' : c.status === 'Rejected' ? '#991b1b' : '#854d0e'
                         }}>{c.status.toUpperCase()}</span>
                      </td>
                      <td style={{ padding: '16px' }}>
                         <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            {c.status === 'Applied' && (
                               <button onClick={async () => {
                                  await axios.patch(`${API_BASE}/recruitment/candidates/${c._id}/status?status=Interview`, {}, { headers: { Authorization: `Bearer ${token}` }});
                                  fetchData();
                               }} className="btn-primary" style={{ fontSize: '0.7rem', padding: '8px 12px', background: 'black', color: 'white' }}>Schedule Interview</button>
                            )}
                            {c.status === 'Interview' && (
                               <button onClick={async () => {
                                  await axios.patch(`${API_BASE}/recruitment/candidates/${c._id}/status?status=Selected`, {}, { headers: { Authorization: `Bearer ${token}` }});
                                  fetchData();
                               }} className="btn-primary" style={{ fontSize: '0.7rem', padding: '8px 12px', background: 'var(--primary)', color: 'black' }}>Confirm Selection</button>
                            )}
                            {(c.status === 'Applied' || c.status === 'Interview') && (
                               <button onClick={async () => {
                                  await axios.patch(`${API_BASE}/recruitment/candidates/${c._id}/status?status=Rejected`, {}, { headers: { Authorization: `Bearer ${token}` }});
                                  fetchData();
                               }} style={{ padding: '8px', background: '#fee2e2', border: 'none', borderRadius: '8px', cursor: 'pointer' }}><Trash2 size={16} color="#991b1b" /></button>
                            )}
                         </div>
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
    <div className="glass-card animate-fade-in" style={{ padding: '40px', maxWidth: '800px' }}>
      <h3 style={{ marginBottom: '32px' }}>Strategic Onboarding</h3>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        <div style={{ gridColumn: 'span 2' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 'bold' }}>FULL LEGAL NAME</label>
          <input required type="text" placeholder="e.g., Jonathan Doe" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 'bold' }}>SYSTEM ID</label>
          <input required type="text" placeholder="EMP-1001" value={formData.employee_id} onChange={e => setFormData({...formData, employee_id: e.target.value})} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 'bold' }}>DEPARTMENT HEAD</label>
          <select value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}>
            <option>Engineering</option>
            <option>HR</option>
            <option>Sales</option>
            <option>Finance</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 'bold' }}>JOINING DATE</label>
          <input required type="date" value={formData.joining_date} onChange={e => setFormData({...formData, joining_date: e.target.value})} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 'bold' }}>MONTHLY COMPENSATION ($)</label>
          <input required type="number" value={formData.salary} onChange={e => setFormData({...formData, salary: parseFloat(e.target.value)})} />
        </div>
        <div style={{ gridColumn: 'span 2' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 'bold' }}>OFFICIAL EMAIL</label>
          <input required type="email" placeholder="john@company.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
        </div>
        <div style={{ gridColumn: 'span 2' }}>
           <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 'bold' }}>ID VERIFICATION (IDENTITY PROOF)</label>
           <div style={{ border: '2px dashed #eee', padding: '20px', borderRadius: '15px', textAlign: 'center', cursor: 'pointer' }}>
              <UploadCloud size={24} style={{ marginBottom: '8px', color: 'var(--text-muted)' }} />
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Click to upload JPG, PNG or PDF (Max 5MB)</div>
              <input type="file" style={{ display: 'none' }} />
           </div>
        </div>
        <div style={{ gridColumn: 'span 2', marginTop: '10px' }}>
          <button className="btn-primary" type="submit" disabled={loading} style={{ background: 'black', color: 'white' }}>
            {loading ? <Loader2 className="animate-spin" /> : 'Authorize Onboarding'}
          </button>
        </div>
      </form>
    </div>
  );
};

const PayrollSystem = ({ token, API }) => {
  const [month, setMonth] = useState('April 2026');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API}/payroll/generate?month=${month}`, {}, { headers: { Authorization: `Bearer ${token}` }});
      alert(res.data.message);
    } catch (err) {
      alert("Error generating payroll: " + (err.response?.data?.detail || "Connection failure"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card animate-fade-in" style={{ padding: '60px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ background: 'var(--primary)', width: '80px', height: '80px', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
         <CreditCard size={40} color="black" />
      </div>
      <h2>Strategic Payroll Engine</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '40px', lineHeight: '1.6' }}>Automatic consolidation and ledger posting for the current fiscal period.</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '400px', margin: '0 auto' }}>
        <div style={{ textAlign: 'left' }}>
           <label style={{ fontSize: '0.75rem', fontWeight: '800', marginBottom: '8px', display: 'block' }}>TARGET FISCAL PERIOD</label>
           <select value={month} onChange={e => setMonth(e.target.value)} style={{ width: '100%' }}>
              <option>April 2026</option>
              <option>May 2026</option>
              <option>June 2026</option>
           </select>
        </div>
        <div style={{ height: '1px', background: '#eee', margin: '10px 0' }}></div>
        <button className="btn-primary" onClick={handleGenerate} disabled={loading} style={{ background: 'black', color: 'white', padding: '18px' }}>
          {loading ? <Loader2 className="animate-spin" /> : 'Execute Payroll & Post to Ledger'}
        </button>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>⚡ This will automatically create an expense entry in Financials.</p>
      </div>
    </div>
  );
};

export default HRDashboard;
