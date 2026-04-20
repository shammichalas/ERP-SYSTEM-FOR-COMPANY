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
  Table,
  BarChart3,
  Loader2,
  Trash2,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  FileDown
} from 'lucide-react';

const exportToCSV = (data, fileName) => {
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

const AccountantDashboard = ({ isAdminView = false }) => {
  const [activeTab, setActiveTab] = useState('transactions');
  const [activeSubTab, setActiveSubTab] = useState('journal');
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [data, setData] = useState({ chart: [], txns: [], parties: [], budgets: [] });
  const [showForm, setShowForm] = useState(null); 
  
  const navigate = useNavigate();
  const API_BASE = 'http://localhost:8005/accounts';
  const token = localStorage.getItem('token');

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [chartRes, txnRes, partyRes, budgetRes] = await Promise.all([
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

  const filteredTxns = data.txns.filter(t => 
    t.description.toLowerCase().includes(search.toLowerCase()) || 
    t.account_code.toLowerCase().includes(search.toLowerCase()) ||
    (t.reference && t.reference.toLowerCase().includes(search.toLowerCase()))
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
             <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800', padding: '0 16px 12px', letterSpacing: '0.1em' }}>FISCAL OPS</p>
            <TabButton value="transactions" label="Journal Ledger" icon={Receipt} />
            <TabButton value="masters" label="Global Masters" icon={Building2} />
            <TabButton value="budgeting" label="Fiscal Budget" icon={Table} />
            <TabButton value="reports" label="Tax & Reports" icon={BarChart3} />
          </div>

          <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', cursor: 'pointer', fontWeight: '600' }}>
            <LogOut size={20} /> Sign Out
          </button>
        </div>
      )}

      <div className={isAdminView ? "" : "main-content"}>
        {isAdminView && (
           <div style={{ display: 'flex', gap: '15px', marginBottom: '32px', borderBottom: '1px solid var(--border)', paddingBottom: '20px' }}>
              <button onClick={() => setActiveTab('transactions')} style={{ background: activeTab === 'transactions' ? 'var(--primary)' : 'transparent', color: 'black', border: 'none', padding: '10px 20px', borderRadius: '15px', cursor: 'pointer', fontWeight: '700' }}>Vouchers</button>
              <button onClick={() => setActiveTab('masters')} style={{ background: activeTab === 'masters' ? 'var(--primary)' : 'transparent', color: 'black', border: 'none', padding: '10px 20px', borderRadius: '15px', cursor: 'pointer', fontWeight: '700' }}>Masters</button>
              <button onClick={() => setActiveTab('budgeting')} style={{ background: activeTab === 'budgeting' ? 'var(--primary)' : 'transparent', color: 'black', border: 'none', padding: '10px 20px', borderRadius: '15px', cursor: 'pointer', fontWeight: '700' }}>Budgeting</button>
              <button onClick={() => setActiveTab('reports')} style={{ background: activeTab === 'reports' ? 'var(--primary)' : 'transparent', color: 'black', border: 'none', padding: '10px 20px', borderRadius: '15px', cursor: 'pointer', fontWeight: '700' }}>Compliance</button>
           </div>
        )}

        <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
             <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Control</h1>
             <p style={{ color: 'var(--text-muted)' }}>Real-time fiscal intelligence and automated ledgering.</p>
          </div>
          {activeTab === 'transactions' && (
             <div className="search-box" style={{ width: '350px' }}>
                <Search size={18} color="var(--text-muted)" />
                <input type="text" placeholder="Search ledger by note, code, or ref..." value={search} onChange={e => setSearch(e.target.value)} style={{ border: 'none', background: 'transparent' }} />
             </div>
          )}
        </header>

        {/* --- Transactions View --- */}
        {activeTab === 'transactions' && (
          <div className="animate-fade-in">
            {showForm === 'txn' ? (
               <TransactionForm token={token} API={API_BASE} onCancel={() => setShowForm(null)} onSuccess={() => { setShowForm(null); fetchData(); }} accounts={data.chart} parties={data.parties} />
            ) : (
                <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
                   <div className="glass-card" style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', color: '#10b981', marginBottom: '10px' }}>
                         <ArrowDownLeft size={16} /> <span style={{ fontSize: '0.7rem', fontWeight: '800' }}>NET REVENUE</span>
                      </div>
                      <h3 style={{ margin: 0 }}>${data.chart.filter(a => a.account_type === 'Income').reduce((s, a) => s + a.balance, 0).toLocaleString()}</h3>
                   </div>
                   <div className="glass-card" style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', color: '#ef4444', marginBottom: '10px' }}>
                         <ArrowUpRight size={16} /> <span style={{ fontSize: '0.7rem', fontWeight: '800' }}>TOTAL EXPENSE</span>
                      </div>
                      <h3 style={{ margin: 0 }}>${data.chart.filter(a => a.account_type === 'Expense').reduce((s, a) => s + a.balance, 0).toLocaleString()}</h3>
                   </div>
                   <div className="glass-card" style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', color: 'black', marginBottom: '10px' }}>
                         <Receipt size={16} /> <span style={{ fontSize: '0.7rem', fontWeight: '800' }}>GST PAYABLE</span>
                      </div>
                      <h3 style={{ margin: 0 }}>${data.txns.filter(t => t.type === 'Sales').reduce((s, t) => s + (t.gst_amount || 0), 0).toLocaleString()}</h3>
                   </div>
                   <div className="glass-card" style={{ padding: '20px', background: 'black', color: 'white' }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', color: 'var(--primary)', marginBottom: '10px' }}>
                         <DollarSign size={16} /> <span style={{ fontSize: '0.7rem', fontWeight: '800' }}>OPERATING PROFIT</span>
                      </div>
                      <h3 style={{ margin: 0 }}>${(data.chart.filter(a => a.account_type === 'Income').reduce((s, a) => s + a.balance, 0) - data.chart.filter(a => a.account_type === 'Expense').reduce((s, a) => s + a.balance, 0)).toLocaleString()}</h3>
                   </div>
                </div>

              <div className="glass-card" style={{ padding: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', alignItems: 'center' }}>
                  <h3>Financial Audit Trail</h3>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => exportToCSV(filteredTxns, 'transactions_ledger')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#f8f9fa', border: '1px solid #eee', borderRadius: '15px', color: 'black', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer' }}>
                       <FileDown size={18} /> Export CSV
                    </button>
                    <button onClick={() => setShowForm('txn')} className="btn-primary" style={{ width: 'auto', background: 'var(--primary)', color: 'black', padding: '10px 24px' }}>+ New Voucher</button>
                  </div>
                </div>
                <table style={{ width: '100%' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '16px' }}>Timestamp</th>
                      <th style={{ padding: '16px' }}>Voucher Ref</th>
                      <th style={{ padding: '16px' }}>Description</th>
                      <th style={{ padding: '16px' }}>Classification</th>
                      <th style={{ padding: '16px', textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTxns.map(t => (
                      <tr key={t._id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t.date}</td>
                        <td style={{ padding: '16px', fontWeight: '800' }}>{t.reference || 'JV-AUTO'}</td>
                        <td style={{ padding: '16px' }}>
                           <div style={{ fontWeight: '600' }}>{t.description}</div>
                           <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Head: {t.account_code}</div>
                        </td>
                        <td style={{ padding: '16px' }}>
                           <span style={{ 
                              padding: '4px 12px', 
                              borderRadius: '20px', 
                              fontSize: '0.7rem', 
                              fontWeight: '900',
                              background: t.type === 'Debit' || t.type === 'Purchase' ? '#fee2e2' : '#dcfce7', 
                              color: t.type === 'Debit' || t.type === 'Purchase' ? '#991b1b' : '#166534' 
                           }}>{t.type.toUpperCase()}</span>
                        </td>
                        <td style={{ padding: '16px', textAlign: 'right', fontWeight: '900', fontSize: '1.1rem' }}>${t.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              </>
            )}
          </div>
        )}

        {/* --- Masters View --- */}
        {activeTab === 'masters' && (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
               {['chart', 'parties'].map(tab => (
                  <button key={tab} onClick={() => setActiveSubTab(tab)} style={{ background: activeSubTab === tab ? 'black' : 'white', color: activeSubTab === tab ? 'white' : 'black', border: '1px solid black', padding: '10px 24px', borderRadius: '30px', cursor: 'pointer', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.75rem' }}>{tab === 'chart' ? 'Account Heads' : 'Stakeholders'}</button>
               ))}
            </div>

            {activeSubTab === 'chart' && (
               <div className="glass-card" style={{ padding: '32px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
                    <h3>Chart of Accounts (COA)</h3>
                    <button onClick={() => setShowForm('account')} className="btn-primary" style={{ width: 'auto', background: 'var(--primary)', color: 'black' }}>+ New Head</button>
                  </div>
                  {showForm === 'account' ? (
                     <AccountForm token={token} API={API_BASE} onCancel={() => setShowForm(null)} onComplete={() => { setShowForm(null); fetchData(); }} />
                  ) : (
                    <table style={{ width: '100%' }}>
                      <thead><tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}><th style={{ padding: '16px' }}>System Code</th><th style={{ padding: '16px' }}>Account Name</th><th style={{ padding: '16px' }}>Classification</th><th style={{ padding: '16px', textAlign: 'right' }}>Balance</th></tr></thead>
                      <tbody>
                        {data.chart.map(acc => (
                          <tr key={acc.code} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '16px', fontWeight: '800', color: 'var(--text-muted)' }}>{acc.code}</td>
                            <td style={{ padding: '16px', fontWeight: '700' }}>{acc.account_name}</td>
                            <td style={{ padding: '16px' }}>
                               <span className="badge" style={{ background: '#f5f5f5' }}>{acc.account_type}</span>
                            </td>
                            <td style={{ padding: '16px', textAlign: 'right', fontWeight: '800' }}>${acc.balance.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
               </div>
            )}

            {activeSubTab === 'parties' && (
               <div className="glass-card" style={{ padding: '32px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
                    <h3>Stakeholder Directory</h3>
                    <button onClick={() => setShowForm('party')} className="btn-primary" style={{ width: 'auto', background: 'var(--primary)', color: 'black' }}>+ New Party</button>
                  </div>
                  {showForm === 'party' ? (
                     <PartyForm token={token} API={API_BASE} onCancel={() => setShowForm(null)} onComplete={() => { setShowForm(null); fetchData(); }} />
                  ) : (
                    <table style={{ width: '100%' }}>
                      <thead><tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}><th style={{ padding: '16px' }}>Legal Name</th><th style={{ padding: '16px' }}>Business Type</th><th style={{ padding: '16px' }}>GSTIN Identifier</th><th style={{ padding: '16px', textAlign: 'right' }}>Outstanding Balance</th></tr></thead>
                      <tbody>
                        {data.parties.map(p => (
                          <tr key={p._id} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '16px', fontWeight: '800' }}>{p.name}</td>
                            <td style={{ padding: '16px' }}>
                               <span className="badge" style={{ background: p.type === 'Vendor' ? '#000' : 'var(--primary)', color: p.type === 'Vendor' ? 'white' : 'black' }}>{p.type.toUpperCase()}</span>
                            </td>
                            <td style={{ padding: '16px', fontFamily: 'monospace' }}>{p.gstin || 'NOT-REGISTERED'}</td>
                            <td style={{ padding: '16px', textAlign: 'right', color: p.outstanding > 0 ? '#ef4444' : '#10b981', fontWeight: '900' }}>${p.outstanding.toLocaleString()}</td>
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
                <div className="glass-card" style={{ padding: '32px' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
                      <h3>Fiscal Performance Control</h3>
                      <button onClick={() => setShowForm('budget')} className="btn-primary" style={{ width: 'auto', background: 'var(--primary)', color: 'black' }}>+ Define Budget</button>
                   </div>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                     {data.budgets.map((b, i) => {
                       const usage = (b.actual / b.budgeted) * 100;
                       return (
                        <div key={i} style={{ padding: '24px', border: '1px solid #f0f0f0', borderRadius: '20px' }}>
                           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                              <div>
                                 <div style={{ fontWeight: '800', fontSize: '1.1rem' }}>{b.category.toUpperCase()}</div>
                                 <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{b.department}</div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                 <div style={{ fontWeight: '900', color: b.variance < 0 ? '#ef4444' : '#10b981' }}>{b.variance < 0 ? '-' : '+'}${Math.abs(b.variance).toLocaleString()}</div>
                                 <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>VARIANCE</div>
                              </div>
                           </div>
                           <div style={{ height: '8px', background: '#f5f5f5', borderRadius: '4px', overflow: 'hidden', marginBottom: '15px' }}>
                              <div style={{ width: `${Math.min(usage, 100)}%`, height: '100%', background: usage > 90 ? '#ef4444' : 'black', borderRadius: '4px', transition: '1s ease' }}></div>
                           </div>
                           <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                              <span style={{ color: 'var(--text-muted)' }}>Spent: <b style={{ color: 'black' }}>${b.actual.toLocaleString()}</b></span>
                              <span style={{ color: 'var(--text-muted)' }}>Budget: <b style={{ color: 'black' }}>${b.budgeted.toLocaleString()}</b></span>
                           </div>
                        </div>
                       )
                     })}
                   </div>
                </div>
             )}
          </div>
        )}

        {/* --- Reports View --- */}
        {activeTab === 'reports' && (
          <div className="animate-fade-in">
             <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', overflowX: 'auto', paddingBottom: '10px' }}>
                {['Trial Balance', 'Profit & Loss', 'GST Filings', 'HSN Summary'].map(r => (
                   <button key={r} onClick={() => setActiveSubTab(r)} style={{ background: activeSubTab === r ? 'black' : 'white', color: activeSubTab === r ? 'white' : 'black', border: '1px solid black', padding: '10px 24px', borderRadius: '30px', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: '800', fontSize: '0.75rem' }}>{r.toUpperCase()}</button>
                ))}
             </div>

             {activeSubTab === 'Trial Balance' && (
                <div className="glass-card" style={{ padding: '32px' }}>
                   <h3>Financial Trial Balance</h3>
                   <table style={{ width: '100%', marginTop: '30px' }}>
                      <thead><tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}><th style={{ padding: '16px' }}>Account Code</th><th style={{ padding: '16px' }}>Description</th><th style={{ padding: '16px' }}>Type</th><th style={{ padding: '16px', textAlign: 'right' }}>System Balance</th></tr></thead>
                      <tbody>
                         {data.chart.map(a => (
                            <tr key={a.code} style={{ borderBottom: '1px solid #eee' }}>
                               <td style={{ padding: '16px', fontWeight: '800' }}>{a.code}</td>
                               <td style={{ padding: '16px', fontWeight: '600' }}>{a.account_name}</td>
                               <td style={{ padding: '16px' }}><span className="badge">{a.account_type}</span></td>
                               <td style={{ padding: '16px', textAlign: 'right', fontWeight: '900' }}>${a.balance.toLocaleString()}</td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             )}

             {activeSubTab === 'Profit & Loss' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                   <div className="glass-card" style={{ padding: '32px' }}>
                      <h4 style={{ color: '#10b981', marginBottom: '24px', letterSpacing: '1px' }}>REVENUE STREAMS</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                         {data.chart.filter(a => a.account_type === 'Income').map(a => (
                            <div key={a.code} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: '#fcfcfc', borderRadius: '15px', border: '1px solid #f0f0f0' }}>
                               <span style={{ fontWeight: '600' }}>{a.account_name}</span>
                               <span style={{ fontWeight: '800' }}>${a.balance.toLocaleString()}</span>
                            </div>
                         ))}
                      </div>
                   </div>
                   <div className="glass-card" style={{ padding: '32px' }}>
                      <h4 style={{ color: '#ef4444', marginBottom: '24px', letterSpacing: '1px' }}>OPERATIONAL EXPENSES</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                         {data.chart.filter(a => a.account_type === 'Expense').map(a => (
                            <div key={a.code} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: '#fcfcfc', borderRadius: '15px', border: '1px solid #f0f0f0' }}>
                               <span style={{ fontWeight: '600' }}>{a.account_name}</span>
                               <span style={{ fontWeight: '800' }}>${a.balance.toLocaleString()}</span>
                            </div>
                         ))}
                      </div>
                   </div>
                   <div className="glass-card" style={{ gridColumn: 'span 2', background: 'black', color: 'white', padding: '40px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <div>
                            <h3 style={{ margin: 0 }}>Net Fiscal Position</h3>
                            <p style={{ opacity: 0.6, fontSize: '0.8rem', marginTop: '5px' }}>Total consolidated profit/loss for current period</p>
                         </div>
                         <span style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--primary)' }}>
                            ${(data.chart.filter(a => a.account_type === 'Income').reduce((s, a) => s + a.balance, 0) - 
                               data.chart.filter(a => a.account_type === 'Expense').reduce((s, a) => s + a.balance, 0)).toLocaleString()}
                         </span>
                      </div>
                   </div>
                </div>
             )}

             {activeSubTab === 'GST Filings' && (
                <div className="glass-card" style={{ padding: '32px' }}>
                   <h3>Digital Tax Desk (GSTR-3B)</h3>
                   <div style={{ gridTemplateColumns: '1fr 1fr 1fr', display: 'grid', gap: '25px', marginTop: '40px' }}>
                      <div style={{ padding: '30px', background: '#fcfcfc', borderRadius: '24px', border: '1px solid #eee' }}>
                         <p style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)' }}>OUTPUT TAX (TAX COLLECTED)</p>
                         <h2 style={{ color: '#ef4444', fontSize: '2rem', marginTop: '10px' }}>${data.txns.filter(t => t.type === 'Sales').reduce((s, t) => s + (t.gst_amount || 0), 0).toLocaleString()}</h2>
                      </div>
                      <div style={{ padding: '30px', background: '#fcfcfc', borderRadius: '24px', border: '1px solid #eee' }}>
                         <p style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)' }}>INPUT TAX CREDIT (CLAIMABLE)</p>
                         <h2 style={{ color: '#10b981', fontSize: '2rem', marginTop: '10px' }}>${data.txns.filter(t => (t.type === 'Purchase' || t.type === 'Debit Note') && t.itc_eligible).reduce((s, t) => s + (t.gst_amount || 0), 0).toLocaleString()}</h2>
                      </div>
                      <div style={{ padding: '30px', background: 'var(--primary)', borderRadius: '24px' }}>
                         <p style={{ fontSize: '0.75rem', fontWeight: '800', color: 'black' }}>NET PAYABLE TO GOVT</p>
                         <h2 style={{ color: 'black', fontSize: '2.5rem', marginTop: '10px' }}>
                            ${Math.max(0, data.txns.filter(t => t.type === 'Sales').reduce((s, t) => s + (t.gst_amount || 0), 0) - 
                                         data.txns.filter(t => (t.type === 'Purchase' || t.type === 'Debit Note') && t.itc_eligible).reduce((s, t) => s + (t.gst_amount || 0), 0)).toLocaleString()}
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
    <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto', padding: '40px' }}>
      <h3 style={{ marginBottom: '32px' }}>Strategic Budget Allocation</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: '800', display: 'block', marginBottom: '8px' }}>TARGET DEPARTMENT</label>
          <input type="text" placeholder="e.g., Engineering" required value={formData.department_name} onChange={e => setFormData({...formData, department_name: e.target.value})} />
        </div>
        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: '800', display: 'block', marginBottom: '8px' }}>EXPENSE CATEGORY (FOR AUTO-INTEGRATION)</label>
          <input type="text" placeholder="e.g., Cloud, Hiring, Office" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
           <div>
              <label style={{ fontSize: '0.75rem', fontWeight: '800', display: 'block', marginBottom: '8px' }}>BUDGET CEILING ($)</label>
              <input type="number" required value={formData.amount} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})} />
           </div>
           <div>
              <label style={{ fontSize: '0.75rem', fontWeight: '800', display: 'block', marginBottom: '8px' }}>PERIOD Identifier</label>
              <input type="text" value={formData.period} onChange={e => setFormData({...formData, period: e.target.value})} />
           </div>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button type="submit" className="btn-primary" style={{ flex: 1, background: 'black', color: 'white', padding: '16px' }}>Authorize Budget</button>
          <button type="button" onClick={onCancel} className="btn-primary" style={{ flex: 1, background: '#eee', color: 'black', padding: '16px' }}>Dismiss</button>
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
    <div style={{ maxWidth: '500px', padding: '30px', border: '1px solid #eee', borderRadius: '20px' }}>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontSize: '0.7rem', fontWeight: '800', display: 'block', marginBottom: '5px' }}>UNIQUE HEAD CODE</label>
          <input type="text" placeholder="e.g., ASST-Bnk-01" required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontSize: '0.7rem', fontWeight: '800', display: 'block', marginBottom: '5px' }}>ACCOUNT NAME</label>
          <input type="text" placeholder="e.g., Corporate Bank Account" required value={formData.account_name} onChange={e => setFormData({...formData, account_name: e.target.value})} />
        </div>
        <div style={{ marginBottom: '25px' }}>
          <label style={{ fontSize: '0.7rem', fontWeight: '800', display: 'block', marginBottom: '5px' }}>BALANCE SHEET CATEGORY</label>
          <select value={formData.account_type} onChange={e => setFormData({...formData, account_type: e.target.value})}>
            <option>Asset</option><option>Liability</option><option>Income</option><option>Expense</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" className="btn-primary" style={{ background: 'black', color: 'white', flex: 1 }}>Save Master Head</button>
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
    <div style={{ maxWidth: '500px', padding: '30px', border: '1px solid #eee', borderRadius: '20px' }}>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontSize: '0.7rem', fontWeight: '800', display: 'block', marginBottom: '5px' }}>STAKEHOLDER LEGAL NAME</label>
          <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontSize: '0.7rem', fontWeight: '800', display: 'block', marginBottom: '5px' }}>BUSINESS RELATIONSHIP</label>
          <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
            <option>Customer</option><option>Vendor</option>
          </select>
        </div>
        <div style={{ marginBottom: '25px' }}>
          <label style={{ fontSize: '0.7rem', fontWeight: '800', display: 'block', marginBottom: '5px' }}>GSTIN IDENTIFIER</label>
          <input type="text" placeholder="22AAAAA0000A1Z5" value={formData.gstin} onChange={e => setFormData({...formData, gstin: e.target.value})} />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" className="btn-primary" style={{ background: 'black', color: 'white', flex: 1 }}>Register Stakeholder</button>
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
    } catch (err) { alert("Error posting entry: " + (err.response?.data?.detail || "Network issue")); }
  };

  return (
    <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto', padding: '40px' }}>
      <h3 style={{ marginBottom: '32px' }}>Strategic Voucher Entry</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '24px' }}>
           <div>
              <label style={{ fontSize: '0.75rem', fontWeight: '800', display: 'block', marginBottom: '8px' }}>VOUCHER DATE</label>
              <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
           </div>
           <div>
              <label style={{ fontSize: '0.75rem', fontWeight: '800', display: 'block', marginBottom: '8px' }}>PROTOCOL TYPE</label>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                 <option>Debit</option><option>Credit</option><option>Sales</option><option>Purchase</option><option>Receipt</option><option>Payment</option><option>Credit Note</option><option>Debit Note</option>
              </select>
           </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px', marginBottom: '24px' }}>
           <div>
              <label style={{ fontSize: '0.75rem', fontWeight: '800', display: 'block', marginBottom: '8px' }}>LEDGER ACCOUNT HEAD</label>
              <select required value={formData.account_code} onChange={e => setFormData({...formData, account_code: e.target.value})}>
                <option value="">Select Ledger Head...</option>
                {accounts.map(a => <option key={a.code} value={a.code}>{a.account_name} ({a.code})</option>)}
              </select>
           </div>
           <div>
              <label style={{ fontSize: '0.75rem', fontWeight: '800', display: 'block', marginBottom: '8px' }}>HSN / SAC IDENTIFIER</label>
              <input type="text" placeholder="e.g., 998313" value={formData.hsn_code} onChange={e => setFormData({...formData, hsn_code: e.target.value})} />
           </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '24px' }}>
           <div>
             <label style={{ fontSize: '0.75rem', fontWeight: '800', display: 'block', marginBottom: '8px' }}>STAKEHOLDER (OPTIONAL)</label>
             <select value={formData.party_id} onChange={e => setFormData({...formData, party_id: e.target.value})}>
                <option value="">NON-STAKEHOLDER ENTRY</option>
                {parties.map(p => <option key={p._id} value={p._id}>{p.name} ({p.type})</option>)}
             </select>
           </div>
           <div>
              <label style={{ fontSize: '0.75rem', fontWeight: '800', display: 'block', marginBottom: '8px' }}>INTERNAL REFERENCE #</label>
              <input type="text" placeholder="INV/2026/001" value={formData.reference} onChange={e => setFormData({...formData, reference: e.target.value})} />
           </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '24px' }}>
           <div>
              <label style={{ fontSize: '0.75rem', fontWeight: '800', display: 'block', marginBottom: '8px' }}>BASE TAXABLE AMOUNT ($)</label>
              <input type="number" required value={formData.amount} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})} />
           </div>
           <div>
              <label style={{ fontSize: '0.75rem', fontWeight: '800', display: 'block', marginBottom: '8px' }}>CONSOLIDATED GST ($)</label>
              <input type="number" value={formData.gst_amount} onChange={e => setFormData({...formData, gst_amount: parseFloat(e.target.value)})} />
           </div>
        </div>
        {(formData.type === 'Purchase' || formData.type === 'Debit Note') && (
           <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', background: '#fcfcfc', padding: '15px', borderRadius: '15px', border: '1px solid #eee' }}>
              <input type="checkbox" id="itc_box" checked={formData.itc_eligible} onChange={e => setFormData({...formData, itc_eligible: e.target.checked})} style={{ width: '20px', height: '20px' }} />
              <label htmlFor="itc_box" style={{ fontSize: '0.85rem', cursor: 'pointer', fontWeight: '600' }}>Confirm Eligibility for Input Tax Credit (ITC)</label>
           </div>
        )}
        <div style={{ marginBottom: '40px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: '800', display: 'block', marginBottom: '8px' }}>AUDIT NARRATION (DESCRIPTION)</label>
          <input type="text" required placeholder="Detailed reason for this financial movement..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <button type="submit" className="btn-primary" style={{ flex: 1, background: 'black', color: 'white', padding: '18px' }}>Authorize Voucher</button>
          <button type="button" onClick={onCancel} className="btn-primary" style={{ flex: 1, background: '#eee', color: 'black', padding: '18px' }}>Discard</button>
        </div>
      </form>
    </div>
  );
};

export default AccountantDashboard;
