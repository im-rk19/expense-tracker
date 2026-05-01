import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, TrendingUp, Calendar, Lock, Info, LogOut, User, Users, ShieldAlert, RefreshCw, Smartphone, Trash2 } from 'lucide-react';

// --- CONFIGURATION ---
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbyLqAWPxVEA5Gbd62lD4OrCmWc3HnPrhkoW_pCmCajKyCX6NzODAQPjaLWw7SjpKwcPBA/exec';

const DEFAULT_CATEGORIES = [
  { id: 1, name: 'Food', emoji: '🍔' },
  { id: 2, name: 'Transport', emoji: '🚗' },
  { id: 3, name: 'Entertainment', emoji: '🎬' },
  { id: 4, name: 'Shopping', emoji: '🛍️' },
  { id: 5, name: 'Utilities', emoji: '💡' },
  { id: 6, name: 'Health', emoji: '⚕️' },
  { id: 7, name: 'Work', emoji: '💼' },
  { id: 8, name: 'Miscellaneous', emoji: '📌' },
];

// --- UTILS ---

// Force any date format (Google, ISO, etc) into YYYY-MM-DD using LOCAL time
const normalizeDate = (d) => {
  if (!d) return "";
  const date = new Date(d);
  if (isNaN(date.getTime())) return String(d).substring(0, 10);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// --- STANDALONE COMPONENTS ---

const LoginView = ({ setAuthStatus, setStorageMode }) => {
  const [view, setView] = useState('choice'); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  const handleRaghuLogin = (e) => {
    e.preventDefault();
    if (email === 'raghukrishnanj2601@gmail.com' && password === 'niveditha') {
      localStorage.clear(); // Deep clean before login as requested
      localStorage.setItem('appMode', 'cloud');
      setStorageMode('cloud');
      setAuthStatus('authenticated');
    } else { setError('Invalid Credentials'); }
  };

  const handleOthersLogin = (e) => {
    e.preventDefault();
    const saved = localStorage.getItem('appPasscode');
    if (!saved) {
      if (passcode.length < 4) { setError('Passcode must be 4+ digits'); return; }
      localStorage.setItem('appPasscode', passcode);
      localStorage.setItem('appMode', 'local');
      setStorageMode('local'); setAuthStatus('authenticated');
    } else {
      if (passcode === saved) { 
        localStorage.setItem('appMode', 'local');
        setStorageMode('local'); setAuthStatus('authenticated'); 
      }
      else { setError('Incorrect passcode'); setPasscode(''); }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-4 animate-in fade-in duration-500">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl w-full max-w-sm shadow-2xl">
        <div className="mb-8 text-center">
           <div className="bg-slate-800 w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-inner"><TrendingUp className="text-blue-500" size={32} /></div>
           <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Ledger Pro</h1>
           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Version 5.1 - Stable Sync</p>
        </div>
        {view === 'choice' && (
          <div className="space-y-3">
            <button onClick={() => setView('raghu')} className="w-full flex items-center gap-4 bg-slate-800 hover:bg-slate-700 p-4 rounded-2xl transition border border-slate-700/50">
              <div className="bg-blue-500/20 p-2 rounded-xl"><User className="text-blue-400" /></div>
              <div className="text-left"><p className="text-white font-bold">Login as Raghu</p><p className="text-slate-500 text-[10px]">Cloud Sync (Sheets)</p></div>
            </button>
            <button onClick={() => setView('others')} className="w-full flex items-center gap-4 bg-slate-800 hover:bg-slate-700 p-4 rounded-2xl transition border border-slate-700/50">
              <div className="bg-emerald-500/20 p-2 rounded-xl"><Users className="text-emerald-400" /></div>
              <div className="text-left"><p className="text-white font-bold">Login as Others</p><p className="text-slate-500 text-[10px]">Local Offline</p></div>
            </button>
          </div>
        )}
        {view === 'raghu' && (
          <form onSubmit={handleRaghuLogin} className="space-y-4">
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm" required />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm" required />
            {error && <p className="text-red-500 text-[10px] font-bold">{error}</p>}
            <button type="submit" className="w-full bg-blue-600 text-white font-black py-3 rounded-xl shadow-lg">Sign In</button>
            <button type="button" onClick={() => setView('choice')} className="text-slate-500 text-[10px] block mx-auto font-bold mt-2">Back</button>
          </form>
        )}
        {view === 'others' && (
          <form onSubmit={handleOthersLogin} className="space-y-4">
            <p className="text-slate-400 text-xs px-2 mb-2">{localStorage.getItem('appPasscode') ? 'Enter passcode' : 'Create passcode'}</p>
            <input type="password" pattern="[0-9]*" inputMode="numeric" placeholder="****" value={passcode} onChange={e => setPasscode(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-center text-3xl tracking-[0.5em] text-white" required autoFocus />
            {error && <p className="text-red-500 text-[10px] font-bold">{error}</p>}
            <button type="submit" className="w-full bg-emerald-600 text-white font-black py-3 rounded-xl shadow-lg">Unlock</button>
            <button type="button" onClick={() => setView('choice')} className="text-slate-500 text-[10px] block mx-auto font-bold mt-2">Back</button>
          </form>
        )}
      </div>
    </div>
  );
};

const Header = ({ storageMode, isInstalled, isSyncing, handleInstallClick, handleLogout, handleSync }) => (
  <header className="flex justify-between items-center mb-8 pt-4">
    <div>
      <h1 className="text-2xl font-black flex items-center gap-2 uppercase tracking-tighter">
        <TrendingUp className="text-blue-500" /> {storageMode === 'cloud' ? 'Cloud Ledger' : 'Local Ledger'}
      </h1>
      <div className="flex items-center gap-2 mt-1">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          {storageMode === 'cloud' ? 'Auto-Syncing' : 'Local Only'}
        </p>
        {storageMode === 'cloud' && (
          <RefreshCw size={12} className={`text-slate-600 ${isSyncing ? 'animate-spin text-blue-400' : ''}`} onClick={handleSync} />
        )}
      </div>
    </div>
    <div className="flex items-center gap-3">
       <button onClick={handleInstallClick} className={`text-[10px] font-black px-4 py-2 rounded-full shadow-lg border transition-all flex items-center gap-2 ${isInstalled ? 'bg-slate-900 text-slate-500 border-slate-700' : 'bg-blue-600 text-white border-blue-400 animate-pulse'}`}>
         {isInstalled ? 'INSTALLED' : 'INSTALL APP'} <Smartphone size={12} />
       </button>
       <button onClick={handleLogout} className="bg-slate-900 p-2 rounded-full border border-slate-800 text-slate-500 hover:text-white transition-colors"><LogOut size={18}/></button>
    </div>
  </header>
);

const OverviewView = ({ total, categories, expenses, categoryFilter, setCategoryFilter, handleDeleteExpense }) => (
  <div className="space-y-4 animate-in fade-in duration-500">
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl">
      <p className="text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-widest">Total Spent</p>
      <p className="text-3xl font-black">₹{total}</p>
    </div>
    <div className="grid grid-cols-2 gap-3">
      {categories.map(cat => {
        const catTotal = expenses.filter(e => e.categoryId === cat.id).reduce((s, e) => s + parseFloat(e.amount || 0), 0).toFixed(2);
        return (
          <div key={cat.id} onClick={() => setCategoryFilter(categoryFilter === cat.id ? null : cat.id)}
            className={`rounded-2xl p-4 cursor-pointer border transition-all ${categoryFilter === cat.id ? 'bg-blue-600 border-blue-400 shadow-lg' : 'bg-slate-900 border-slate-800 hover:bg-slate-800'}`}>
            <div className="flex items-center gap-2 mb-2"><span className="text-xl">{cat.emoji}</span><span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{cat.name}</span></div>
            <p className="text-lg font-black text-white">₹{catTotal}</p>
          </div>
        );
      })}
    </div>
    <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
      {[...expenses].reverse().filter(e => !categoryFilter || e.categoryId === categoryFilter).map(expense => {
         const cat = categories.find(c => c.id === expense.categoryId);
         return (
           <div key={expense.id} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-3 flex justify-between items-center group">
             <div className="flex items-center gap-3">
               <div className="text-xl">{cat?.emoji}</div>
               <div><p className="text-sm font-bold text-white">{expense.description}</p><p className="text-[10px] text-slate-500">{normalizeDate(expense.date)}</p></div>
             </div>
             <div className="flex items-center gap-3"><p className="text-sm font-black text-white">₹{parseFloat(expense.amount || 0).toFixed(0)}</p><button onClick={() => handleDeleteExpense(expense.id)} className="text-slate-600 hover:text-red-400 p-1"><X size={14}/></button></div>
           </div>
         );
      })}
      {expenses.length === 0 && <p className="text-xs text-slate-600 text-center py-10 font-bold">NO RECORDS FOUND</p>}
    </div>
  </div>
);

const AddExpenseView = ({ selectedDate, setSelectedDate, categories, selectedCategory, setSelectedCategory, amount, setAmount, description, setDescription, handleAddExpense, setView }) => (
  <div className="space-y-4 animate-in zoom-in-95 duration-300">
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
      <h2 className="text-white font-black mb-4 uppercase tracking-widest text-xs text-center">New Entry</h2>
      <div className="space-y-4">
        <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm" />
        <div className="grid grid-cols-4 gap-2">{categories.map(cat => (<button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`p-3 rounded-xl transition-all ${selectedCategory === cat.id ? 'bg-blue-600 shadow-lg scale-110' : 'bg-slate-800 hover:bg-slate-700'}`}><div className="text-xl">{cat.emoji}</div></button>))}</div>
        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-2xl font-black" />
        <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm" />
        <div className="flex gap-2"><button onClick={handleAddExpense} disabled={!selectedCategory || !amount} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg disabled:opacity-50">Save</button><button onClick={() => setView('overview')} className="flex-1 bg-slate-800 text-white py-4 rounded-2xl font-black">Cancel</button></div>
      </div>
    </div>
  </div>
);

const CalendarView = ({ currentMonth, setCurrentMonth, calendarDays, selectedDate, setSelectedDate, expenses, categories, handleDeleteExpense, setView }) => {
  const dateExpenses = expenses.filter(e => normalizeDate(e.date) === normalizeDate(selectedDate));
  return (
    <div className="space-y-4 animate-in fade-in duration-500">
       <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-1 hover:bg-slate-800 rounded-lg"><ChevronLeft size={20} /></button>
            <p className="text-white font-black uppercase tracking-tighter">{currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-1 hover:bg-slate-800 rounded-lg"><ChevronRight size={20} /></button>
          </div>
          <div className="grid grid-cols-7 gap-1">
             {['S','M','T','W','T','F','S'].map(d => <div key={d} className="text-center text-[10px] text-slate-600 font-bold mb-2">{d}</div>)}
             {calendarDays.map((day, idx) => {
                if (!day) return <div key={`empty-${idx}`} />;
                const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const hasExpense = expenses.some(e => normalizeDate(e.date) === dateStr);
                return (<button key={day} onClick={() => setSelectedDate(dateStr)} className={`aspect-square flex flex-col items-center justify-center text-xs rounded-xl transition-all ${normalizeDate(selectedDate) === dateStr ? 'bg-blue-600 text-white font-black shadow-lg' : hasExpense ? 'bg-slate-800 text-white font-bold' : 'text-slate-500 hover:bg-slate-800'}`}>{day}{hasExpense && <div className="w-1 h-1 bg-blue-400 rounded-full mt-0.5" />}</button>);
             })}
          </div>
       </div>
       <div className="space-y-2">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Details: {new Date(selectedDate).toLocaleDateString()}</p>
          <div className="space-y-2 max-h-[30vh] overflow-y-auto">
            {dateExpenses.map(expense => {
              const cat = categories.find(c => c.id === expense.categoryId);
              return (
                <div key={expense.id} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-3 flex justify-between items-center">
                  <div className="flex items-center gap-3"><div className="text-xl">{cat?.emoji}</div><div><p className="text-sm font-bold text-white">{expense.description}</p><p className="text-[10px] text-slate-500">₹{parseFloat(expense.amount || 0).toFixed(0)}</p></div></div>
                  <button onClick={() => handleDeleteExpense(expense.id)} className="text-slate-600 hover:text-red-400 p-1"><X size={14}/></button>
                </div>
              );
            })}
            {dateExpenses.length === 0 && <p className="text-xs text-slate-600 py-6 text-center font-bold uppercase">No records for this date</p>}
          </div>
       </div>
       <button onClick={() => setView('overview')} className="w-full bg-slate-900 text-slate-500 border border-slate-800 py-4 rounded-2xl font-black mt-2">Dashboard</button>
    </div>
  );
};

// --- MAIN APPLICATION ---

const ExpenseTracker = () => {
  const [authStatus, setAuthStatus] = useState('loading');
  const [storageMode, setStorageMode] = useState('local'); 
  const [expenses, setExpenses] = useState([]);
  const [view, setView] = useState('overview'); 
  const [isSyncing, setIsSyncing] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  // Form states
  const [selectedDate, setSelectedDate] = useState(normalizeDate(new Date()));
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // --- LOGIC ---

  const loadDataFromCloud = useCallback(async () => {
    setIsSyncing(true);
    try {
      const response = await fetch(GOOGLE_SHEET_URL, { redirect: 'follow' });
      const data = await response.json();
      const formatted = data.map((item, idx) => ({
        ...item,
        id: item.id || "cloud_" + idx + "_" + Date.now(),
        categoryId: DEFAULT_CATEGORIES.find(c => c.name === item.categoryName)?.id || 8
      }));
      setExpenses(formatted);
      localStorage.setItem('expenses_cloud_cache', JSON.stringify(formatted));
    } catch (err) { console.error("Cloud fetch failed:", err); }
    finally { setIsSyncing(false); }
  }, []);

  const loadLocalData = useCallback(() => {
    const saved = localStorage.getItem('expenses_local');
    setExpenses(saved ? JSON.parse(saved) : []);
  }, []);

  useEffect(() => {
    const mode = localStorage.getItem('appMode');
    if (mode) {
      setStorageMode(mode);
      setAuthStatus('authenticated');
      if (mode === 'cloud') {
         const cached = localStorage.getItem('expenses_cloud_cache');
         if (cached) setExpenses(JSON.parse(cached));
         loadDataFromCloud();
      } else {
         loadLocalData();
      }
    } else { setAuthStatus('login'); }

    const handleBeforeInstall = (e) => { e.preventDefault(); setDeferredPrompt(e); setIsInstalled(false); };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    if (window.matchMedia('(display-mode: standalone)').matches) setIsInstalled(true);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, [loadDataFromCloud, loadLocalData]);

  const handleAddExpense = async () => {
    if (!selectedCategory || !amount) return;
    const cat = DEFAULT_CATEGORIES.find(c => c.id === selectedCategory);
    const newExpense = { 
      id: "temp_" + Date.now().toString(),
      categoryId: selectedCategory, 
      amount: parseFloat(amount), 
      description: description || 'No description', 
      date: selectedDate 
    };

    const updatedExpenses = [...expenses, newExpense];
    setExpenses(updatedExpenses);
    
    if (storageMode === 'local') {
      localStorage.setItem('expenses_local', JSON.stringify(updatedExpenses));
    } else {
      localStorage.setItem('expenses_cloud_cache', JSON.stringify(updatedExpenses));
      setIsSyncing(true);
      fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({
          date: selectedDate,
          amount: parseFloat(amount),
          description: description || 'No description',
          categoryName: cat?.name || 'Miscellaneous'
        })
      }).finally(() => {
         loadDataFromCloud(); 
      });
    }
    setDescription(''); setAmount(''); setSelectedCategory(null); setView('overview');
  };

  const handleDeleteExpense = async (id) => {
    const expenseToDelete = expenses.find(e => e.id === id);
    const updated = expenses.filter(e => e.id !== id);
    setExpenses(updated);

    if (storageMode === 'local') {
      localStorage.setItem('expenses_local', JSON.stringify(updated));
    } else {
      localStorage.setItem('expenses_cloud_cache', JSON.stringify(updated));
      setIsSyncing(true);
      fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({
          action: 'delete',
          description: expenseToDelete?.description,
          amount: expenseToDelete?.amount
        })
      }).finally(() => {
        loadDataFromCloud(); 
      });
    }
  };

  const handleLogout = () => {
    localStorage.clear(); // Deep clean as requested
    window.location.reload();
  };

  const totalSpent = expenses.reduce((s, e) => s + parseFloat(e.amount || 0), 0).toFixed(2);

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  if (authStatus === 'loading') return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-black">INITIALIZING...</div>;
  if (authStatus === 'login') return <LoginView setAuthStatus={setAuthStatus} setStorageMode={setStorageMode} />;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 font-sans pb-32">
      <div className="max-w-md mx-auto">
        <Header storageMode={storageMode} isInstalled={isInstalled} isSyncing={isSyncing} handleInstallClick={() => deferredPrompt?.prompt() || alert("Use your browser menu to 'Add to Home Screen'")} handleLogout={handleLogout} handleSync={loadDataFromCloud} />

        {view === 'overview' && <OverviewView total={totalSpent} categories={DEFAULT_CATEGORIES} expenses={expenses} categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter} handleDeleteExpense={handleDeleteExpense} />}
        {view === 'add' && <AddExpenseView selectedDate={selectedDate} setSelectedDate={setSelectedDate} categories={DEFAULT_CATEGORIES} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} amount={amount} setAmount={setAmount} description={description} setDescription={setDescription} handleAddExpense={handleAddExpense} setView={setView} />}
        {view === 'calendar' && <CalendarView currentMonth={currentMonth} setCurrentMonth={setCurrentMonth} calendarDays={calendarDays} selectedDate={selectedDate} setSelectedDate={setSelectedDate} expenses={expenses} categories={DEFAULT_CATEGORIES} handleDeleteExpense={handleDeleteExpense} setView={setView} />}

        {view === 'overview' && (
          <div className="fixed bottom-8 left-0 right-0 px-6 z-50">
            <div className="max-w-md mx-auto flex gap-4">
               <button onClick={() => setView('add')} className="flex-1 bg-blue-600 py-4 rounded-2xl font-black shadow-2xl flex items-center justify-center gap-2 hover:scale-[1.05] active:scale-95 transition-all">
                 <Plus strokeWidth={4} /> NEW RECORD
               </button>
               <button onClick={() => setView('calendar')} className="bg-slate-900 border border-slate-800 px-6 py-4 rounded-2xl shadow-lg hover:bg-slate-800 transition-colors">
                 <Calendar className="text-slate-400" />
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseTracker;
