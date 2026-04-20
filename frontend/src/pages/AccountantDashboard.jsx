import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  LogOut, 
  Wallet, 
  FileText, 
  PieChart, 
  Plus, 
  DollarSign, 
  FileSpreadsheet,
  ArrowUpRight,
  ArrowDownLeft,
  Loader2
} from 'lucide-react';

const AccountantDashboard = ({ isAdminView = false }) => {
  const [activeTab, setActiveTab] = useState('transactions');
  const [chart, setChart] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_BASE = 'http://localhost:8005/accounts';
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (activeTab === 'masters') fetchChart();
  }, [activeTab]);

  const fetchChart = async () => {
    try {
      const res = await axios.get(`${API_BASE}/masters/chart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChart(res.data);
    } catch (err) { console.error(err); }
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
            <div style={{ background: '#f59e0b', padding: '8px', borderRadius: '8px' }}>
              <Wallet size={24} color="white" />
            </div>
            <h2 style={{ fontSize: '1.25rem' }}>Accountant</h2>
          </div>
          
          <div style={{ flex: 1 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '600', padding: '0 16px 12px', letterSpacing: '0.05em' }}>LEDGER</p>
            <TabButton value="transactions" label="Transactions" icon={FileText} />
            <TabButton value="masters" label="Masters / Chart" icon={FileSpreadsheet} />
            <TabButton value="gst" label="GST & Taxation" icon={PieChart} />
          </div>

          <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', cursor: 'pointer', fontWeight: '500' }}>
            <LogOut size={20} /> Sign Out
          </button>
        </div>
      )}

      <div className={isAdminView ? "" : "main-content"}>
        {isAdminView && (
           <div style={{ display: 'flex', gap: '15px', marginBottom: '32px', borderBottom: '1px solid var(--border)', paddingBottom: '20px' }}>
              <button onClick={() => setActiveTab('transactions')} style={{ background: activeTab === 'transactions' ? 'var(--primary)' : 'transparent', color: 'black', border: 'none', padding: '10px 20px', borderRadius: '15px', cursor: 'pointer', fontWeight: '700' }}>Transactions</button>
              <button onClick={() => setActiveTab('masters')} style={{ background: activeTab === 'masters' ? 'var(--primary)' : 'transparent', color: 'black', border: 'none', padding: '10px 20px', borderRadius: '15px', cursor: 'pointer', fontWeight: '700' }}>Masters</button>
              <button onClick={() => setActiveTab('gst')} style={{ background: activeTab === 'gst' ? 'var(--primary)' : 'transparent', color: 'black', border: 'none', padding: '10px 20px', borderRadius: '15px', cursor: 'pointer', fontWeight: '700' }}>GST</button>
           </div>
        )}
        <header style={{ marginBottom: '40px' }}>
          <h1>Accounting Module</h1>
          <p style={{ color: 'var(--text-muted)' }}>Real-time financial tracking and reporting.</p>
        </header>

        {activeTab === 'transactions' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px' }}>
            <div className="glass-card animate-fade-in" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h3>Recent Journal Entries</h3>
                <button style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Export List</button>
              </div>
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                 <p>No recent transactions recorded today.</p>
              </div>
            </div>
            <TransactionForm token={token} API={API_BASE} />
          </div>
        )}

        {activeTab === 'masters' && (
          <div className="glass-card animate-fade-in" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
               <h3>Chart of Accounts</h3>
               <button className="btn-primary" style={{ width: 'auto', background: '#f59e0b' }}>+ New Account</button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                  <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Code</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Account Name</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Type</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Current Balance</th>
                </tr>
              </thead>
              <tbody>
                {chart.map(acc => (
                  <tr key={acc.code} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{acc.code}</td>
                    <td style={{ padding: '12px' }}>{acc.account_name}</td>
                    <td style={{ padding: '12px' }}>{acc.account_type}</td>
                    <td style={{ padding: '12px', color: acc.balance < 0 ? '#ef4444' : '#10b981' }}>${acc.balance.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const TransactionForm = ({ token, API }) => {
  const [formData, setFormData] = useState({ date: new Date().toISOString().split('T')[0], description: '', amount: 0, type: 'Debit', account_code: '' });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/transactions`, formData, { headers: { Authorization: `Bearer ${token}` }});
      alert("Transaction saved!");
    } catch (err) { alert("Error saving transaction"); }
  };

  return (
    <div className="glass-card animate-fade-in" style={{ padding: '24px' }}>
       <h3 style={{ marginBottom: '20px' }}>Post Entry</h3>
       <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Description</label>
            <input type="text" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Type</label>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                <option>Debit</option>
                <option>Credit</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Amount</label>
              <input type="number" required value={formData.amount} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})} />
            </div>
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Account Code</label>
            <input type="text" placeholder="e.g. EXP-OP-001" required value={formData.account_code} onChange={e => setFormData({...formData, account_code: e.target.value})} />
          </div>
          <button className="btn-primary" style={{ background: '#f59e0b' }}>Post Transaction</button>
       </form>
    </div>
  );
};

export default AccountantDashboard;
