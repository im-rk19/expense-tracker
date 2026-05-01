import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, IndianRupee, Calendar as CalendarIcon, LogOut, Download, Upload, Trash2, PieChart, Info, Smartphone } from 'lucide-react';

// --- CONFIGURATION ---
const DEFAULT_CATEGORIES = [
  { id: 1, name: 'Food', emoji: '🍔' },
  { id: 2, name: 'Transport', emoji: '🚗' },
  { id: 3, name: 'Entertainment', emoji: '🎬' },
  { id: 4, name: 'Shopping', emoji: '🛍️' },
  { id: 5, name: 'Utilities', emoji: '💡' },
  { id: 6, name: 'Health', emoji: '⚕️' },
  { id: 7, name: 'Work', emoji: '💼' },
  { id: 8, name: 'Rent/Home', emoji: '🏠' },
  { id: 9, name: 'Investment', emoji: '📈' },
  { id: 10, name: 'Misc', emoji: '📌' },
];

// --- UTILS ---
const normalizeDate = (d) => {
  try {
    const date = new Date(d);
    if (isNaN(date.getTime())) return new Date().toISOString().split('T')[0];
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (e) {
    return new Date().toISOString().split('T')[0];
  }
};

// --- COMPONENTS ---

const LoginView = ({ setAuthStatus }) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  const handleUnlock = (e) => {
    e.preventDefault();
    const saved = localStorage.getItem('appPasscode');
    if (!saved) {
      if (passcode.length < 4) { setError('Set a 4+ digit passcode'); return; }
      localStorage.setItem('appPasscode', passcode);
      setAuthStatus('authenticated');
    } else {
      if (passcode === saved) { setAuthStatus('authenticated'); }
      else { setError('Incorrect passcode'); setPasscode(''); }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-6 animate-in fade-in duration-700">
      <div className="w-full max-w-sm text-center">
        <div className="relative inline-block mb-8">
          <div className="absolute inset-0 bg-red-600 blur-2xl opacity-20 animate-pulse"></div>
          <div className="relative bg-slate-900 border-2 border-red-600/50 w-20 h-20 rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.3)]">
            <IndianRupee className="text-red-500" size={40} strokeWidth={3} />
          </div>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">Expense Tracker</h1>
        <p className="text-slate-500 text-xs font-bold tracking-widest uppercase mb-10">Control your spending</p>
        
        <form onSubmit={handleUnlock} className="space-y-6">
          <div className="space-y-2">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
              {localStorage.getItem('appPasscode') ? 'Enter Passcode' : 'Create Security Passcode'}
            </p>
            <input 
              type="password" 
              pattern="[0-9]*" 
              inputMode="numeric" 
              placeholder="••••" 
              value={passcode} 
              onChange={e => setPasscode(e.target.value)} 
              className="w-full bg-slate-900/50 border-b-2 border-slate-800 focus:border-red-600 transition-all px-4 py-4 text-center text-4xl tracking-[0.5em] text-white outline-none"
              autoFocus 
            />
          </div>
          {error && <p className="text-red-500 text-[10px] font-black animate-bounce uppercase">{error}</p>}
          <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl shadow-[0_10px_20px_rgba(220,38,38,0.2)] transition-transform active:scale-95 uppercase tracking-widest">Unlock Ledger</button>
        </form>
        <p className="mt-12 text-slate-700 text-[9px] font-bold uppercase tracking-[0.2em]">100% Local • Private Storage</p>
      </div>
    </div>
  );
};

const Header = ({ isInstalled, handleInstallClick, handleLogout, onExport, onImport }) => (
  <header className="flex justify-between items-start mb-6">
    <div className="flex items-center gap-3">
      <div className="bg-red-600/10 border border-red-600/20 p-2 rounded-xl">
        <IndianRupee className="text-red-500" size={20} strokeWidth={3} />
      </div>
      <div>
        <h1 className="text-lg font-black text-white tracking-tighter uppercase leading-none">Expense Tracker</h1>
        <p className="text-[8px] font-bold text-red-500 uppercase tracking-widest mt-1">Local Only</p>
      </div>
    </div>
    <div className="flex items-center gap-1">
       {!isInstalled && (
         <button onClick={handleInstallClick} className="text-[8px] font-black px-2.5 py-1 rounded-full border border-red-600/30 text-red-500 uppercase mr-2">
           Install
         </button>
       )}
       <button onClick={onImport} className="p-2 text-slate-500 hover:text-white transition-colors"><Upload size={14}/></button>
       <button onClick={onExport} className="p-2 text-slate-500 hover:text-white transition-colors"><Download size={14}/></button>
       <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-red-500 transition-colors"><LogOut size={14}/></button>
    </div>
  </header>
);

const MonthBar = ({ currentMonth, setCurrentMonth }) => {
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      const activeBtn = scrollRef.current.children[currentMonth.getMonth()];
      if (activeBtn) activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [currentMonth]);

  return (
    <div ref={scrollRef} className="flex gap-2 overflow-x-auto no-scrollbar pb-3 mb-4">
      {months.map((m, i) => (
        <button 
          key={m} 
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), i, 1))}
          className={`px-5 py-2 rounded-xl text-[9px] font-black transition-all flex-shrink-0 border ${currentMonth.getMonth() === i ? 'bg-red-600 border-red-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
        >
          {m}
        </button>
      ))}
    </div>
  );
};

// --- MAIN APP ---

const ExpenseTracker = () => {
  const [authStatus, setAuthStatus] = useState('loading');
  const [expenses, setExpenses] = useState([]);
  const [view, setView] = useState('overview'); 
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(normalizeDate(new Date()));
  const [categoryFilter, setCategoryFilter] = useState(null);

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    // Attempt migration from old keys if any
    const oldKeys = ['expenses', 'expenses_local', 'local_expenses', 'expenses_cloud_cache'];
    let mergedData = [];
    oldKeys.forEach(k => {
      const d = localStorage.getItem(k);
      if (d) {
        try {
          const parsed = JSON.parse(d);
          if (Array.isArray(parsed)) mergedData = [...mergedData, ...parsed];
        } catch(e){}
      }
    });

    // Deduplicate and filter bad data
    const cleaned = [];
    const seenIds = new Set();
    mergedData.forEach(e => {
      if (e && e.amount && !seenIds.has(e.id)) {
        cleaned.push({
          id: e.id || Date.now() + Math.random().toString(),
          amount: parseFloat(e.amount),
          description: e.description || 'No remark',
          categoryId: parseInt(e.categoryId) || 10,
          date: normalizeDate(e.date)
        });
        seenIds.add(e.id);
      }
    });

    setExpenses(cleaned);
    localStorage.setItem('local_expenses_v2', JSON.stringify(cleaned));
    
    const isAuth = sessionStorage.getItem('isAuth');
    if (isAuth) setAuthStatus('authenticated');
    else setAuthStatus('login');

    window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); setDeferredPrompt(e); });
    if (window.matchMedia('(display-mode: standalone)').matches) setIsInstalled(true);
  }, []);

  const saveExpenses = (newExpenses) => {
    setExpenses(newExpenses);
    localStorage.setItem('local_expenses_v2', JSON.stringify(newExpenses));
  };

  const handleAddExpense = () => {
    if (!amount || !selectedCategory) return;
    const newExpense = {
      id: Date.now().toString(),
      amount: parseFloat(amount),
      description: description || 'No remark',
      categoryId: selectedCategory,
      date: selectedDate
    };
    saveExpenses([newExpense, ...expenses]);
    setAmount(''); setDescription(''); setSelectedCategory(null); setView('overview');
  };

  const handleDeleteExpense = (id) => {
    saveExpenses(expenses.filter(e => e.id !== id));
  };

  const handleExport = () => {
    const headers = ["Date", "Amount", "Category", "Remark"];
    const csvContent = [
      headers.join(","),
      ...expenses.map(e => {
        const cat = DEFAULT_CATEGORIES.find(c => c.id === e.categoryId)?.name || 'Misc';
        return `"${e.date}",${e.amount},"${cat}","${String(e.description).replace(/"/g, '""')}"`;
      })
    ].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ExpenseTracker_Backup.csv`;
    a.click();
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.csv';
    input.onchange = (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const lines = event.target.result.split('\n');
        const newEntries = [];
        for (let i = 1; i < lines.length; i++) {
          const parts = lines[i].split(',');
          if (parts.length < 4) continue;
          newEntries.push({
            id: "imported_" + Date.now() + i,
            date: parts[0].replace(/"/g, ''),
            amount: parseFloat(parts[1]),
            categoryId: DEFAULT_CATEGORIES.find(c => c.name === parts[2].replace(/"/g, ''))?.id || 10,
            description: parts[3].replace(/"/g, '')
          });
        }
        if (newEntries.length > 0) saveExpenses([...newEntries, ...expenses]);
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const currentMonthExpenses = useMemo(() => {
    return expenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear();
    });
  }, [expenses, currentMonth]);

  const displayExpenses = useMemo(() => {
    return currentMonthExpenses.filter(e => !categoryFilter || e.categoryId === categoryFilter);
  }, [currentMonthExpenses, categoryFilter]);

  const monthlyTotal = currentMonthExpenses.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0).toFixed(2);

  if (authStatus === 'loading') return <div className="min-h-screen bg-black flex items-center justify-center text-red-600 font-black">TRACKING...</div>;
  if (authStatus === 'login') return <LoginView setAuthStatus={(s) => { sessionStorage.setItem('isAuth', 'true'); setAuthStatus(s); }} />;

  return (
    <div className="min-h-screen bg-black text-white p-4 font-sans pb-32 select-none overflow-x-hidden">
      <div className="max-w-md mx-auto relative">
        <Header 
          isInstalled={isInstalled} 
          handleInstallClick={() => deferredPrompt?.prompt()} 
          handleLogout={() => { sessionStorage.clear(); window.location.reload(); }} 
          onExport={handleExport}
          onImport={handleImport}
        />

        <MonthBar currentMonth={currentMonth} setCurrentMonth={setCurrentMonth} />

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 mb-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 blur-3xl -mr-16 -mt-16 group-hover:bg-red-600/20 transition-all"></div>
          <p className="text-[10px] font-black text-slate-500 mb-1 uppercase tracking-widest">Monthly Spending</p>
          <p className="text-4xl font-black tracking-tighter">₹{monthlyTotal}</p>
        </div>

        {view === 'overview' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-2 gap-3">
              {DEFAULT_CATEGORIES.slice(0, 4).map(cat => {
                const catTotal = currentMonthExpenses.filter(e => e.categoryId === cat.id).reduce((s, e) => s + (parseFloat(e.amount) || 0), 0).toFixed(0);
                return (
                  <div key={cat.id} onClick={() => setCategoryFilter(categoryFilter === cat.id ? null : cat.id)}
                    className={`rounded-2xl p-4 cursor-pointer border transition-all ${categoryFilter === cat.id ? 'bg-red-600 border-red-400 shadow-lg' : 'bg-slate-900 border-slate-800'}`}>
                    <div className="flex items-center gap-2 mb-2"><span className="text-xl">{cat.emoji}</span><span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{cat.name}</span></div>
                    <p className="text-xl font-black text-white">₹{catTotal}</p>
                  </div>
                );
              })}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center px-2">
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Latest Transactions</p>
                {categoryFilter && <button onClick={() => setCategoryFilter(null)} className="text-[9px] text-red-500 font-bold uppercase">Clear Filter</button>}
              </div>
              <div className="space-y-2">
                {displayExpenses.slice(0, 50).map(expense => {
                   const cat = DEFAULT_CATEGORIES.find(c => c.id === expense.categoryId);
                   return (
                     <div key={expense.id} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex justify-between items-center active:scale-[0.98] transition-all">
                       <div className="flex items-center gap-4">
                         <div className="text-2xl">{cat?.emoji}</div>
                         <div>
                           <p className="text-sm font-bold text-white leading-none mb-1">{expense.description}</p>
                           <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{normalizeDate(expense.date)}</p>
                         </div>
                       </div>
                       <div className="flex items-center gap-4">
                         <p className="text-lg font-black text-white">₹{parseFloat(expense.amount).toFixed(0)}</p>
                         <button onClick={() => handleDeleteExpense(expense.id)} className="text-slate-700 hover:text-red-500 p-1"><X size={16}/></button>
                       </div>
                     </div>
                   );
                })}
                {displayExpenses.length === 0 && (
                  <div className="py-20 text-center opacity-20"><PieChart size={40} className="mx-auto mb-3" /><p className="text-[10px] font-black uppercase tracking-widest">No entries found</p></div>
                )}
              </div>
            </div>
          </div>
        )}

        {view === 'calendar' && (
          <div className="animate-in fade-in duration-500 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
               <div className="grid grid-cols-7 gap-1">
                  {['S','M','T','W','T','F','S'].map(d => <div key={d} className="text-center text-[10px] text-slate-600 font-bold mb-3">{d}</div>)}
                  {Array.from({ length: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate() }, (_, i) => i + 1).map(day => {
                    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const hasExpense = expenses.some(e => normalizeDate(e.date) === dateStr);
                    return (
                      <button key={day} onClick={() => setSelectedDate(dateStr)} 
                        className={`aspect-square flex flex-col items-center justify-center text-xs rounded-xl transition-all relative ${selectedDate === dateStr ? 'bg-red-600 text-white font-black' : hasExpense ? 'bg-slate-800 text-white font-bold' : 'text-slate-600'}`}>
                        {day}{hasExpense && <div className="absolute bottom-1 w-1 h-1 bg-red-400 rounded-full" />}
                      </button>
                    );
                  })}
               </div>
            </div>
            <div className="space-y-3">
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-2">Entries: {new Date(selectedDate).toLocaleDateString()}</p>
              {expenses.filter(e => normalizeDate(e.date) === selectedDate).map(e => (
                <div key={e.id} className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{DEFAULT_CATEGORIES.find(c => c.id === e.categoryId)?.emoji}</span>
                    <p className="text-sm font-bold">{e.description}</p>
                  </div>
                  <p className="text-lg font-black">₹{parseFloat(e.amount).toFixed(0)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'add' && (
          <div className="animate-in zoom-in-95 duration-300">
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl">
              <h2 className="text-red-500 font-black mb-8 uppercase tracking-[0.2em] text-[10px] text-center">Record Transaction</h2>
              <div className="space-y-6">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Date</p>
                  <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full bg-black border border-slate-800 rounded-2xl px-5 py-4 text-white text-sm outline-none focus:border-red-600 transition-colors" />
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {DEFAULT_CATEGORIES.map(cat => (
                    <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`p-4 rounded-2xl transition-all ${selectedCategory === cat.id ? 'bg-red-600 scale-110 shadow-lg' : 'bg-black border border-slate-800'}`}>
                      <div className="text-2xl">{cat.emoji}</div>
                    </button>
                  ))}
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Amount</p>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 font-black text-xl">₹</span>
                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="w-full bg-black border border-slate-800 rounded-2xl pl-12 pr-5 py-5 text-white text-3xl font-black outline-none focus:border-red-600" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-2">Remark</p>
                  <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Spent on..." className="w-full bg-black border border-slate-800 rounded-2xl px-5 py-4 text-white text-sm outline-none focus:border-red-600" />
                </div>
                <div className="flex gap-3 pt-4">
                  <button onClick={handleAddExpense} disabled={!selectedCategory || !amount} className="flex-[2] bg-red-600 text-white py-5 rounded-[1.5rem] font-black shadow-xl uppercase tracking-widest disabled:opacity-30">Save</button>
                  <button onClick={() => setView('overview')} className="flex-1 bg-slate-800 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px]">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="fixed bottom-8 left-0 right-0 px-8 z-50">
          <div className="max-w-md mx-auto bg-slate-900/90 backdrop-blur-xl border border-slate-800/50 p-2 rounded-[2rem] shadow-2xl flex gap-2">
            <button onClick={() => setView('overview')} className={`flex-1 py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all ${view === 'overview' ? 'bg-red-600 text-white' : 'text-slate-500'}`}>
              <TrendingUp size={20} />
            </button>
            <button onClick={() => setView('add')} className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-red-600/40 active:scale-90 transition-all -mt-8 border-4 border-black">
              <Plus size={32} strokeWidth={4} />
            </button>
            <button onClick={() => setView('calendar')} className={`flex-1 py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all ${view === 'calendar' ? 'bg-red-600 text-white' : 'text-slate-500'}`}>
              <CalendarIcon size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseTracker;
