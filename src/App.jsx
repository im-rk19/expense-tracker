import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, IndianRupee, Calendar as CalendarIcon, LogOut, Download, Upload, Trash2, PieChart, Info, Smartphone, TrendingUp, Zap } from 'lucide-react';

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

const LoginView = ({ onLogin, deferredPrompt }) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  const handleUnlock = (e) => {
    e.preventDefault();
    const saved = localStorage.getItem('appPasscode');
    if (!saved) {
      if (passcode.length < 4) { setError('Use 4+ digits'); return; }
      localStorage.setItem('appPasscode', passcode);
      onLogin();
    } else {
      if (passcode === saved) onLogin();
      else { setError('Incorrect'); setPasscode(''); }
    }
  };

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
    } else {
      alert("Browser Install Not Ready Yet.\n\nIF ON ANDROID: Wait 5 seconds and try again.\n\nIF ON IPHONE: Safari blocks the 'Install' button. You MUST tap the Share icon (square with arrow) and select 'Add to Home Screen'.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-6">
      <div className="w-full max-w-sm text-center">
        <div className="bg-slate-900 border-2 border-red-600/50 w-20 h-20 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(220,38,38,0.3)]">
          <IndianRupee className="text-red-500" size={40} />
        </div>
        <h1 className="text-2xl font-black text-white uppercase tracking-tighter mb-1">Expense Tracker</h1>
        <p className="text-slate-500 text-[10px] uppercase tracking-widest mb-10">Secure Local Ledger</p>
        <form onSubmit={handleUnlock} className="space-y-6">
          <input 
            type="password" pattern="[0-9]*" inputMode="numeric" placeholder="••••" 
            value={passcode} onChange={e => setPasscode(e.target.value)} 
            className="w-full bg-slate-950 border-b-2 border-slate-800 py-4 text-center text-4xl text-white outline-none focus:border-red-600"
            autoFocus 
          />
          {error && <p className="text-red-500 text-[10px] font-bold uppercase">{error}</p>}
          <button type="submit" className="w-full bg-red-600 text-white font-black py-4 rounded-2xl uppercase tracking-widest shadow-lg active:scale-95 transition-transform">Unlock</button>
        </form>

        <div className="mt-12 pt-6 border-t border-slate-900">
           <button onClick={handleInstall} 
             className={`w-full py-3 rounded-xl uppercase text-[9px] font-black tracking-widest flex items-center justify-center gap-2 transition-all ${deferredPrompt ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-900 border border-slate-800 text-slate-500'}`}>
             <Smartphone size={12}/> {deferredPrompt ? 'Official App Install Ready!' : 'Install to Home Screen'}
             {deferredPrompt && <Zap size={10} fill="currentColor" />}
           </button>
           {!deferredPrompt && <p className="text-[8px] text-slate-700 mt-2 uppercase font-black tracking-widest">Wait 5s for auto-install button to turn red</p>}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [isAuth, setIsAuth] = useState(false);
  const [view, setView] = useState('overview');
  const [expenses, setExpenses] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(normalizeDate(new Date()));
  const [categoryFilter, setCategoryFilter] = useState(null);

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('local_expenses_v2');
    if (saved) {
      try { setExpenses(JSON.parse(saved)); } catch(e) { setExpenses([]); }
    }
    if (localStorage.getItem('isLoggedIn') === 'true') setIsAuth(true);

    const handlePrompt = (e) => {
      console.log("SUCCESS: PWA Prompt Captured");
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handlePrompt);
    return () => window.removeEventListener('beforeinstallprompt', handlePrompt);
  }, []);

  const save = (data) => {
    setExpenses(data);
    localStorage.setItem('local_expenses_v2', JSON.stringify(data));
  };

  const add = () => {
    if (!amount || !selectedCategory) return;
    const item = { id: Date.now().toString(), amount: parseFloat(amount), description: description || 'Misc', categoryId: selectedCategory, date: selectedDate };
    save([item, ...expenses]);
    setAmount(''); setDescription(''); setSelectedCategory(null); setView('overview');
  };

  const del = (id) => save(expenses.filter(e => e.id !== id));

  const exportCSV = () => {
    const csv = ["Date,Amount,Category,Remark", ...expenses.map(e => `"${e.date}",${e.amount},"${DEFAULT_CATEGORIES.find(c => c.id === e.categoryId)?.name || 'Misc'}","${String(e.description).replace(/"/g, '""')}"`)].join("\n");
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'Expenses.csv'; a.click();
  };

  const importCSV = () => {
    const input = document.createElement('input'); input.type = 'file'; input.accept = '.csv';
    input.onchange = (e) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const lines = ev.target.result.split('\n');
        const items = lines.slice(1).map(l => {
          const p = l.split(','); if (p.length < 4) return null;
          return { id: Math.random().toString(), date: p[0].replace(/"/g, ''), amount: parseFloat(p[1]), categoryId: DEFAULT_CATEGORIES.find(c => c.name === p[2].replace(/"/g, ''))?.id || 10, description: p[3].replace(/"/g, '') };
        }).filter(Boolean);
        save([...items, ...expenses]);
      };
      reader.readAsText(e.target.files[0]);
    };
    input.click();
  };

  const filtered = expenses.filter(e => {
    const d = new Date(e.date);
    const monthMatch = d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear();
    const catMatch = !categoryFilter || e.categoryId === categoryFilter;
    return monthMatch && catMatch;
  });

  const total = filtered.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0).toFixed(0);

  if (!isAuth) return <LoginView onLogin={() => { localStorage.setItem('isLoggedIn', 'true'); setIsAuth(true); }} deferredPrompt={deferredPrompt} />;

  return (
    <div className="min-h-screen bg-black text-white p-4 pb-32 font-sans select-none overflow-x-hidden">
      <div className="max-w-md mx-auto">
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-red-600/10 p-2 rounded-xl border border-red-600/20 shadow-[0_0_15px_rgba(220,38,38,0.1)]">
              <IndianRupee className="text-red-500" size={20} strokeWidth={3} />
            </div>
            <h1 className="text-lg font-black uppercase tracking-tighter leading-none">Tracker</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={importCSV} className="p-2 text-slate-500 hover:text-white transition-colors"><Upload size={18}/></button>
            <button onClick={exportCSV} className="p-2 text-slate-500 hover:text-white transition-colors"><Download size={18}/></button>
            <button onClick={() => { localStorage.removeItem('isLoggedIn'); window.location.reload(); }} className="p-2 text-slate-500 hover:text-red-500 transition-colors"><LogOut size={18}/></button>
          </div>
        </header>

        <div className="mb-6 space-y-4">
          <div className="flex justify-between items-center bg-slate-900/50 border border-slate-800 rounded-2xl px-6 py-3 shadow-inner">
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear() - 1, currentMonth.getMonth()))} className="text-slate-600 hover:text-red-500 transition-colors"><ChevronLeft size={20}/></button>
            <span className="text-sm font-black tracking-[0.3em]">{currentMonth.getFullYear()}</span>
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear() + 1, currentMonth.getMonth()))} className="text-slate-600 hover:text-red-500 transition-colors"><ChevronRight size={20}/></button>
          </div>
          
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"].map((m, i) => (
              <button key={m} onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), i, 1))}
                className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all border flex-shrink-0 ${currentMonth.getMonth() === i ? 'bg-red-600 border-red-400 text-white shadow-lg shadow-red-600/20' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>{m}</button>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 mb-6 shadow-xl relative overflow-hidden group transition-all hover:border-red-600/50">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 blur-3xl -mr-16 -mt-16 group-hover:bg-red-600/20 transition-all"></div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Spent this month</p>
          <p className="text-4xl font-black tracking-tighter">₹{total}</p>
        </div>

        {view === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
              {DEFAULT_CATEGORIES.map(cat => {
                const catTotal = filtered.filter(e => e.categoryId === cat.id).reduce((s, e) => s + (parseFloat(e.amount) || 0), 0).toFixed(0);
                return (
                  <div key={cat.id} onClick={() => setCategoryFilter(categoryFilter === cat.id ? null : cat.id)}
                    className={`rounded-2xl p-4 border transition-all ${categoryFilter === cat.id ? 'bg-red-600 border-red-400 shadow-md' : 'bg-slate-900 border-slate-800'}`}>
                    <div className="flex items-center gap-2 mb-1"><span className="text-xl">{cat.emoji}</span><span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">{cat.name}</span></div>
                    <p className="text-xl font-black">₹{catTotal}</p>
                  </div>
                );
              })}
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-2">Transactions</p>
              {filtered.map(e => (
                <div key={e.id} className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex justify-between items-center active:scale-[0.98] transition-all">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{DEFAULT_CATEGORIES.find(c => c.id === e.categoryId)?.emoji}</span>
                    <div><p className="text-sm font-bold leading-none mb-1">{e.description}</p><p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">{e.date}</p></div>
                  </div>
                  <div className="flex items-center gap-4"><p className="text-lg font-black">₹{e.amount.toFixed(0)}</p><button onClick={() => del(e.id)} className="text-slate-700 hover:text-red-500 p-1"><X size={16}/></button></div>
                </div>
              ))}
              {filtered.length === 0 && <div className="py-20 text-center opacity-20"><PieChart size={40} className="mx-auto mb-2" /><p className="text-[10px] font-black uppercase tracking-widest">No records</p></div>}
            </div>
          </div>
        )}

        {view === 'calendar' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
               <div className="grid grid-cols-7 gap-1">
                  {['S','M','T','W','T','F','S'].map(d => <div key={d} className="text-center text-[10px] text-slate-600 font-bold mb-3">{d}</div>)}
                  {Array.from({ length: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate() }, (_, i) => i + 1).map(day => {
                    const dStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const has = expenses.some(e => e.date === dStr);
                    return (
                      <button key={day} onClick={() => setSelectedDate(dStr)} className={`aspect-square flex flex-col items-center justify-center text-xs rounded-xl transition-all relative ${selectedDate === dStr ? 'bg-red-600 font-black' : has ? 'bg-slate-800 font-bold' : 'text-slate-600'}`}>{day}{has && <div className="absolute bottom-1 w-1 h-1 bg-red-400 rounded-full" />}</button>
                    );
                  })}
               </div>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-2">{selectedDate}</p>
              {expenses.filter(e => e.date === selectedDate).map(e => (
                <div key={e.id} className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex justify-between items-center">
                  <div className="flex items-center gap-3"><span className="text-xl">{DEFAULT_CATEGORIES.find(c => c.id === e.categoryId)?.emoji}</span><p className="text-sm font-bold">{e.description}</p></div>
                  <p className="text-lg font-black">₹{e.amount}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'add' && (
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95">
            <h2 className="text-red-500 font-black mb-6 uppercase text-[10px] text-center tracking-[0.2em]">Record Spend</h2>
            <div className="space-y-6">
              <div className="space-y-1">
                <p className="text-[8px] font-black text-slate-500 uppercase ml-2 tracking-widest">Date</p>
                <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full bg-black border border-slate-800 rounded-2xl px-5 py-4 text-white outline-none focus:border-red-600" />
              </div>
              <div className="grid grid-cols-5 gap-2">{DEFAULT_CATEGORIES.map(c => <button key={c.id} onClick={() => setSelectedCategory(c.id)} className={`p-4 rounded-2xl transition-all ${selectedCategory === c.id ? 'bg-red-600 scale-110 shadow-lg shadow-red-600/20' : 'bg-black border border-slate-800'}`}><div className="text-2xl">{c.emoji}</div></button>)}</div>
              <div className="space-y-1">
                <p className="text-[8px] font-black text-slate-500 uppercase ml-2 tracking-widest">Amount</p>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="₹ 0.00" className="w-full bg-black border border-slate-800 rounded-2xl px-5 py-5 text-white text-3xl font-black outline-none focus:border-red-600" />
              </div>
              <div className="space-y-1">
                <p className="text-[8px] font-black text-slate-500 uppercase ml-2 tracking-widest">Remark</p>
                <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Spent on..." className="w-full bg-black border border-slate-800 rounded-2xl px-5 py-4 text-white outline-none focus:border-red-600" />
              </div>
              <div className="flex gap-3"><button onClick={add} disabled={!amount || !selectedCategory} className="flex-[2] bg-red-600 py-5 rounded-2xl font-black uppercase disabled:opacity-30 tracking-widest shadow-xl shadow-red-600/20">Save</button><button onClick={() => setView('overview')} className="flex-1 bg-slate-800 py-5 rounded-2xl font-black uppercase text-[10px]">Cancel</button></div>
            </div>
          </div>
        )}

        <div className="fixed bottom-8 left-0 right-0 px-8 z-50">
          <div className="max-w-md mx-auto bg-slate-900/90 backdrop-blur-xl border border-slate-800/50 p-2 rounded-[2rem] shadow-2xl flex gap-2">
            <button onClick={() => setView('overview')} className={`flex-1 py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all ${view === 'overview' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-slate-500'}`}><TrendingUp size={20} /></button>
            <button onClick={() => setView('add')} className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-red-600/40 -mt-8 border-4 border-black active:scale-90 transition-all"><Plus size={32} strokeWidth={4} /></button>
            <button onClick={() => setView('calendar')} className={`flex-1 py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all ${view === 'calendar' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-slate-500'}`}><CalendarIcon size={20} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
