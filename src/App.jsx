import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, TrendingUp, Calendar, Lock } from 'lucide-react';

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

  // Passcode State
  const [authStatus, setAuthStatus] = useState(() => {
    const savedPasscode = localStorage.getItem('appPasscode');
    return savedPasscode ? 'authenticating' : 'setup';
  });

  // State
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('expenses');
    return saved ? JSON.parse(saved) : [];
  });

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  const [view, setView] = useState('overview'); // 'overview', 'add', 'calendar'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Persist to localStorage
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

  // Notifications Logic
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
          
          // Trigger if it's 9:00 AM or 9:00 PM
          if ((hours === 9 || hours === 21) && minutes === 0) {
            const lastNotified = localStorage.getItem('lastNotificationTime');
            const currentHourStr = `${now.toDateString()}-${hours}`;
            
            if (lastNotified !== currentHourStr) {
              new Notification('Expense Tracker', {
                body: 'Time to track your recent expenses! 💸',
                icon: '/icon.png'
              });
              localStorage.setItem('lastNotificationTime', currentHourStr);
            }
          }
        }
      };

      const intervalId = setInterval(checkAndNotify, 60000);
      checkAndNotify(); // Check immediately on load
      
      return () => clearInterval(intervalId);
    }
  }, [authStatus]);

  // Add expense
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

  // Delete expense
  const handleDeleteExpense = (id) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  // Get category by ID
  const getCategory = (id) => categories.find(c => c.id === id);

  // Calculate totals
  const calculateTotal = (filter = null) => {
    return expenses
      .filter(e => !filter || e.categoryId === filter)
      .reduce((sum, e) => sum + e.amount, 0)
      .toFixed(2);
  };

  // Get expenses by date
  const getExpensesByDate = (date) => {
    return expenses.filter(e => e.date === date);
  };

  // Get expenses by month
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // Calendar setup
  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const calendarDays = [];

  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  // Passcode Component
  const PasscodeView = ({ isSetup }) => {
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
        <div className="bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50 w-full max-w-sm shadow-2xl">
          <div className="mb-6 bg-slate-950/50 p-4 rounded-xl border border-yellow-900/30 text-left">
            <div className="flex items-center gap-2 mb-2 text-yellow-500">
              <Lock size={16} />
              <h2 className="text-sm font-bold">Privacy Notice</h2>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Data is stored entirely on localstorage. There is no utilisation of private user data stored anywhere. 
              Clearing your browser data will permanently delete your expenses. Your passcode is also stored locally.
            </p>
          </div>
          
          <h2 className="text-2xl font-bold mb-6 text-white">{isSetup ? 'Create Passcode' : 'Enter Passcode'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              pattern="[0-9]*"
              inputMode="numeric"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="****"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-4 text-center text-3xl tracking-[0.5em] text-white focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-500 transition-all"
              autoFocus
            />
            {error && <p className="text-red-400 text-sm font-medium">{error}</p>}
            <button type="submit" className="w-full bg-white text-slate-900 font-bold py-4 rounded-xl hover:bg-slate-200 active:scale-[0.98] transition-all">
              {isSetup ? 'Save Passcode' : 'Unlock App'}
            </button>
          </form>
        </div>
      </div>
    );
  };

  // Standard Views
  const OverviewView = () => (
    <div className="space-y-4">
      {/* Total Summary */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-4 text-white">
        <p className="text-sm text-slate-400 mb-1 font-mono">TOTAL SPENT</p>
        <p className="text-3xl font-bold tracking-tight">₹{calculateTotal()}</p>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-2">
        <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">By Category</p>
        <div className="grid grid-cols-2 gap-2">
          {categories.map(cat => {
            const total = calculateTotal(cat.id);
            const count = expenses.filter(e => e.categoryId === cat.id).length;
            return (
              <div
                key={cat.id}
                onClick={() => {
                  setCategoryFilter(categoryFilter === cat.id ? null : cat.id);
                }}
                className={`rounded-lg p-3 cursor-pointer transition-all ${
                  categoryFilter === cat.id
                    ? 'ring-2 ring-offset-2 ring-slate-600 bg-slate-800'
                    : 'bg-slate-900 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{cat.emoji}</span>
                  <span className="text-xs font-mono text-slate-400">{cat.name}</span>
                </div>
                <p className="text-lg font-bold text-white">₹{total}</p>
                <p className="text-xs text-slate-500">{count} {count === 1 ? 'item' : 'items'}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filtered Expenses */}
      {(categoryFilter || true) && (
        <div className="space-y-2">
          <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">
            {categoryFilter ? `${getCategory(categoryFilter).name} Expenses` : 'All Expenses'}
          </p>
          <div className="space-y-1 max-h-[300px] overflow-y-auto">
            {expenses
              .filter(e => !categoryFilter || e.categoryId === categoryFilter)
              .map(expense => {
                const cat = getCategory(expense.categoryId);
                return (
                  <div key={expense.id} className="bg-slate-900 rounded p-2 flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm">{cat.emoji}</span>
                        <span className="text-xs font-mono text-slate-400">{new Date(expense.date).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-white font-semibold">{expense.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-mono font-bold text-white">₹{expense.amount.toFixed(2)}</p>
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="p-1 hover:bg-slate-700 rounded transition"
                      >
                        <X size={14} className="text-slate-400" />
                      </button>
                    </div>
                  </div>
                );
              })}
            {expenses.length === 0 && (
              <p className="text-xs text-slate-500 py-4 text-center">No expenses yet. Add one to get started.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const AddExpenseView = () => (
    <div className="space-y-4">
      {/* Date Picker */}
      <div>
        <label className="block text-xs font-mono text-slate-400 mb-2 uppercase">Date</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-slate-500"
        />
      </div>

      {/* Category Selector */}
      <div>
        <label className="block text-xs font-mono text-slate-400 mb-2 uppercase">Category</label>
        <div className="grid grid-cols-2 gap-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`p-3 rounded-lg transition-all text-center ${
                selectedCategory === cat.id
                  ? 'ring-2 ring-offset-2 ring-white bg-slate-700'
                  : 'bg-slate-900 hover:bg-slate-800'
              }`}
            >
              <div className="text-2xl mb-1">{cat.emoji}</div>
              <p className="text-xs font-mono text-slate-300">{cat.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Amount */}
      <div>
        <label className="block text-xs font-mono text-slate-400 mb-2 uppercase">Amount (₹)</label>
        <input
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-slate-500"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-mono text-slate-400 mb-2 uppercase">Description (optional)</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What was this for?"
          className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-slate-500"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleAddExpense}
          disabled={!selectedCategory || !amount}
          className="flex-1 bg-white text-slate-900 py-2 rounded font-semibold text-sm hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Add Expense
        </button>
        <button
          onClick={() => setView('overview')}
          className="flex-1 bg-slate-900 text-white border border-slate-700 py-2 rounded font-semibold text-sm hover:bg-slate-800 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  const CalendarView = () => (
    <div className="space-y-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          className="p-2 hover:bg-slate-800 rounded transition"
        >
          <ChevronLeft size={18} className="text-slate-400" />
        </button>
        <p className="text-sm font-mono font-semibold text-white">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          className="p-2 hover:bg-slate-800 rounded transition"
        >
          <ChevronRight size={18} className="text-slate-400" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <div key={d} className="text-center text-xs font-mono text-slate-500 py-2">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} className="aspect-square" />;
            
            const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayExpenses = getExpensesByDate(dateStr);
            const total = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
            
            return (
              <button
                key={day}
                onClick={() => setSelectedDate(dateStr)}
                className={`aspect-square rounded-lg p-1 text-xs transition-all flex flex-col items-center justify-center ${
                  selectedDate === dateStr
                    ? 'bg-white text-slate-900 ring-2 ring-offset-2 ring-white'
                    : dayExpenses.length > 0
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-900 text-slate-500 hover:bg-slate-800'
                }`}
              >
                <span className="font-semibold">{day}</span>
                {total > 0 && <span className="text-xs opacity-75">₹{total.toFixed(0)}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Expenses */}
      <div className="space-y-2">
        <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">
          {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <div className="space-y-1">
          {getExpensesByDate(selectedDate).length > 0 ? (
            <>
              {getExpensesByDate(selectedDate).map(expense => {
                const cat = getCategory(expense.categoryId);
                return (
                  <div key={expense.id} className="bg-slate-900 rounded p-2 flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm">{cat.emoji}</span>
                        <span className="text-xs font-mono text-slate-400">{cat.name}</span>
                      </div>
                      <p className="text-sm text-white font-semibold">{expense.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-mono font-bold text-white">₹{expense.amount.toFixed(2)}</p>
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="p-1 hover:bg-slate-700 rounded transition"
                      >
                        <X size={14} className="text-slate-400" />
                      </button>
                    </div>
                  </div>
                );
              })}
              <div className="bg-slate-800 rounded p-2 mt-2">
                <p className="text-xs text-slate-400">Total for this day</p>
                <p className="text-lg font-mono font-bold text-white">₹{getExpensesByDate(selectedDate).reduce((sum, e) => sum + e.amount, 0).toFixed(2)}</p>
              </div>
            </>
          ) : (
            <p className="text-xs text-slate-500 py-4 text-center">No expenses on this date.</p>
          )}
        </div>
      </div>

      <button
        onClick={() => setView('overview')}
        className="w-full bg-slate-900 text-white border border-slate-700 py-2 rounded font-semibold text-sm hover:bg-slate-800 transition"
      >
        Back
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white p-4">
      <style>{`
        body { 
          margin: 0; 
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background: linear-gradient(to bottom, #030712, #0f172a);
        }
      `}</style>

      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">Expense Tracker</p>
            <h1 className="text-2xl font-bold tracking-tight">Track Spend</h1>
          </div>
          {authStatus === 'authenticated' && (
             <button 
                onClick={() => setAuthStatus('authenticating')}
                className="text-slate-500 hover:text-white transition"
             >
               <Lock size={20} />
             </button>
          )}
        </div>

        {/* Views */}
        {authStatus === 'setup' && <PasscodeView isSetup={true} />}
        {authStatus === 'authenticating' && <PasscodeView isSetup={false} />}
        
        {authStatus === 'authenticated' && (
          <>
            {view === 'overview' && <OverviewView />}
            {view === 'add' && <AddExpenseView />}
            {view === 'calendar' && <CalendarView />}
          </>
        )}

        {/* Footer Navigation */}
        {authStatus === 'authenticated' && view === 'overview' && (
          <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950 to-transparent px-4 py-4 pointer-events-none">
            <div className="flex gap-2 max-w-md mx-auto pointer-events-auto">
              <button
                onClick={() => setView('add')}
                className="flex-1 bg-white text-slate-900 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-100 shadow-xl transition-all active:scale-[0.98]"
              >
                <Plus size={18} /> Add
              </button>
              <button
                onClick={() => setView('calendar')}
                className="flex-1 bg-slate-800 text-white border border-slate-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-700 shadow-xl transition-all active:scale-[0.98]"
              >
                <Calendar size={18} /> Calendar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Padding for button nav */}
      {authStatus === 'authenticated' && view === 'overview' && <div className="h-24" />}
    </div>
  );
};

export default ExpenseTracker;
