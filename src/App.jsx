import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, TrendingUp, Calendar, Lock, Download } from 'lucide-react';

// Passcode Component extracted to prevent focus loss and hook issues
const PasscodeView = ({ isSetup, setAuthStatus }) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSetup) {
      if (input.length < 4) {
        setError('Passcode must be at least 4 characters');
        return;
      }
      localStorage.setItem('appPasscode', input);
      setAuthStatus('authenticated');
    } else {
      if (input === localStorage.getItem('appPasscode')) {
        setAuthStatus('authenticated');
      } else {
        setError('Incorrect passcode');
        setInput('');
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 text-center animate-in fade-in duration-300">
      <div className="bg-white/20 backdrop-blur-xl p-6 rounded-3xl border border-white/30 w-full max-w-sm shadow-2xl">
        <div className="mb-6 bg-yellow-400/30 p-4 rounded-2xl border border-white/20 text-left">
          <div className="flex items-center gap-2 mb-2 text-white">
            <Lock size={16} />
            <h2 className="text-sm font-bold drop-shadow-sm">Privacy Notice</h2>
          </div>
          <p className="text-xs text-white/90 leading-relaxed font-medium">
            Data is stored entirely on localstorage. There is no utilisation of private user data stored anywhere. 
            Clearing your browser data will permanently delete your expenses. Your passcode is also stored locally.
          </p>
        </div>
        
        <h2 className="text-2xl font-bold mb-6 text-white drop-shadow-md">{isSetup ? 'Create Passcode' : 'Enter Passcode'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            pattern="[0-9]*"
            inputMode="numeric"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="****"
            className="w-full bg-white/30 border border-white/40 rounded-2xl px-4 py-4 text-center text-3xl tracking-[0.5em] text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all shadow-inner"
            autoFocus
          />
          {error && <p className="text-red-500 text-sm font-bold drop-shadow-sm">{error}</p>}
          <button type="submit" className="w-full bg-white text-yellow-600 font-black py-4 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg">
            {isSetup ? 'Save Passcode' : 'Unlock App'}
          </button>
        </form>
      </div>
    </div>
  );
};

const ExpenseTracker = () => {
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

  const [authStatus, setAuthStatus] = useState(() => {
    const savedPasscode = localStorage.getItem('appPasscode');
    return savedPasscode ? 'authenticating' : 'setup';
  });

  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('expenses');
    return saved ? JSON.parse(saved) : [];
  });

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  const [view, setView] = useState('overview'); 
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (authStatus === 'authenticated') {
      localStorage.setItem('expenses', JSON.stringify(expenses));
    }
  }, [expenses, authStatus]);

  useEffect(() => {
    if (authStatus === 'authenticated') {
      localStorage.setItem('categories', JSON.stringify(categories));
    }
  }, [categories, authStatus]);

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
            const lastNotified = localStorage.getItem('lastNotificationTime');
            const currentHourStr = `${now.toDateString()}-${hours}`;
            if (lastNotified !== currentHourStr) {
              new Notification('Expense Tracker', {
                body: 'Time to track your recent expenses! 💸',
                icon: '/expense-tracker/icon-192.png'
              });
              localStorage.setItem('lastNotificationTime', currentHourStr);
            }
          }
        }
      };
      const intervalId = setInterval(checkAndNotify, 60000);
      checkAndNotify();
      return () => clearInterval(intervalId);
    }
  }, [authStatus]);

  const handleAddExpense = () => {
    if (!selectedCategory || !amount) return;
    const newExpense = {
      id: Date.now(),
      categoryId: selectedCategory,
      amount: parseFloat(amount),
      description: description || 'No description',
      date: selectedDate,
    };
    setExpenses([newExpense, ...expenses]);
    setDescription('');
    setAmount('');
    setSelectedCategory(null);
    setView('overview');
  };

  const handleDeleteExpense = (id) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const getCategory = (id) => categories.find(c => c.id === id);

  const calculateTotal = (filter = null) => {
    return expenses
      .filter(e => !filter || e.categoryId === filter)
      .reduce((sum, e) => sum + e.amount, 0)
      .toFixed(2);
  };

  const getExpensesByDate = (date) => {
    return expenses.filter(e => e.date === date);
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  const OverviewView = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white/30 backdrop-blur-lg rounded-3xl p-6 text-white shadow-xl border border-white/30">
        <p className="text-xs font-black mb-1 opacity-80 tracking-widest uppercase">TOTAL SPENT</p>
        <p className="text-4xl font-black tracking-tight drop-shadow-md">₹{calculateTotal()}</p>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-black text-white/80 uppercase tracking-widest pl-2">Categories</p>
        <div className="grid grid-cols-2 gap-3">
          {categories.map(cat => {
            const total = calculateTotal(cat.id);
            const count = expenses.filter(e => e.categoryId === cat.id).length;
            return (
              <div
                key={cat.id}
                onClick={() => setCategoryFilter(categoryFilter === cat.id ? null : cat.id)}
                className={`rounded-2xl p-4 cursor-pointer transition-all duration-300 shadow-md border ${
                  categoryFilter === cat.id
                    ? 'bg-white scale-105 border-transparent shadow-2xl'
                    : 'bg-white/20 border-white/20 hover:bg-white/30'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{cat.emoji}</span>
                  <span className={`text-[10px] font-black uppercase tracking-tighter ${categoryFilter === cat.id ? 'text-yellow-600' : 'text-white'}`}>{cat.name}</span>
                </div>
                <p className={`text-xl font-black ${categoryFilter === cat.id ? 'text-yellow-700' : 'text-white'} drop-shadow-sm`}>₹{total}</p>
                <p className={`text-[10px] font-bold ${categoryFilter === cat.id ? 'text-yellow-500' : 'text-white/60'}`}>{count} {count === 1 ? 'item' : 'items'}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-black text-white/80 uppercase tracking-widest pl-2">
          {categoryFilter ? `${getCategory(categoryFilter).name} Records` : 'Recent History'}
        </p>
        <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
          {expenses
            .filter(e => !categoryFilter || e.categoryId === categoryFilter)
            .map(expense => {
              const cat = getCategory(expense.categoryId);
              return (
                <div key={expense.id} className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 flex justify-between items-center border border-white/10 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/30 p-2 rounded-xl text-xl shadow-inner">{cat.emoji}</div>
                    <div>
                      <p className="text-sm text-white font-black drop-shadow-sm">{expense.description}</p>
                      <p className="text-[10px] text-white/70 font-bold">{new Date(expense.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-black text-white drop-shadow-md">₹{expense.amount.toFixed(0)}</p>
                    <button onClick={() => handleDeleteExpense(expense.id)} className="p-1.5 bg-white/20 hover:bg-red-500/40 rounded-full transition">
                      <X size={14} className="text-white" />
                    </button>
                  </div>
                </div>
              );
            })}
          {expenses.length === 0 && <p className="text-sm text-white/50 py-10 text-center font-bold">Nothing here yet ✨</p>}
        </div>
      </div>
    </div>
  );

  const AddExpenseView = () => (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-white/20 backdrop-blur-xl rounded-3xl p-6 border border-white/30 shadow-2xl">
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-white/80 mb-2 uppercase tracking-widest">When?</label>
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-white/30 border border-white/40 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/50 shadow-inner" />
          </div>

          <div>
            <label className="block text-[10px] font-black text-white/80 mb-2 uppercase tracking-widest">For What?</label>
            <div className="grid grid-cols-4 gap-2">
              {categories.map(cat => (
                <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                  className={`p-3 rounded-xl transition-all shadow-md ${selectedCategory === cat.id ? 'bg-white scale-110 shadow-2xl' : 'bg-white/20 border border-white/10 hover:bg-white/30'}`}>
                  <div className="text-xl">{cat.emoji}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-white/80 mb-2 uppercase tracking-widest">How much? (₹)</label>
            <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00"
              className="w-full bg-white/30 border border-white/40 rounded-xl px-4 py-3 text-white text-2xl font-black placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-inner" />
          </div>

          <div>
            <label className="block text-[10px] font-black text-white/80 mb-2 uppercase tracking-widest">Detail</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Coffee, lunch, etc..."
              className="w-full bg-white/30 border border-white/40 rounded-xl px-4 py-3 text-white text-sm font-bold placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-inner" />
          </div>

          <div className="flex gap-3 pt-4">
            <button onClick={handleAddExpense} disabled={!selectedCategory || !amount}
              className="flex-1 bg-white text-yellow-600 py-4 rounded-2xl font-black text-sm shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 transition-all">
              Add Record
            </button>
            <button onClick={() => setView('overview')}
              className="flex-1 bg-transparent text-white border border-white/30 py-4 rounded-2xl font-black text-sm hover:bg-white/10 transition-all">
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const CalendarView = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white/30 backdrop-blur-xl rounded-3xl p-6 border border-white/30 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-2 bg-white/20 rounded-full text-white"><ChevronLeft size={20} /></button>
          <p className="text-lg font-black text-white drop-shadow-sm">{currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-2 bg-white/20 rounded-full text-white"><ChevronRight size={20} /></button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} className="text-center text-[10px] font-black text-white/60">{d}</div>)}
          {calendarDays.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} />;
            const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayExpenses = getExpensesByDate(dateStr);
            const hasExpense = dayExpenses.length > 0;
            return (
              <button key={day} onClick={() => setSelectedDate(dateStr)}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-black transition-all ${selectedDate === dateStr ? 'bg-white text-yellow-600 scale-110 shadow-xl' : hasExpense ? 'bg-white/40 text-white shadow-sm' : 'text-white/80 hover:bg-white/20'}`}>
                {day}
                {hasExpense && <div className="w-1 h-1 bg-white rounded-full mt-0.5" />}
              </button>
            );
          })}
        </div>
      </div>
      <button onClick={() => setView('overview')} className="w-full bg-white/20 text-white border border-white/20 py-4 rounded-2xl font-black transition-all hover:bg-white/30">Back to Overview</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FFF4BD] text-white p-4 font-sans selection:bg-white/30">
      <style>{`
        body { 
          background-color: #FFF4BD;
          margin: 0; 
          font-family: 'Inter', sans-serif;
          -webkit-tap-highlight-color: transparent;
        }
        ::-webkit-scrollbar { display: none; }
      `}</style>

      <div className="max-w-md mx-auto">
        <div className="mb-8 flex justify-between items-start pt-4">
          <div>
            <p className="text-[10px] font-black text-yellow-600/80 uppercase tracking-[0.3em] mb-1">CUSTARD TRACKER</p>
            <h1 className="text-3xl font-black text-white drop-shadow-md">Wallet Flow</h1>
          </div>
          {authStatus === 'authenticated' && (
             <div className="flex items-center gap-4 pt-2">
               {deferredPrompt && (
                 <button onClick={handleInstallClick} className="bg-white text-yellow-600 text-[10px] font-black px-4 py-2 rounded-full shadow-lg animate-bounce border border-yellow-200">INSTALL</button>
               )}
               <button onClick={() => setAuthStatus('authenticating')} className="bg-white/20 p-2 rounded-full text-white border border-white/20 shadow-sm"><Lock size={20} /></button>
             </div>
          )}
        </div>

        {authStatus === 'setup' && <PasscodeView isSetup={true} setAuthStatus={setAuthStatus} />}
        {authStatus === 'authenticating' && <PasscodeView isSetup={false} setAuthStatus={setAuthStatus} />}
        
        {authStatus === 'authenticated' && (
          <>
            {view === 'overview' && OverviewView()}
            {view === 'add' && AddExpenseView()}
            {view === 'calendar' && CalendarView()}
          </>
        )}

        {authStatus === 'authenticated' && view === 'overview' && (
          <div className="fixed bottom-6 left-0 right-0 px-6 pointer-events-none">
            <div className="flex gap-4 max-w-md mx-auto pointer-events-auto">
              <button onClick={() => setView('add')} className="flex-1 bg-white text-yellow-600 py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-2xl hover:scale-105 active:scale-95 transition-all">
                <Plus size={20} strokeWidth={3} /> NEW RECORD
              </button>
              <button onClick={() => setView('calendar')} className="flex-1 bg-yellow-400/80 backdrop-blur-md text-white border border-white/30 py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all">
                <Calendar size={20} strokeWidth={3} /> CALENDAR
              </button>
            </div>
          </div>
        )}
      </div>
      {authStatus === 'authenticated' && view === 'overview' && <div className="h-28" />}
    </div>
  );
};

export default ExpenseTracker;
