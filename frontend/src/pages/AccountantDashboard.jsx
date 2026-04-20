import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  LogOut, 
  Wallet, 
  FileText, 
  PieChart, 
  Plus, 
  Users,
  Settings,
  ShieldCheck,
  TrendingUp,
  Receipt,
  Building2,
  Table,
  BarChart3,
  Loader2,
  Trash2
} from 'lucide-react';

const AccountantDashboard = ({ isAdminView = false }) => {
  const [activeTab, setActiveTab] = useState('transactions');
  const [activeSubTab, setActiveSubTab] = useState('journal');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ chart: [], txns: [], parties: [] });
  const [showForm, setShowForm] = useState(null); // 'account', 'party', 'transaction'
  
  const navigate = useNavigate();
  const API_BASE = 'http://localhost:8005/accounts';
  const token = localStorage.getItem('token');

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [chartRes, txnRes, partyRes] = await Promise.all([
        axios.get(`${API_BASE}/masters/chart`, { headers }),
        axios.get(`${API_BASE}/transactions`, { headers }),
        axios.get(`${API_BASE}/masters/parties`, { headers })
      ]);
      setData({ chart: chartRes.data, txns: txnRes.data, parties: partyRes.data });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [activeTab]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const TabButton = ({ value, label, icon: Icon }) => (
    <button 
      onClick={() => { setActiveTab(value); setShowForm(null); }}
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
            <div style={{ background: 'var(--primary)', padding: '8px', borderRadius: '8px' }}>
              <Wallet size={24} color="black" />
            </div>
            <h2 style={{ fontSize: '1.25rem' }}>FinanceHub</h2>
          </div>
          
          <div style={{ flex: 1 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '600', padding: '0 16px 12px' }}>LEDGERS</p>
            <TabButton value="transactions" label="Transactions" icon={Receipt} />
            <TabButton value="masters" label="Master Setup" icon={Building2} />
            <TabButton value="reports" label="Reports & GST" icon={BarChart3} />
          </div>

          <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', cursor: 'pointer', fontWeight: '600' }}>
            <LogOut size={20} /> Sign Out
          </button>
        </div>
      )}

      <div className={isAdminView ? "" : "main-content"}>
        {isAdminView && (
           <div style={{ display: 'flex', gap: '15px', marginBottom: '32px', borderBottom: '1px solid var(--border)', paddingBottom: '20px' }}>
              <button onClick={() => setActiveTab('transactions')} style={{ background: activeTab === 'transactions' ? 'var(--primary)' : 'transparent', color: 'black', border: 'none', padding: '10px 20px', borderRadius: '15px', cursor: 'pointer', fontWeight: '700' }}>Transactions</button>
              <button onClick={() => setActiveTab('masters')} style={{ background: activeTab === 'masters' ? 'var(--primary)' : 'transparent', color: 'black', border: 'none', padding: '10px 20px', borderRadius: '15px', cursor: 'pointer', fontWeight: '700' }}>Masters</button>
              <button onClick={() => setActiveTab('reports')} style={{ background: activeTab === 'reports' ? 'var(--primary)' : 'transparent', color: 'black', border: 'none', padding: '10px 20px', borderRadius: '15px', cursor: 'pointer', fontWeight: '700' }}>Reports</button>
           </div>
        )}

        <header style={{ marginBottom: '40px' }}>
          <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Control</h1>
          <p style={{ color: 'var(--text-muted)' }}>Financial ecosystem management and fiscal reporting.</p>
        </header>

        {/* --- Transactions View --- */}
        {activeTab === 'transactions' && (
          <div className="animate-fade-in">
            {showForm === 'txn' ? (
               <TransactionForm token={token} API={API_BASE} onCancel={() => setShowForm(null)} onSuccess={() => { setShowForm(null); fetchData(); }} accounts={data.chart} parties={data.parties} />
            ) : (
              <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', alignItems: 'center' }}>
                  <h3>Journal Ledger</h3>
                  <button onClick={() => setShowForm('txn')} className="btn-primary" style={{ width: 'auto', background: 'var(--primary)', color: 'black' }}>+ Post Entry</button>
                </div>
                <table style={{ width: '100%' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '12px' }}>Date</th>
                      <th style={{ padding: '12px' }}>Reference</th>
                      <th style={{ padding: '12px' }}>Description</th>
                      <th style={{ padding: '12px' }}>Type</th>
                      <th style={{ padding: '12px' }}>Amount</th>
                      <th style={{ padding: '12px' }}>GST</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.txns.map(t => (
                      <tr key={t._id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px' }}>{t.date}</td>
                        <td style={{ padding: '12px', fontWeight: '600' }}>{t.reference || '-'}</td>
                        <td style={{ padding: '12px' }}>{t.description}</td>
                        <td style={{ padding: '12px' }}>
                           <span className="badge" style={{ background: t.type === 'Debit' ? '#fee2e2' : '#dcfce7', color: t.type === 'Debit' ? '#991b1b' : '#166534' }}>{t.type}</span>
                        </td>
                        <td style={{ padding: '12px', fontWeight: 'bold' }}>${t.amount.toLocaleString()}</td>
                        <td style={{ padding: '12px', color: 'var(--text-muted)' }}>${t.gst_amount || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* --- Masters View --- */}
        {activeTab === 'masters' && (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
               <button onClick={() => setActiveSubTab('chart')} style={{ background: activeSubTab === 'chart' ? 'black' : 'white', color: activeSubTab === 'chart' ? 'white' : 'black', border: '1px solid black', padding: '8px 20px', borderRadius: '30px', cursor: 'pointer' }}>Chart of Accounts</button>
               <button onClick={() => setActiveSubTab('parties')} style={{ background: activeSubTab === 'parties' ? 'black' : 'white', color: activeSubTab === 'parties' ? 'white' : 'black', border: '1px solid black', padding: '8px 20px', borderRadius: '30px', cursor: 'pointer' }}>Customers & Vendors</button>
            </div>

            {activeSubTab === 'chart' && (
               <div className="glass-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <h3>Accounting Heads</h3>
                    <button onClick={() => setShowForm('account')} className="btn-primary" style={{ width: 'auto', background: 'var(--primary)', color: 'black' }}>+ New Head</button>
                  </div>
                  {showForm === 'account' ? (
                     <AccountForm token={token} API={API_BASE} onCancel={() => setShowForm(null)} onComplete={() => { setShowForm(null); fetchData(); }} />
                  ) : (
                    <table style={{ width: '100%' }}>
                      <thead><tr style={{ textAlign: 'left' }}><th style={{ padding: '12px' }}>Code</th><th style={{ padding: '12px' }}>Name</th><th style={{ padding: '12px' }}>Type</th><th style={{ padding: '12px' }}>Balance</th></tr></thead>
                      <tbody>
                        {data.chart.map(acc => (
                          <tr key={acc.code} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '12px', fontWeight: 'bold' }}>{acc.code}</td>
                            <td style={{ padding: '12px' }}>{acc.account_name}</td>
                            <td style={{ padding: '12px' }}>{acc.account_type}</td>
                            <td style={{ padding: '12px' }}>${acc.balance.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
               </div>
            )}

            {activeSubTab === 'parties' && (
               <div className="glass-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <h3>Stakeholder Directory</h3>
                    <button onClick={() => setShowForm('party')} className="btn-primary" style={{ width: 'auto', background: 'var(--primary)', color: 'black' }}>+ New Party</button>
                  </div>
                  {showForm === 'party' ? (
                     <PartyForm token={token} API={API_BASE} onCancel={() => setShowForm(null)} onComplete={() => { setShowForm(null); fetchData(); }} />
                  ) : (
                    <table style={{ width: '100%' }}>
                      <thead><tr style={{ textAlign: 'left' }}><th style={{ padding: '12px' }}>Name</th><th style={{ padding: '12px' }}>Type</th><th style={{ padding: '12px' }}>GSTIN</th><th style={{ padding: '12px' }}>Outstanding</th></tr></thead>
                      <tbody>
                        {data.parties.map(p => (
                          <tr key={p._id} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '12px', fontWeight: 'bold' }}>{p.name}</td>
                            <td style={{ padding: '12px' }}>{p.type}</td>
                            <td style={{ padding: '12px' }}>{p.gstin || 'N/A'}</td>
                            <td style={{ padding: '12px', color: p.outstanding > 0 ? '#ef4444' : '#10b981' }}>${p.outstanding.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
               </div>
            )}
          </div>
        )}

        {/* --- Reports View --- */}
        {activeTab === 'reports' && (
          <div className="animate-fade-in">
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                <div className="glass-card">
                   <h3 style={{ marginBottom: '20px' }}>Financial Health</h3>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: 'var(--bg-main)', borderRadius: '15px' }}>
                         <span>Total Assets</span>
                         <span style={{ fontWeight: 'bold' }}>${data.chart.filter(a => a.account_type === 'Asset').reduce((s, a) => s + a.balance, 0).toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: 'var(--bg-main)', borderRadius: '15px' }}>
                         <span>Total Liability</span>
                         <span style={{ fontWeight: 'bold' }}>${data.chart.filter(a => a.account_type === 'Liability').reduce((s, a) => s + a.balance, 0).toLocaleString()}</span>
                      </div>
                   </div>
                </div>
                <div className="glass-card">
                   <h3 style={{ marginBottom: '20px' }}>GST Intelligence</h3>
                   <p style={{ color: 'var(--text-muted)' }}>Input Tax Credit & Tax Collected Summary</p>
                   <div style={{ marginTop: '30px', fontSize: '2.5rem', fontWeight: '800', color: 'var(--primary)' }}>
                      ${data.txns.reduce((s, t) => s + (t.gst_amount || 0), 0).toLocaleString()}
                   </div>
                   <p style={{ fontSize: '0.8rem', marginTop: '10px' }}>Total GST liability for current quarter</p>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

const AccountForm = ({ token, API, onComplete, onCancel }) => {
  const [formData, setFormData] = useState({ account_name: '', account_type: 'Asset', code: '', balance: 0.0 });
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/masters/chart`, formData, { headers: { Authorization: `Bearer ${token}` }});
      onComplete();
    } catch (err) { alert("Error creating account"); }
  };

  return (
    <div style={{ maxWidth: '400px' }}>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Account Code" required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} style={{ marginBottom: '15px' }} />
        <input type="text" placeholder="Account Name" required value={formData.account_name} onChange={e => setFormData({...formData, account_name: e.target.value})} style={{ marginBottom: '15px' }} />
        <select value={formData.account_type} onChange={e => setFormData({...formData, account_type: e.target.value})} style={{ marginBottom: '15px' }}>
          <option>Asset</option><option>Liability</option><option>Income</option><option>Expense</option>
        </select>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" className="btn-primary" style={{ background: 'var(--primary)', color: 'black' }}>Save Head</button>
          <button type="button" onClick={onCancel} className="btn-primary" style={{ background: '#eee', color: 'black' }}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

const PartyForm = ({ token, API, onComplete, onCancel }) => {
  const [formData, setFormData] = useState({ name: '', type: 'Customer', gstin: '', email: '', phone: '', address: '' });
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/masters/parties`, formData, { headers: { Authorization: `Bearer ${token}` }});
      onComplete();
    } catch (err) { alert("Error creating party"); }
  };

  return (
    <div style={{ maxWidth: '400px' }}>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Party Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ marginBottom: '15px' }} />
        <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} style={{ marginBottom: '15px' }}>
          <option>Customer</option><option>Vendor</option>
        </select>
        <input type="text" placeholder="GSTIN" value={formData.gstin} onChange={e => setFormData({...formData, gstin: e.target.value})} style={{ marginBottom: '15px' }} />
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" className="btn-primary" style={{ background: 'var(--primary)', color: 'black' }}>Save Stakeholder</button>
          <button type="button" onClick={onCancel} className="btn-primary" style={{ background: '#eee', color: 'black' }}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

const TransactionForm = ({ token, API, onCancel, onSuccess, accounts, parties }) => {
  const [formData, setFormData] = useState({ 
    date: new Date().toISOString().split('T')[0], 
    description: '', 
    amount: 0, 
    type: 'Debit', 
    account_code: '', 
    party_id: '',
    reference: '',
    gst_amount: 0
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/transactions`, formData, { headers: { Authorization: `Bearer ${token}` }});
      onSuccess();
    } catch (err) { alert("Error posting entry"); }
  };

  return (
    <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h3 style={{ marginBottom: '24px' }}>Financial Voucher Entry</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
           <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>DATE</label>
              <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
           </div>
           <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>VOUCHER TYPE</label>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                 <option>Debit</option><option>Credit</option><option>Sales</option><option>Purchase</option><option>Receipt</option><option>Payment</option>
              </select>
           </div>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>ACCOUNT HEAD</label>
          <select required value={formData.account_code} onChange={e => setFormData({...formData, account_code: e.target.value})}>
             <option value="">Select Account...</option>
             {accounts.map(a => <option key={a.code} value={a.code}>{a.account_name} ({a.code})</option>)}
          </select>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>PARTY (CUSTOMER/VENDOR)</label>
          <select value={formData.party_id} onChange={e => setFormData({...formData, party_id: e.target.value})}>
             <option value="">N/A</option>
             {parties.map(p => <option key={p._id} value={p._id}>{p.name} ({p.type})</option>)}
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
           <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>TOTAL AMOUNT ($)</label>
              <input type="number" required value={formData.amount} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})} />
           </div>
           <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>TAX (GST) AMOUNT ($)</label>
              <input type="number" value={formData.gst_amount} onChange={e => setFormData({...formData, gst_amount: parseFloat(e.target.value)})} />
           </div>
        </div>
        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>DESCRIPTION / NARRATION</label>
          <input type="text" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button type="submit" className="btn-primary" style={{ flex: 1, background: 'var(--primary)', color: 'black' }}>Post Voucher</button>
          <button type="button" onClick={onCancel} className="btn-primary" style={{ flex: 1, background: '#eee', color: 'black' }}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default AccountantDashboard;
