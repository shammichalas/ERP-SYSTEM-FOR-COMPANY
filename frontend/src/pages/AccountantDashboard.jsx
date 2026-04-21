import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart as RePieChart, Pie, Legend, RadialBarChart, RadialBar
} from 'recharts';
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
  Trash2,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  FileDown,
  Edit,
  CheckCircle2
} from 'lucide-react';

const exportToCSV = (data, fileName) => {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        let val = row[header] === null || row[header] === undefined ? '' : row[header];
        val = String(val).replace(/"/g, '""'); // Escape double quotes
        return `"${val}"`; // Wrap in double quotes for cleanliness
      }).join(',')
    )
  ];
  const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + csvRows.join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${fileName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const AccountantDashboard = ({ isAdminView = false }) => {
  const [activeTab, setActiveTab] = useState('transactions');
  const [activeSubTab, setActiveSubTab] = useState('journal');
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [data, setData] = useState({ chart: [], txns: [], parties: [], budgets: [] });
  const [showForm, setShowForm] = useState(null); 
  const [editData, setEditData] = useState(null); 
  
  const navigate = useNavigate();
  const API_BASE = 'http://localhost:8005/accounts';
  const token = localStorage.getItem('token');

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [chartRes, txnRes, partyRes, budgetRes, trialRes, gstRes, hsnRes] = await Promise.all([
        axios.get(`${API_BASE}/masters/chart`, { headers }),
        axios.get(`${API_BASE}/transactions`, { headers }),
        axios.get(`${API_BASE}/masters/parties`, { headers }),
        axios.get(`${API_BASE}/reports/budget-comparison`, { headers }),
        axios.get(`${API_BASE}/reports/trial-balance`, { headers }),
        axios.get(`${API_BASE}/reports/gst-filings`, { headers }),
        axios.get(`${API_BASE}/reports/hsn-summary`, { headers })
      ]);
      setData({ 
        chart: chartRes.data, 
        txns: txnRes.data, 
        parties: partyRes.data, 
        budgets: budgetRes.data,
        trialBalance: trialRes.data,
        gst: gstRes.data,
        hsn: hsnRes.data
      });
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

  const filteredTxns = data.txns.filter(t => {
    const searchLower = search.toLowerCase();
    const matchesDescription = t.description.toLowerCase().includes(searchLower);
    const matchesRef = t.reference && t.reference.toLowerCase().includes(searchLower);
    const matchesCode = t.account_code ? t.account_code.toLowerCase().includes(searchLower) : false;
    const matchesEntries = t.entries ? t.entries.some(e => e.account_code.toLowerCase().includes(searchLower)) : false;
    
    return matchesDescription || matchesRef || matchesCode || matchesEntries;
  });

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
               <TransactionForm token={token} API={API_BASE} onCancel={() => { setShowForm(null); setEditData(null); }} onSuccess={() => { setShowForm(null); setEditData(null); fetchData(); }} accounts={data.chart} parties={data.parties} existingData={editData} />
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
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', color: '#3b82f6', marginBottom: '10px' }}>
                         <Receipt size={16} /> <span style={{ fontSize: '0.7rem', fontWeight: '800' }}>GST PAYABLE</span>
                      </div>
                      <h3 style={{ margin: 0 }}>
                        ${data.txns.filter(t => t.journal_type === 'Sales' || t.type === 'Sales')
                           .reduce((s, t) => s + (t.gst_amount || 0) + (t.cgst_amount || 0) + (t.sgst_amount || 0) + (t.igst_amount || 0), 0).toLocaleString()}
                      </h3>
                   </div>
                   <div className="glass-card" style={{ padding: '20px', background: 'black', color: 'white' }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', color: 'var(--primary)', marginBottom: '10px' }}>
                         <DollarSign size={16} /> <span style={{ fontSize: '0.7rem', fontWeight: '800' }}>OPERATING PROFIT</span>
                      </div>
                      <h3 style={{ margin: 0 }}>${(data.chart.filter(a => a.account_type === 'Income').reduce((s, a) => s + a.balance, 0) - data.chart.filter(a => a.account_type === 'Expense').reduce((s, a) => s + a.balance, 0)).toLocaleString()}</h3>
                   </div>
                </div>

                {/* --- Analytics Section --- */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', marginBottom: '30px' }}>
                   <div className="glass-card" style={{ padding: '32px' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                       <h3 style={{ margin: 0 }}>Fiscal Flow Overview</h3>
                       <div style={{ display: 'flex', gap: '12px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                         <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: 10, height: 10, background: '#10b981', borderRadius: '2px' }}></div> INCOME</span>
                         <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: 10, height: 10, background: '#ef4444', borderRadius: '2px' }}></div> EXPENSE</span>
                       </div>
                     </div>
                     <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[
                            { name: 'Direct Revenue', income: data.chart.filter(a => a.account_type === 'Income').reduce((s, a) => s + a.balance, 0), expense: 0 },
                            { name: 'Operating Costs', income: 0, expense: data.chart.filter(a => a.account_type === 'Expense').reduce((s, a) => s + a.balance, 0) },
                            { name: 'Net Position', income: Math.max(0, (data.chart.filter(a => a.account_type === 'Income').reduce((s, a) => s + a.balance, 0) - data.chart.filter(a => a.account_type === 'Expense').reduce((s, a) => s + a.balance, 0))), expense: Math.abs(Math.min(0, (data.chart.filter(a => a.account_type === 'Income').reduce((s, a) => s + a.balance, 0) - data.chart.filter(a => a.account_type === 'Expense').reduce((s, a) => s + a.balance, 0)))) }
                          ]}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                            <Tooltip 
                              cursor={{ fill: 'transparent' }} 
                              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                            />
                            <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                            <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={40} />
                          </BarChart>
                        </ResponsiveContainer>
                     </div>
                   </div>

                   <div className="glass-card" style={{ padding: '32px' }}>
                      <h3 style={{ marginBottom: '24px' }}>Asset Allocation</h3>
                      <div style={{ height: '240px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <RePieChart>
                            <Pie
                              data={data.chart.filter(a => a.account_type === 'Asset').slice(0, 5).map(a => ({ name: a.account_name, value: a.balance }))}
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'].map((color, index) => (
                                <Cell key={`cell-${index}`} fill={color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </RePieChart>
                        </ResponsiveContainer>
                      </div>
                      <div style={{ marginTop: '20px' }}>
                         {data.chart.filter(a => a.account_type === 'Asset').slice(0, 3).map((a, i) => (
                           <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '8px' }}>
                              <span style={{ color: 'var(--text-muted)' }}>{a.account_name}</span>
                              <span style={{ fontWeight: '700' }}>${a.balance.toLocaleString()}</span>
                           </div>
                         ))}
                      </div>
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
                      <th style={{ padding: '16px', width: '50px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTxns.map(t => {
                      const isDoubleEntry = t.entries && t.entries.length > 0;
                      const amount = isDoubleEntry 
                        ? t.entries.filter(e => e.type === 'Debit').reduce((s, e) => s + (parseFloat(e.amount) || 0), 0)
                        : (t.amount || 0);

                      return (
                        <tr key={t._id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t.date}</td>
                          <td style={{ padding: '16px', fontWeight: '800' }}>{t.reference || 'JV-AUTO'}</td>
                          <td style={{ padding: '16px' }}>
                             <div style={{ fontWeight: '600' }}>{t.description}</div>
                             <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                               {isDoubleEntry 
                                 ? `Debits: ${t.entries.filter(e => e.type === 'Debit').map(e => e.account_code).join(', ')}`
                                 : `Head: ${t.account_code}`}
                             </div>
                          </td>
                          <td style={{ padding: '16px' }}>
                             <span style={{ 
                                padding: '4px 12px', 
                                borderRadius: '20px', 
                                fontSize: '0.7rem', 
                                fontWeight: '900',
                                background: (t.entries ? t.journal_type === 'Purchase' : (t.type === 'Debit' || t.type === 'Purchase')) ? '#fee2e2' : '#dcfce7', 
                                color: (t.entries ? t.journal_type === 'Purchase' : (t.type === 'Debit' || t.type === 'Purchase')) ? '#991b1b' : '#166534' 
                             }}>{(t.journal_type || t.type).toUpperCase()}</span>
                          </td>
                          <td style={{ padding: '16px', textAlign: 'right', fontWeight: '900', fontSize: '1.1rem' }}>${amount.toLocaleString()}</td>
                          <td style={{ padding: '16px', textAlign: 'right' }}>
                             <button onClick={() => { setEditData(t); setShowForm('txn'); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}>
                                <Edit size={16} />
                             </button>
                          </td>
                        </tr>
                      );
                    })}
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
                     <AccountForm token={token} API={API_BASE} onCancel={() => { setShowForm(null); setEditData(null); }} onComplete={() => { setShowForm(null); setEditData(null); fetchData(); }} existingData={editData} />
                  ) : (
                    <table style={{ width: '100%' }}>
                      <thead><tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}><th style={{ padding: '16px' }}>System Code</th><th style={{ padding: '16px' }}>Account Name</th><th style={{ padding: '16px' }}>Classification</th><th style={{ padding: '16px', textAlign: 'right' }}>Balance</th><th style={{ padding: '16px' }}></th></tr></thead>
                      <tbody>
                        {data.chart.map(acc => (
                          <tr key={acc.code} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '16px', fontWeight: '800', color: 'var(--text-muted)' }}>{acc.code}</td>
                            <td style={{ padding: '16px', fontWeight: '700' }}>{acc.account_name}</td>
                            <td style={{ padding: '16px' }}>
                               <span className="badge" style={{ background: '#f5f5f5' }}>{acc.account_type}</span>
                            </td>
                            <td style={{ padding: '16px', textAlign: 'right', fontWeight: '800' }}>${acc.balance.toLocaleString()}</td>
                            <td style={{ padding: '16px', textAlign: 'right' }}>
                               <button onClick={() => { setEditData(acc); setShowForm('account'); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}>
                                  <Edit size={16} />
                               </button>
                            </td>
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
             <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
                {['Trial Balance', 'Profit & Loss', 'GST Filings', 'HSN Summary'].map(r => (
                   <button key={r} onClick={() => setActiveSubTab(r)} style={{ background: activeSubTab === r ? 'black' : 'white', color: activeSubTab === r ? 'white' : 'black', border: '1px solid black', padding: '10px 24px', borderRadius: '30px', cursor: 'pointer', fontWeight: '800', fontSize: '0.75rem' }}>{r.toUpperCase()}</button>
                ))}
             </div>

             {activeSubTab === 'Trial Balance' && (
                <div className="glass-card" style={{ padding: '32px' }}>
                   <h3>Trial Balance Symmetry</h3>
                   <div style={{ height: '300px', width: '100%', marginBottom: '40px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.trialBalance}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                          <XAxis dataKey="code" tick={{ fontSize: 10, fontWeight: 700 }} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                          <Bar dataKey="debit" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                          <Bar dataKey="credit" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                      </ResponsiveContainer>
                   </div>
                   <table style={{ width: '100%' }}>
                      <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                          <th style={{ padding: '16px' }}>Code</th><th style={{ padding: '16px' }}>Account Head</th><th style={{ padding: '16px', textAlign: 'right' }}>Debits</th><th style={{ padding: '16px', textAlign: 'right' }}>Credits</th><th style={{ padding: '16px', textAlign: 'right' }}>Net</th>
                        </tr>
                      </thead>
                      <tbody>
                         {(data.trialBalance || []).map(a => (
                            <tr key={a.code} style={{ borderBottom: '1px solid #eee' }}>
                               <td style={{ padding: '16px', fontWeight: '800' }}>{a.code}</td>
                               <td style={{ padding: '16px' }}>{a.name}</td>
                               <td style={{ padding: '16px', textAlign: 'right', color: '#10b981' }}>${a.debit.toLocaleString()}</td>
                               <td style={{ padding: '16px', textAlign: 'right', color: '#ef4444' }}>${a.credit.toLocaleString()}</td>
                               <td style={{ padding: '16px', textAlign: 'right', fontWeight: '900' }}>${a.net.toLocaleString()}</td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             )}

             {activeSubTab === 'Profit & Loss' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                   <div className="glass-card" style={{ padding: '32px' }}>
                      <h4 style={{ color: '#10b981', marginBottom: '24px' }}>INCOME</h4>
                      {data.chart.filter(a => a.account_type === 'Income').map(a => (
                         <div key={a.code} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', borderBottom: '1px solid #f0f0f0' }}>
                            <span>{a.account_name}</span><b>${a.balance.toLocaleString()}</b>
                         </div>
                      ))}
                   </div>
                   <div className="glass-card" style={{ padding: '32px' }}>
                      <h4 style={{ color: '#ef4444', marginBottom: '24px' }}>EXPENSES</h4>
                      {data.chart.filter(a => a.account_type === 'Expense').map(a => (
                         <div key={a.code} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', borderBottom: '1px solid #f0f0f0' }}>
                            <span>{a.account_name}</span><b>${a.balance.toLocaleString()}</b>
                         </div>
                      ))}
                   </div>
                   <div className="glass-card" style={{ gridColumn: 'span 2', background: 'black', color: 'white', padding: '32px', textAlign: 'center' }}>
                      <h3 style={{ margin: 0 }}>Net Profit/Loss: ${(data.chart.filter(a => a.account_type === 'Income').reduce((s, a) => s + a.balance, 0) - data.chart.filter(a => a.account_type === 'Expense').reduce((s, a) => s + a.balance, 0)).toLocaleString()}</h3>
                   </div>
                </div>
             )}

             {activeSubTab === 'GST Filings' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '30px' }}>
                   <div className="glass-card" style={{ padding: '32px' }}>
                      <h3>Tax Structure</h3>
                      <div style={{ height: '240px', marginTop: '20px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                           <RadialBarChart innerRadius="30%" outerRadius="100%" data={[
                              { name: 'Output', value: (data.gst?.gstr1_summary?.cgst || 0) + (data.gst?.gstr1_summary?.sgst || 0), fill: '#ef4444' },
                              { name: 'Input', value: (data.gst?.itc_summary?.cgst_claimable || 0) + (data.gst?.itc_summary?.sgst_claimable || 0), fill: '#10b981' }
                           ]}>
                              <RadialBar minAngle={15} background clockWise dataKey="value" />
                              <Tooltip />
                           </RadialBarChart>
                        </ResponsiveContainer>
                      </div>
                   </div>
                   <div className="glass-card" style={{ padding: '32px' }}>
                      <h3>GSTR-3B Summary</h3>
                      <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                         <div style={{ padding: '15px', background: '#fff1f2', borderRadius: '12px' }}>Output Tax Liability: <b>${((data.gst?.gstr1_summary?.cgst || 0) + (data.gst?.gstr1_summary?.sgst || 0)).toLocaleString()}</b></div>
                         <div style={{ padding: '15px', background: '#f0fdf4', borderRadius: '12px' }}>Input Tax Credit: <b>${((data.gst?.itc_summary?.cgst_claimable || 0) + (data.gst?.itc_summary?.sgst_claimable || 0)).toLocaleString()}</b></div>
                         <div style={{ padding: '20px', background: 'black', color: 'white', borderRadius: '12px', textAlign: 'center' }}>
                            Net Tax Payable: <b style={{ fontSize: '1.4rem', color: 'var(--primary)' }}>${Math.max(0, ((data.gst?.gstr1_summary?.cgst || 0) + (data.gst?.gstr1_summary?.sgst || 0)) - ((data.gst?.itc_summary?.cgst_claimable || 0) + (data.gst?.itc_summary?.sgst_claimable || 0))).toLocaleString()}</b>
                         </div>
                      </div>
                   </div>
                </div>
             )}

             {activeSubTab === 'HSN Summary' && (
                <div className="glass-card" style={{ padding: '32px' }}>
                   <h3>HSN-wise Statistics</h3>
                   <table style={{ width: '100%', marginTop: '20px' }}>
                      <thead>
                         <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                            <th style={{ padding: '12px' }}>HSN</th><th style={{ padding: '12px', textAlign: 'right' }}>CGST</th><th style={{ padding: '12px', textAlign: 'right' }}>SGST</th><th style={{ padding: '12px', textAlign: 'right' }}>IGST</th>
                         </tr>
                      </thead>
                      <tbody>
                         {(data.hsn || []).map((h, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                               <td style={{ padding: '12px' }}>{h._id}</td>
                               <td style={{ padding: '12px', textAlign: 'right' }}>${h.cgst.toLocaleString()}</td>
                               <td style={{ padding: '12px', textAlign: 'right' }}>${h.sgst.toLocaleString()}</td>
                               <td style={{ padding: '12px', textAlign: 'right' }}>${h.igst.toLocaleString()}</td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
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

const AccountForm = ({ token, API, onComplete, onCancel, existingData }) => {
  const [formData, setFormData] = useState(existingData || { account_name: '', account_type: 'Asset', code: '', balance: 0.0 });
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (existingData) {
        await axios.put(`${API}/masters/chart/${existingData.code}`, formData, { headers: { Authorization: `Bearer ${token}` }});
      } else {
        await axios.post(`${API}/masters/chart`, formData, { headers: { Authorization: `Bearer ${token}` }});
      }
      onComplete();
    } catch (err) { alert("Error saving account head"); }
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

const TransactionForm = ({ token, API, onCancel, onSuccess, accounts, parties, existingData }) => {
  const [formData, setFormData] = useState(existingData || { 
    date: new Date().toISOString().split('T')[0], 
    description: '', 
    journal_type: 'Journal', 
    entries: [
      { account_code: '', type: 'Debit', amount: 0 },
      { account_code: '', type: 'Credit', amount: 0 }
    ],
    reference: '',
    cgst_amount: 0,
    sgst_amount: 0,
    igst_amount: 0,
    hsn_code: '',
    party_id: ''
  });

  const addEntry = () => {
    setFormData({
      ...formData,
      entries: [...formData.entries, { account_code: '', type: 'Debit', amount: 0 }]
    });
  };

  const updateEntry = (index, field, value) => {
    const newEntries = [...formData.entries];
    newEntries[index][field] = value;
    setFormData({ ...formData, entries: newEntries });
  };

  const removeEntry = (index) => {
    if (formData.entries.length <= 2) return;
    setFormData({ ...formData, entries: formData.entries.filter((_, i) => i !== index) });
  };

  const totalDebit = formData.entries.filter(e => e.type === 'Debit').reduce((s, e) => s + parseFloat(e.amount || 0), 0);
  const totalCredit = formData.entries.filter(e => e.type === 'Credit').reduce((s, e) => s + parseFloat(e.amount || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isBalanced) {
      alert("Error: Total Debits must equal Total Credits!");
      return;
    }
    try {
      if (existingData) {
        await axios.put(`${API}/transactions/${existingData._id}`, formData, { headers: { Authorization: `Bearer ${token}` }});
      } else {
        await axios.post(`${API}/transactions`, formData, { headers: { Authorization: `Bearer ${token}` }});
      }
      onSuccess();
    } catch (err) { alert("Error saving entry: " + (err.response?.data?.detail || "Network issue")); }
  };

  return (
    <div className="glass-card" style={{ maxWidth: '900px', margin: '0 auto', padding: '40px' }}>
      <h3 style={{ marginBottom: '32px' }}>Double-Entry Journal Management</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '30px' }}>
           <div>
              <label style={{ fontSize: '0.75rem', fontWeight: '800', display: 'block', marginBottom: '8px' }}>POSTING DATE</label>
              <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
           </div>
           <div>
              <label style={{ fontSize: '0.75rem', fontWeight: '800', display: 'block', marginBottom: '8px' }}>JOURNAL TYPE</label>
              <select value={formData.journal_type} onChange={e => setFormData({...formData, journal_type: e.target.value})}>
                 <option>Journal</option><option>Sales</option><option>Purchase</option><option>Payment</option><option>Receipt</option><option>Contra</option>
              </select>
           </div>
           <div>
              <label style={{ fontSize: '0.75rem', fontWeight: '800', display: 'block', marginBottom: '8px' }}>PROTOCOL REF #</label>
              <input type="text" placeholder="REF-2026-001" value={formData.reference} onChange={e => setFormData({...formData, reference: e.target.value})} />
           </div>
        </div>

        <div style={{ background: '#fcfcfc', padding: '20px', borderRadius: '15px', border: '1px solid #eee', marginBottom: '30px' }}>
           <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 40px', gap: '15px', marginBottom: '10px', padding: '0 10px' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: '800' }}>ACCOUNT HEAD</span>
              <span style={{ fontSize: '0.7rem', fontWeight: '800' }}>ENTRY TYPE</span>
              <span style={{ fontSize: '0.7rem', fontWeight: '800' }}>AMOUNT ($)</span>
              <span></span>
           </div>
           {formData.entries.map((entry, index) => (
             <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 40px', gap: '15px', marginBottom: '12px' }}>
                <select required value={entry.account_code} onChange={e => updateEntry(index, 'account_code', e.target.value)}>
                   <option value="">Select Account...</option>
                   {accounts.map(a => <option key={a.code} value={a.code}>{a.account_name} ({a.code})</option>)}
                </select>
                <select value={entry.type} onChange={e => updateEntry(index, 'type', e.target.value)}>
                   <option>Debit</option><option>Credit</option>
                </select>
                <input type="number" step="0.01" required value={entry.amount} onChange={e => updateEntry(index, 'amount', e.target.value)} />
                <button type="button" onClick={() => removeEntry(index)} style={{ background: '#fee2e2', border: 'none', color: '#ef4444', borderRadius: '8px', cursor: 'pointer' }}>×</button>
             </div>
           ))}
           <button type="button" onClick={addEntry} style={{ background: 'transparent', border: '1px dashed #ccc', width: '100%', padding: '10px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}>+ Add Entry Line</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '30px' }}>
           <div>
              <label style={{ fontSize: '0.75rem', fontWeight: '800', display: 'block', marginBottom: '8px' }}>CGST ($)</label>
              <input type="number" value={formData.cgst_amount} onChange={e => setFormData({...formData, cgst_amount: parseFloat(e.target.value)})} />
           </div>
           <div>
              <label style={{ fontSize: '0.75rem', fontWeight: '800', display: 'block', marginBottom: '8px' }}>SGST ($)</label>
              <input type="number" value={formData.sgst_amount} onChange={e => setFormData({...formData, sgst_amount: parseFloat(e.target.value)})} />
           </div>
           <div>
              <label style={{ fontSize: '0.75rem', fontWeight: '800', display: 'block', marginBottom: '8px' }}>IGST ($)</label>
              <input type="number" value={formData.igst_amount} onChange={e => setFormData({...formData, igst_amount: parseFloat(e.target.value)})} />
           </div>
        </div>

        <div style={{ marginBottom: '32px' }}>
           <label style={{ fontSize: '0.75rem', fontWeight: '800', display: 'block', marginBottom: '8px' }}>AUDIT NARRATION / REMARKS</label>
           <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ width: '100%', padding: '15px', borderRadius: '15px', border: '1px solid #eee', minHeight: '80px' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isBalanced ? '#dcfce7' : '#fee2e2', padding: '20px', borderRadius: '15px', marginBottom: '32px' }}>
           <div>
              <div style={{ fontSize: '0.7rem', fontWeight: '800', opacity: 0.6 }}>TOTAL DEBIT / CREDIT</div>
              <div style={{ fontWeight: '900', fontSize: '1.2rem' }}>${totalDebit.toLocaleString()} / ${totalCredit.toLocaleString()}</div>
           </div>
           <div style={{ fontWeight: '800', color: isBalanced ? '#166534' : '#991b1b' }}>
              {isBalanced ? '✓ ENTRIES BALANCED' : '⚠ UNBALANCED PROTOCOL'}
           </div>
        </div>

        <div style={{ display: 'flex', gap: '20px' }}>
          <button type="submit" className="btn-primary" disabled={!isBalanced} style={{ flex: 1, background: 'black', color: 'white', padding: '18px', opacity: isBalanced ? 1 : 0.5 }}>Authorize Post</button>
          <button type="button" onClick={onCancel} className="btn-primary" style={{ flex: 1, background: '#eee', color: 'black', padding: '18px' }}>Discard</button>
        </div>
      </form>
    </div>
  );
};

export default AccountantDashboard;
