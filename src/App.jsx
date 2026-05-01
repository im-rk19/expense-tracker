import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, TrendingUp, Calendar, Lock, Info, LogOut, User, Users, ShieldAlert } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURATION ---
const SUPABASE_URL = 'https://ylvuvillspfkfillmmrqqz.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsdnV2aWxscGZrZmlsbW1ycXF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NDkyNTksImV4cCI6MjA5MzIyNTI1OX0.42JPnnQlE0oh2X0WE3rK9TQ52qHDe63ocuoY48kSw0w';

let supabase = null;
try {
  if (SUPABASE_URL.startsWith('https://')) {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  }
} catch (e) {
  console.error('Supabase initialization failed:', e);
}

const DEFAULT_CATEGORIES = [
  { id: 1, name: 'Food', emoji: '🍔', color: '#FF6B6B' },
  { id: 2, name: 'Transport', emoji: '🚗', color: '#4ECDC4' },
  { id: 3, name: 'Entertainment', emoji: '🎬', color: '#95E1D3' },
  { id: 4, name: 'Shopping', emoji: '🛍️', color: '#FFE66D' },
  { id: 5, name: 'Utilities', emoji: '💡', color: '#A8E6CF' },
  { id: 6, name: 'Health', emoji: '⚕️', color: '#FF8B94' },
  { id: 7, name: 'Work', emoji: '💼', color: '#B4A7D6' },
  { id: 8, name: 'Miscellaneous', emoji: '📌', color: '#C7CEEA' },
];

// --- COMPONENTS ---

