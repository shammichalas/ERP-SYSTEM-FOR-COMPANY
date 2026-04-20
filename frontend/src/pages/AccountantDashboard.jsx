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
  const [data, setData] = useState({ chart: [], txns: [], parties: [], budgets: [] });
  const [showForm, setShowForm] = useState(null); // 'account', 'party', 'transaction', 'budget'
  
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
        axios.get(`${API_BASE}/masters/parties`, { headers }),
        axios.get(`${API_BASE}/reports/budget-comparison`, { headers })
      ]);
      setData({ chart: chartRes.data, txns: txnRes.data, parties: partyRes.data, budgets: budgetRes.data });
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
            <TabButton value="budgeting" label="Budgeting" icon={Table} />
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
              <button onClick={() => setActiveTab('budgeting')} style={{ background: activeTab === 'budgeting' ? 'var(--primary)' : 'transparent', color: 'black', border: 'none', padding: '10px 20px', borderRadius: '15px', cursor: 'pointer', fontWeight: '700' }}>Budgeting</button>
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

        {/* --- Budgeting View --- */}
        {activeTab === 'budgeting' && (
          <div className="animate-fade-in">
             {showForm === 'budget' ? (
                <BudgetForm token={token} API={API_BASE} onCancel={() => setShowForm(null)} onComplete={() => { setShowForm(null); fetchData(); }} />
             ) : (
                <div className="glass-card">
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
                      <h3>Performance vs. Allocation</h3>
                      <button onClick={() => setShowForm('budget')} className="btn-primary" style={{ width: 'auto', background: 'var(--primary)', color: 'black' }}>+ Set Budget</button>
                   </div>
                   <table style={{ width: '100%' }}>
                      <thead><tr style={{ textAlign: 'left' }}><th style={{ padding: '12px' }}>Department</th><th style={{ padding: '12px' }}>Category</th><th style={{ padding: '12px' }}>Budgeted</th><th style={{ padding: '12px' }}>Actual Spent</th><th style={{ padding: '12px' }}>Variance</th></tr></thead>
                      <tbody>
                        {data.budgets.map((b, i) => (
                           <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                              <td style={{ padding: '12px', fontWeight: 'bold' }}>{b.department}</td>
                              <td style={{ padding: '12px' }}>{b.category}</td>
                              <td style={{ padding: '12px' }}>${b.budgeted.toLocaleString()}</td>
                              <td style={{ padding: '12px', color: '#991b1b' }}>${b.actual.toLocaleString()}</td>
                              <td style={{ padding: '12px', color: b.variance < 0 ? '#ef4444' : '#10b981', fontWeight: 'bold' }}>
                                 {b.variance < 0 ? '-' : '+'}${Math.abs(b.variance).toLocaleString()}
                              </td>
                           </tr>
                        ))}
                      </tbody>
                   </table>
                </div>
             )}
          </div>
        )}

        {/* --- Reports View --- */}
        {activeTab === 'reports' && (
          <div className="animate-fade-in">
             <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', overflowX: 'auto', paddingBottom: '10px' }}>
                {['Trial Balance', 'Profit & Loss', 'GST Filings', 'HSN Summary'].map(r => (
                   <button key={r} onClick={() => setActiveSubTab(r)} style={{ background: activeSubTab === r ? 'black' : 'white', color: activeSubTab === r ? 'white' : 'black', border: '1px solid black', padding: '8px 20px', borderRadius: '30px', cursor: 'pointer', whiteSpace: 'nowrap' }}>{r}</button>
                ))}
             </div>

             {activeSubTab === 'Trial Balance' && (
                <div className="glass-card">
                   <h3>Trial Balance Report</h3>
                   <table style={{ width: '100%', marginTop: '20px' }}>
                      <thead><tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}><th style={{ padding: '12px' }}>Code</th><th style={{ padding: '12px' }}>Account Name</th><th style={{ padding: '12px' }}>Type</th><th style={{ padding: '12px' }}>Balance</th></tr></thead>
                      <tbody>
                         {data.chart.map(a => (
                            <tr key={a.code} style={{ borderBottom: '1px solid #eee' }}>
                               <td style={{ padding: '12px' }}>{a.code}</td>
                               <td style={{ padding: '12px' }}>{a.account_name}</td>
                               <td style={{ padding: '12px' }}>{a.account_type}</td>
                               <td style={{ padding: '12px' }}>${a.balance.toLocaleString()}</td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             )}

             {activeSubTab === 'Profit & Loss' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                   <div className="glass-card">
                      <h4 style={{ color: '#10b981' }}>REVENUE</h4>
                      <div style={{ marginTop: '20px' }}>
                         {data.chart.filter(a => a.account_type === 'Income').map(a => (
                            <div key={a.code} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}><span>{a.account_name}</span><span>${a.balance.toLocaleString()}</span></div>
                         ))}
                      </div>
                   </div>
                   <div className="glass-card">
                      <h4 style={{ color: '#ef4444' }}>EXPENSES</h4>
                      <div style={{ marginTop: '20px' }}>
                         {data.chart.filter(a => a.account_type === 'Expense').map(a => (
                            <div key={a.code} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}><span>{a.account_name}</span><span>${a.balance.toLocaleString()}</span></div>
                         ))}
                      </div>
                   </div>
                   <div className="glass-card" style={{ gridColumn: 'span 2', background: 'var(--secondary)', color: 'white' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <h3>Net Position</h3>
                         <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                            ${(data.chart.filter(a => a.account_type === 'Income').reduce((s, a) => s + a.balance, 0) - 
                               data.chart.filter(a => a.account_type === 'Expense').reduce((s, a) => s + a.balance, 0)).toLocaleString()}
                         </span>
                      </div>
                   </div>
                </div>
             )}

             {activeSubTab === 'GST Filings' && (
                <div className="glass-card">
                   <h3>Digital Tax Desk (GSTR-3B)</h3>
                   <div style={{ gridTemplateColumns: '1fr 1fr 1fr', display: 'grid', gap: '20px', marginTop: '30px' }}>
                      <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '15px' }}>
                         <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>Output GST</p>
                         <h2 style={{ color: '#ef4444' }}>${data.txns.filter(t => t.type === 'Sales').reduce((s, t) => s + (t.gst_amount || 0), 0).toLocaleString()}</h2>
                      </div>
                      <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '15px' }}>
                         <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>ITC Available</p>
                         <h2 style={{ color: '#10b981' }}>${data.txns.filter(t => t.type === 'Purchase' && t.itc_eligible).reduce((s, t) => s + (t.gst_amount || 0), 0).toLocaleString()}</h2>
                      </div>
                      <div style={{ padding: '20px', background: 'var(--primary)', borderRadius: '15px' }}>
                         <p style={{ fontSize: '0.8rem', color: 'black', opacity: 0.7 }}>Tax Payable</p>
                         <h2 style={{ color: 'black' }}>
                            ${Math.max(0, data.txns.filter(t => t.type === 'Sales').reduce((s, t) => s + (t.gst_amount || 0), 0) - 
                                         data.txns.filter(t => t.type === 'Purchase' && t.itc_eligible).reduce((s, t) => s + (t.gst_amount || 0), 0)).toLocaleString()}
                         </h2>
                      </div>
                   </div>
                </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

const BudgetForm = ({ token, API, onComplete, onCancel }) => {
  const [formData, setFormData] = useState({ department_name: '', amount: 0, period: 'April-2026', category: '' });
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/budgets`, formData, { headers: { Authorization: `Bearer ${token}` }});
      onComplete();
    } catch (err) { alert("Error setting budget"); }
  };

  return (
    <div className="glass-card" style={{ maxWidth: '500px', margin: '0 auto' }}>
      <h3 style={{ marginBottom: '24px' }}>Strategic Budget Allocation</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>DEPARTMENT NAME</label>
          <input type="text" placeholder="e.g., Engineering" required value={formData.department_name} onChange={e => setFormData({...formData, department_name: e.target.value})} />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>BUDGET CATEGORY (KEYWORD)</label>
          <input type="text" placeholder="e.g., Tech, Marketing" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
           <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>BUDGET AMOUNT ($)</label>
              <input type="number" required value={formData.amount} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})} />
           </div>
           <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>PERIOD (MM-YYYY)</label>
              <input type="text" value={formData.period} onChange={e => setFormData({...formData, period: e.target.value})} />
           </div>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button type="submit" className="btn-primary" style={{ flex: 1, background: 'var(--primary)', color: 'black' }}>Confirm Allocation</button>
          <button type="button" onClick={onCancel} className="btn-primary" style={{ flex: 1, background: '#eee', color: 'black' }}>Dismiss</button>
        </div>
      </form>
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
    gst_amount: 0,
    hsn_code: '',
    itc_eligible: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/transactions`, formData, { headers: { Authorization: `Bearer ${token}` }});
      onSuccess();
    } catch (err) { alert("Error posting entry"); }
  };

  return (
    <div className="glass-card" style={{ maxWidth: '700px', margin: '0 auto' }}>
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
                 <option>Debit</option><option>Credit</option><option>Sales</option><option>Purchase</option><option>Receipt</option><option>Payment</option><option>Credit Note</option><option>Debit Note</option>
              </select>
           </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
           <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>ACCOUNT HEAD</label>
              <select required value={formData.account_code} onChange={e => setFormData({...formData, account_code: e.target.value})}>
                <option value="">Select Account...</option>
                {accounts.map(a => <option key={a.code} value={a.code}>{a.account_name}</option>)}
              </select>
           </div>
           <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>HSN/SAC CODE</label>
              <input type="text" placeholder="e.g., 9983" value={formData.hsn_code} onChange={e => setFormData({...formData, hsn_code: e.target.value})} />
           </div>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>PARTY (CUSTOMER/VENDOR)</label>
          <select value={formData.party_id} onChange={e => setFormData({...formData, party_id: e.target.value})}>
             <option value="">N/A</option>
             {parties.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
           <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>BASE AMOUNT ($)</label>
              <input type="number" required value={formData.amount} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})} />
           </div>
           <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>TAX (GST) ($)</label>
              <input type="number" value={formData.gst_amount} onChange={e => setFormData({...formData, gst_amount: parseFloat(e.target.value)})} />
           </div>
        </div>
        {formData.type === 'Purchase' && (
           <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input type="checkbox" id="itc" checked={formData.itc_eligible} onChange={e => setFormData({...formData, itc_eligible: e.target.checked})} />
              <label htmlFor="itc" style={{ fontSize: '0.85rem' }}>Full ITC Eligible (Input Tax Credit)</label>
           </div>
        )}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>DESCRIPTIVE NARRATION</label>
          <input type="text" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button type="submit" className="btn-primary" style={{ flex: 1, background: 'var(--primary)', color: 'black' }}>Confirm Voucher</button>
          <button type="button" onClick={onCancel} className="btn-primary" style={{ flex: 1, background: '#eee', color: 'black' }}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default AccountantDashboard;
