import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, TrendingUp, Calendar, Lock, Info, LogOut, User, Users, ShieldAlert } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURATION ---
// User should replace these with their own Supabase credentials
const SUPABASE_URL = 'YOUR_SUPABASE_URL'; 
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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
  const [password, setPassword] = useState('');
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [showInfo, setShowInfo] = useState(false);

  const handleRaghuLogin = async (e) => {
    e.preventDefault();
    setError('');
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
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
        {/* Info Button */}
        <button 
          onClick={() => setShowInfo(!showInfo)}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition"
        >
          <Info size={20} />
        </button>

        {showInfo && (
          <div className="absolute inset-0 bg-slate-950/95 rounded-3xl p-6 z-10 flex flex-col items-center justify-center text-left">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-800 pb-2 w-full">
               <Info size={18} /> Storage Comparison
            </h3>
            <div className="space-y-4 text-xs text-slate-400">
              <p><strong className="text-blue-400">Login as Raghu:</strong> Your data is synced to a private Supabase database. You can access it from any device, and it won't be lost if you clear your browser.</p>
              <p><strong className="text-emerald-400">Login as Others:</strong> Data is stored 100% locally on this device's localStorage. No server is used. Privacy-focused, but data is lost if you clear browser cache.</p>
            </div>
            <button onClick={() => setShowInfo(false)} className="mt-6 bg-slate-800 text-white px-6 py-2 rounded-xl text-xs font-bold">Close</button>
          </div>
        )}

        <div className="mb-8">
           <div className="bg-slate-800 w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-inner">
             <Lock className="text-blue-500" size={32} />
           </div>
           <h1 className="text-2xl font-bold text-white">Expense Tracker</h1>
           <p className="text-slate-500 text-sm">Choose your session type</p>
        </div>

        {view === 'choice' && (
          <div className="space-y-3">
            <button 
              onClick={() => setView('raghu')}
              className="w-full flex items-center gap-4 bg-slate-800 hover:bg-slate-700 p-4 rounded-2xl transition border border-slate-700/50 group"
            >
              <div className="bg-blue-500/20 p-2 rounded-xl group-hover:bg-blue-500/30 transition"><User className="text-blue-400" /></div>
              <div className="text-left">
                <p className="text-white font-bold">Login as Raghu</p>
                <p className="text-slate-500 text-[10px]">Cloud Sync (Supabase)</p>
              </div>
            </button>
            <button 
              onClick={() => setView('others')}
              className="w-full flex items-center gap-4 bg-slate-800 hover:bg-slate-700 p-4 rounded-2xl transition border border-slate-700/50 group"
            >
              <div className="bg-emerald-500/20 p-2 rounded-xl group-hover:bg-emerald-500/30 transition"><Users className="text-emerald-400" /></div>
              <div className="text-left">
                <p className="text-white font-bold">Login as Others</p>
                <p className="text-slate-500 text-[10px]">Offline (LocalStorage)</p>
              </div>
            </button>
          </div>
        )}

        {view === 'raghu' && (
          <form onSubmit={handleRaghuLogin} className="space-y-4">
            <div className="space-y-2">
              <input 
                type="email" 
                placeholder="Email Address" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:border-blue-500 outline-none"
                required
              />
              <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:border-blue-500 outline-none"
                required
              />
            </div>
            {error && <p className="text-red-500 text-[10px] font-bold">{error}</p>}
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-500 transition shadow-lg shadow-blue-900/20">Sign In</button>
            <div className="flex justify-between items-center px-1">
              <button type="button" onClick={() => setView('choice')} className="text-slate-500 text-[10px] hover:text-white">Back</button>
              <button type="button" className="text-slate-500 text-[10px] hover:text-white underline">Forgot Keycode?</button>
            </div>
          </form>
        )}

        {view === 'others' && (
          <form onSubmit={handleOthersLogin} className="space-y-4">
            <p className="text-slate-400 text-xs px-2 mb-2">
              {localStorage.getItem('appPasscode') ? 'Enter your device passcode' : 'Set a new passcode for this device'}
            </p>
            <input 
              type="password" 
              pattern="[0-9]*"
              inputMode="numeric"
              placeholder="****"
              value={passcode}
              onChange={e => setPasscode(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-center text-3xl tracking-[0.5em] text-white focus:border-emerald-500 outline-none"
              required
              autoFocus
            />
            {error && <p className="text-red-500 text-[10px] font-bold">{error}</p>}
            <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-500 transition shadow-lg shadow-emerald-900/20">
              {localStorage.getItem('appPasscode') ? 'Unlock' : 'Create & Login'}
            </button>
            <div className="flex justify-between items-center px-1">
              <button type="button" onClick={() => setView('choice')} className="text-slate-500 text-[10px] hover:text-white">Back</button>
              <button type="button" onClick={() => {
                 if(window.confirm('Resetting will clear ALL local expenses on this device. Continue?')) {
                   localStorage.removeItem('appPasscode');
                   localStorage.removeItem('expenses');
                   window.location.reload();
                 }
              }} className="text-slate-500 text-[10px] hover:text-white underline">Reset Data</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// --- MAIN APP ---

const ExpenseTracker = () => {
  const [authStatus, setAuthStatus] = useState('authenticating_check');
  const [storageMode, setStorageMode] = useState('local'); // 'local' or 'supabase'
  const [user, setUser] = useState(null);
  
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [view, setView] = useState('overview'); 
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // Check initial auth state
  useEffect(() => {
    const checkAuth = async () => {
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

  // PWA Install Logic
  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstalled(false);
    });

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }
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

  // Sync Expenses
  useEffect(() => {
    const loadData = async () => {
      if (authStatus !== 'authenticated') return;

      if (storageMode === 'local') {
        const saved = localStorage.getItem('expenses');
        setExpenses(saved ? JSON.parse(saved) : []);
      } else {
        const { data, error } = await supabase
          .from('expenses')
          .select('*')
          .order('date', { ascending: false });
        if (!error && data) setExpenses(data);
      }
    };
    loadData();
  }, [authStatus, storageMode]);

  useEffect(() => {
    if (authStatus === 'authenticated' && storageMode === 'local') {
      localStorage.setItem('expenses', JSON.stringify(expenses));
    }
    // Supabase syncing would happen in handleAddExpense/handleDelete
  }, [expenses, authStatus, storageMode]);

  // Notifications
  useEffect(() => {
    if (authStatus === 'authenticated' && 'Notification' in window) {
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
      const checkAndNotify = () => {
        if (Notification.permission === 'granted') {
          const now = new Date();
          const hours = now.getHours();
          const minutes = now.getMinutes();
          if ((hours === 9 || hours === 21) && minutes === 0) {
            new Notification('Expense Tracker', {
              body: 'Time to track your recent expenses! 💸',
              icon: '/expense-tracker/icon-192.png'
            });
          }
        }
      };
      const intervalId = setInterval(checkAndNotify, 60000);
      return () => clearInterval(intervalId);
    }
  }, [authStatus]);

  // Logic Variables
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

    if (storageMode === 'supabase') {
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
    if (storageMode === 'supabase') {
      await supabase.from('expenses').delete().eq('id', id);
    }
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const calculateTotal = (filter = null) => {
    return expenses
      .filter(e => !filter || e.categoryId === filter)
      .reduce((sum, e) => sum + e.amount, 0)
      .toFixed(2);
  };

  const getExpensesByDate = (date) => expenses.filter(e => e.date === date);

  // --- VIEWS ---

  const OverviewView = () => (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 text-white border border-slate-700/50 shadow-xl">
        <p className="text-[10px] font-bold text-slate-400 mb-1 tracking-widest uppercase">TOTAL SPENT</p>
        <p className="text-3xl font-black">₹{calculateTotal()}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {categories.map(cat => {
          const total = calculateTotal(cat.id);
          return (
            <div
              key={cat.id}
              onClick={() => setCategoryFilter(categoryFilter === cat.id ? null : cat.id)}
              className={`rounded-2xl p-4 cursor-pointer border transition-all ${
                categoryFilter === cat.id ? 'bg-blue-600 border-blue-400 shadow-lg' : 'bg-slate-900 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{cat.emoji}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{cat.name}</span>
              </div>
              <p className="text-lg font-black text-white">₹{total}</p>
            </div>
          );
        })}
      </div>

      <div className="space-y-2 max-h-[40vh] overflow-y-auto">
        {expenses.filter(e => !categoryFilter || e.categoryId === categoryFilter).map(expense => {
           const cat = categories.find(c => c.id === expense.categoryId);
           return (
             <div key={expense.id} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-3 flex justify-between items-center">
               <div className="flex items-center gap-3">
                 <div className="text-xl">{cat?.emoji}</div>
                 <div>
                   <p className="text-sm font-bold text-white">{expense.description}</p>
                   <p className="text-[10px] text-slate-500">{new Date(expense.date).toLocaleDateString()}</p>
                 </div>
               </div>
               <div className="flex items-center gap-3">
                 <p className="text-sm font-black text-white">₹{expense.amount.toFixed(0)}</p>
                 <button onClick={() => handleDeleteExpense(expense.id)} className="text-slate-600 hover:text-red-400"><X size={14}/></button>
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
        <div className="space-y-4">
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} 
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm" />
          
          <div className="grid grid-cols-4 gap-2">
            {categories.map(cat => (
              <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                className={`p-3 rounded-xl transition-all ${selectedCategory === cat.id ? 'bg-blue-600 shadow-lg' : 'bg-slate-800 hover:bg-slate-700'}`}>
                <div className="text-xl">{cat.emoji}</div>
              </button>
            ))}
          </div>

          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-2xl font-black" />
          
          <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Description"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm" />

          <button onClick={handleAddExpense} disabled={!selectedCategory || !amount}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg disabled:opacity-50">Add Record</button>
          <button onClick={() => setView('overview')} className="w-full text-slate-500 font-bold text-sm">Cancel</button>
        </div>
      </div>
    </div>
  );

  const CalendarView = () => (
    <div className="space-y-4">
       {/* Simplified Calendar for Revert */}
       <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <p className="text-white font-bold mb-4">{currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          <div className="grid grid-cols-7 gap-1">
             {['S','M','T','W','T','F','S'].map(d => <div key={d} className="text-center text-[10px] text-slate-600 font-bold">{d}</div>)}
             {Array.from({length: 31}).map((_, i) => (
                <div key={i} className="aspect-square flex items-center justify-center text-xs text-slate-400 border border-slate-800/50 rounded-lg">{i+1}</div>
             ))}
          </div>
       </div>
       <button onClick={() => setView('overview')} className="w-full text-slate-500 font-bold text-sm">Back</button>
    </div>
  );

  if (authStatus === 'authenticating_check') return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-mono">Loading...</div>;
  if (authStatus === 'login') return <div className="min-h-screen bg-slate-950"><LoginView setAuthStatus={setAuthStatus} setStorageMode={setStorageMode} setUser={setUser} /></div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 font-sans">
      <div className="max-w-md mx-auto">
        <header className="flex justify-between items-center mb-8 pt-4">
           <div>
             <h1 className="text-2xl font-black flex items-center gap-2 uppercase tracking-tighter">
                <TrendingUp className="text-blue-500" /> {storageMode === 'supabase' ? 'Raghu\'s Ledger' : 'Local Ledger'}
             </h1>
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{storageMode === 'supabase' ? 'Supabase Sync Active' : 'Local Storage Only'}</p>
           </div>
           <div className="flex items-center gap-3">
              <button 
                onClick={handleInstallClick} 
                className={`text-[10px] font-black px-4 py-2 rounded-full shadow-lg border transition-all ${isInstalled ? 'bg-slate-800 text-slate-500 border-slate-700' : 'bg-blue-600 text-white border-blue-400 animate-pulse'}`}
              >
                {isInstalled ? 'INSTALLED' : 'INSTALL PWA'}
              </button>
              <button onClick={() => {
                supabase.auth.signOut();
                window.location.reload();
              }} className="bg-slate-900 p-2 rounded-full border border-slate-800 text-slate-500 hover:text-white"><LogOut size={18}/></button>
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
               <button onClick={() => setView('calendar')} className="bg-slate-900 border border-slate-800 px-6 py-4 rounded-2xl">
                 <Calendar />
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