const LoginView = ({ setAuthStatus, setStorageMode, setUser }) => {
  const [view, setView] = useState('choice'); // 'choice', 'raghu', 'others'
  const [email, setEmail] = useState('');
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [showInfo, setShowInfo] = useState(false);

  const handleRaghuLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!supabase) {
      setError('Supabase configuration error.');
      return;
    }

    // Hardcoded password for Raghu as requested
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: 'niveditha',
    });

    if (authError) {
      setError(authError.message);
    } else {
      setStorageMode('supabase');
      setUser(data.user);
      setAuthStatus('authenticated');
    }
  };

  const handleOthersLogin = (e) => {
    e.preventDefault();
    const saved = localStorage.getItem('appPasscode');
    if (!saved) {
      if (passcode.length < 4) {
        setError('Passcode must be at least 4 digits');
        return;
      }
      localStorage.setItem('appPasscode', passcode);
      setStorageMode('local');
      setAuthStatus('authenticated');
    } else {
      if (passcode === saved) {
        setStorageMode('local');
        setAuthStatus('authenticated');
      } else {
        setError('Incorrect passcode');
        setPasscode('');
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 text-center animate-in fade-in zoom-in duration-300">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl w-full max-w-sm shadow-2xl relative">
        <button 
          onClick={() => setShowInfo(!showInfo)}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition"
        >
          <Info size={20} />
        </button>

        {showInfo && (
          <div className="absolute inset-0 bg-slate-950/95 rounded-3xl p-6 z-10 flex flex-col items-center justify-center text-left">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-800 pb-2 w-full">
               <Info size={18} /> Storage Info
            </h3>
            <div className="space-y-4 text-xs text-slate-400">
              <p><strong className="text-blue-400">Login as Raghu:</strong> Syncs to Supabase Cloud using master password.</p>
              <p><strong className="text-emerald-400">Login as Others:</strong> Stored 100% locally. You set your own passcode.</p>
            </div>
            <button onClick={() => setShowInfo(false)} className="mt-6 bg-slate-800 text-white px-6 py-2 rounded-xl text-xs font-bold">Close</button>
          </div>
        )}

        <div className="mb-8 text-center">
           <div className="bg-slate-800 w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-inner">
             <TrendingUp className="text-blue-500" size={32} />
           </div>
           <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Ledger Pro</h1>
        </div>

        {view === 'choice' && (
          <div className="space-y-3">
            <button onClick={() => setView('raghu')} className="w-full flex items-center gap-4 bg-slate-800 hover:bg-slate-700 p-4 rounded-2xl transition border border-slate-700/50 group">
              <div className="bg-blue-500/20 p-2 rounded-xl"><User className="text-blue-400" /></div>
              <div className="text-left">
                <p className="text-white font-bold">Login as Raghu</p>
                <p className="text-slate-500 text-[10px]">Cloud Sync (Master PW)</p>
              </div>
            </button>
            <button onClick={() => setView('others')} className="w-full flex items-center gap-4 bg-slate-800 hover:bg-slate-700 p-4 rounded-2xl transition border border-slate-700/50 group">
              <div className="bg-emerald-500/20 p-2 rounded-xl"><Users className="text-emerald-400" /></div>
              <div className="text-left">
                <p className="text-white font-bold">Login as Others</p>
                <p className="text-slate-500 text-[10px]">Local Storage</p>
              </div>
            </button>
          </div>
        )}

        {view === 'raghu' && (
          <form onSubmit={handleRaghuLogin} className="space-y-4">
            <p className="text-slate-400 text-xs px-2 mb-2 text-center">Enter your email address</p>
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm" required />
            {error && <p className="text-red-500 text-[10px] font-bold">{error}</p>}
            <button type="submit" className="w-full bg-blue-600 text-white font-black py-3 rounded-xl">Sign In</button>
            <button type="button" onClick={() => setView('choice')} className="text-slate-500 text-[10px] block mx-auto">Back</button>
          </form>
        )}

        {view === 'others' && (
          <form onSubmit={handleOthersLogin} className="space-y-4">
            <p className="text-slate-400 text-xs px-2 mb-2 text-center">
              {localStorage.getItem('appPasscode') ? 'Enter your device passcode' : 'Set a new passcode for this device'}
            </p>
            <input type="password" pattern="[0-9]*" inputMode="numeric" placeholder="****" value={passcode} onChange={e => setPasscode(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-center text-3xl tracking-[0.5em] text-white" required autoFocus />
            {error && <p className="text-red-500 text-[10px] font-bold">{error}</p>}
            <button type="submit" className="w-full bg-emerald-600 text-white font-black py-3 rounded-xl">Unlock</button>
            <button type="button" onClick={() => setView('choice')} className="text-slate-500 text-[10px] block mx-auto font-bold">Back</button>
          </form>
        )}
      </div>
    </div>
  );
};

const ExpenseTracker = () => {
  const [authStatus, setAuthStatus] = useState('authenticating_check');
  const [storageMode, setStorageMode] = useState('local'); 
  const [user, setUser] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [categories] = useState(DEFAULT_CATEGORIES);
  const [view, setView] = useState('overview'); 
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (!supabase) { setAuthStatus('login'); return; }
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        setStorageMode('supabase');
        setAuthStatus('authenticated');
      } else {
        setAuthStatus('login');
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstalled(false);
    });
    if (window.matchMedia('(display-mode: standalone)').matches) setIsInstalled(true);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsInstalled(true);
      }
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (authStatus !== 'authenticated') return;
      if (storageMode === 'local') {
        const saved = localStorage.getItem('expenses');
        setExpenses(saved ? JSON.parse(saved) : []);
      } else {
        const { data, error } = await supabase.from('expenses').select('*').order('date', { ascending: false });
        if (!error && data) setExpenses(data);
      }
    };
    loadData();
  }, [authStatus, storageMode]);

  useEffect(() => {
    if (authStatus === 'authenticated' && storageMode === 'local') {
      localStorage.setItem('expenses', JSON.stringify(expenses));
    }
  }, [expenses, authStatus, storageMode]);

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const handleAddExpense = async () => {
    if (!selectedCategory || !amount) return;
    const newExpense = {
      categoryId: selectedCategory,
      amount: parseFloat(amount),
      description: description || 'No description',
      date: selectedDate,
      user_id: user?.id || null,
    };

    if (storageMode === 'supabase' && supabase) {
      const { data, error } = await supabase.from('expenses').insert([newExpense]).select();
      if (!error && data) setExpenses([data[0], ...expenses]);
    } else {
      const localExpense = { ...newExpense, id: Date.now() };
      setExpenses([localExpense, ...expenses]);
    }

    setDescription('');
    setAmount('');
    setSelectedCategory(null);
    setView('overview');
  };

  const handleDeleteExpense = async (id) => {
    if (storageMode === 'supabase' && supabase) await supabase.from('expenses').delete().eq('id', id);
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const calculateTotal = (filter = null) => {
    return expenses
      .filter(e => !filter || e.categoryId === filter)
      .reduce((sum, e) => sum + e.amount, 0)
      .toFixed(2);
  };

  const getExpensesByDate = (date) => expenses.filter(e => e.date === date);

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  const OverviewView = () => (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl">
        <p className="text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-widest">Total Spent</p>
        <p className="text-3xl font-black">₹{calculateTotal()}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {categories.map(cat => {
          const total = calculateTotal(cat.id);
          return (
            <div key={cat.id} onClick={() => setCategoryFilter(categoryFilter === cat.id ? null : cat.id)}
              className={`rounded-2xl p-4 cursor-pointer border transition-all ${categoryFilter === cat.id ? 'bg-blue-600 border-blue-400' : 'bg-slate-900 border-slate-800 hover:bg-slate-800'}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{cat.emoji}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{cat.name}</span>
              </div>
              <p className="text-lg font-black text-white">₹{total}</p>
            </div>
          );
        })}
      </div>

      <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
        {expenses.filter(e => !categoryFilter || e.categoryId === categoryFilter).map(expense => {
           const cat = categories.find(c => c.id === expense.categoryId);
           return (
             <div key={expense.id} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-3 flex justify-between items-center shadow-sm">
               <div className="flex items-center gap-3">
                 <div className="text-xl">{cat?.emoji}</div>
                 <div>
                   <p className="text-sm font-bold text-white">{expense.description}</p>
                   <p className="text-[10px] text-slate-500">{new Date(expense.date).toLocaleDateString()}</p>
                 </div>
               </div>
               <div className="flex items-center gap-3">
                 <p className="text-sm font-black text-white">₹{expense.amount.toFixed(0)}</p>
                 <button onClick={() => handleDeleteExpense(expense.id)} className="text-slate-600 hover:text-red-400 transition-colors"><X size={14}/></button>
               </div>
             </div>
           );
        })}
      </div>
    </div>
  );

  const AddExpenseView = () => (
    <div className="space-y-4 animate-in zoom-in-95 duration-300">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
        <h2 className="text-white font-black mb-4 uppercase tracking-widest text-xs">New Expense</h2>
        <div className="space-y-4">
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} 
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm" />
          
          <div className="grid grid-cols-4 gap-2">
            {categories.map(cat => (
              <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                className={`p-3 rounded-xl transition-all ${selectedCategory === cat.id ? 'bg-blue-600 shadow-lg scale-110' : 'bg-slate-800 hover:bg-slate-700'}`}>
                <div className="text-xl">{cat.emoji}</div>
              </button>
            ))}
          </div>

          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-2xl font-black" />
          
          <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Description"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm" />

          <div className="flex gap-2">
            <button onClick={handleAddExpense} disabled={!selectedCategory || !amount} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg disabled:opacity-50">Save</button>
            <button onClick={() => setView('overview')} className="flex-1 bg-slate-800 text-white py-4 rounded-2xl font-black">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );

  const CalendarView = () => (
    <div className="space-y-4 animate-in fade-in duration-500">
       <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-1 hover:bg-slate-800 rounded-lg transition-colors"><ChevronLeft size={20} /></button>
            <p className="text-white font-black uppercase tracking-tighter">{currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-1 hover:bg-slate-800 rounded-lg transition-colors"><ChevronRight size={20} /></button>
          </div>
          
          <div className="grid grid-cols-7 gap-1">
             {['S','M','T','W','T','F','S'].map(d => <div key={d} className="text-center text-[10px] text-slate-600 font-bold mb-2">{d}</div>)}
             {calendarDays.map((day, idx) => {
                if (!day) return <div key={`empty-${idx}`} />;
                const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const hasExpense = getExpensesByDate(dateStr).length > 0;
                return (
                  <button key={day} onClick={() => { setSelectedDate(dateStr); setView('overview'); }}
                    className={`aspect-square flex flex-col items-center justify-center text-xs rounded-xl transition-all ${selectedDate === dateStr ? 'bg-blue-600 text-white font-black' : hasExpense ? 'bg-slate-800 text-white font-bold' : 'text-slate-500 hover:bg-slate-800'}`}>
                    {day}
                    {hasExpense && <div className="w-1 h-1 bg-blue-400 rounded-full mt-0.5" />}
                  </button>
                );
             })}
          </div>
       </div>
       <button onClick={() => setView('overview')} className="w-full bg-slate-900 text-slate-500 border border-slate-800 py-4 rounded-2xl font-black">Back to Overview</button>
    </div>
  );

  if (authStatus === 'authenticating_check') return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-black tracking-tighter">AUTHENTICATING...</div>;
  if (authStatus === 'login') return <div className="min-h-screen bg-slate-950"><LoginView setAuthStatus={setAuthStatus} setStorageMode={setStorageMode} setUser={setUser} /></div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 font-sans selection:bg-blue-500/30">
      <div className="max-w-md mx-auto">
        <header className="flex justify-between items-center mb-8 pt-4">
           <div>
             <h1 className="text-2xl font-black flex items-center gap-2 uppercase tracking-tighter">
                <TrendingUp className="text-blue-500" /> {storageMode === 'supabase' ? 'Raghu\'s Ledger' : 'Local Ledger'}
             </h1>
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{storageMode === 'supabase' ? 'Cloud Sync Active' : 'Offline Storage'}</p>
           </div>
           <div className="flex items-center gap-3">
              <button onClick={handleInstallClick} 
                className={`text-[10px] font-black px-4 py-2 rounded-full shadow-lg border transition-all ${isInstalled ? 'bg-slate-900 text-slate-500 border-slate-700' : 'bg-blue-600 text-white border-blue-400 animate-pulse'}`}>
                {isInstalled ? 'INSTALLED' : 'INSTALL'}
              </button>
              <button onClick={() => { supabase?.auth.signOut(); window.location.reload(); }} className="bg-slate-900 p-2 rounded-full border border-slate-800 text-slate-500 hover:text-white transition-colors"><LogOut size={18}/></button>
           </div>
        </header>

        {view === 'overview' && <OverviewView />}
        {view === 'add' && <AddExpenseView />}
        {view === 'calendar' && <CalendarView />}

        {view === 'overview' && (
          <div className="fixed bottom-8 left-0 right-0 px-6">
            <div className="max-w-md mx-auto flex gap-4">
               <button onClick={() => setView('add')} className="flex-1 bg-blue-600 py-4 rounded-2xl font-black shadow-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all">
                 <Plus strokeWidth={4} /> NEW RECORD
               </button>
               <button onClick={() => setView('calendar')} className="bg-slate-900 border border-slate-800 px-6 py-4 rounded-2xl hover:bg-slate-800 transition-colors shadow-lg">
                 <Calendar className="text-slate-400" />
               </button>
            </div>
          </div>
        )}
      </div>
      {view === 'overview' && <div className="h-28" />}
    </div>
  );
};

export default ExpenseTracker;
