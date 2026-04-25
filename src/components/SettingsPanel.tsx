import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Moon, Sun, Download, Trash2, RotateCcw, Info } from 'lucide-react';

export function SettingsPanel({ onClose }: { onClose: () => void }) {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('rms_theme') === 'dark');
  const [defaultSort, setDefaultSort] = useState(() => localStorage.getItem('rms_sort') || 'popular');
  const [showConfirm, setShowConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('rms_theme', next ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', next);
    showToast(next ? '🌙 Dark mode enabled' : '☀️ Light mode enabled');
  };

  const handleSortChange = (sort: string) => {
    setDefaultSort(sort);
    localStorage.setItem('rms_sort', sort);
    showToast('Sort preference saved');
  };

  const handleExport = () => {
    const data = {
      profile: localStorage.getItem('rms_profile'),
      items: localStorage.getItem('rms_items_v1'),
      session: localStorage.getItem('rms_session'),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'ratemystuff-backup.json'; a.click();
    URL.revokeObjectURL(url);
    showToast('📦 Data exported successfully');
  };

  const handleClearRatings = () => {
    try {
      const raw = localStorage.getItem('rms_items_v1');
      if (raw) {
        const items = JSON.parse(raw);
        const session = localStorage.getItem('rms_session') || '';
        const cleaned = items.map((item: { ratings: { userId: string }[], upvotedBy: string[], upvotes: number }) => ({
          ...item,
          ratings: item.ratings.filter((r: { userId: string }) => r.userId !== session),
          upvotedBy: item.upvotedBy.filter((u: string) => u !== session),
          upvotes: item.upvotes - (item.upvotedBy.includes(session) ? 1 : 0),
        }));
        localStorage.setItem('rms_items_v1', JSON.stringify(cleaned));
      }
      showToast('🗑️ Your ratings cleared');
    } catch { showToast('Failed to clear ratings'); }
    setShowConfirm(null);
  };

  const handleResetAll = () => {
    localStorage.removeItem('rms_items_v1');
    localStorage.removeItem('rms_profile');
    localStorage.removeItem('rms_theme');
    localStorage.removeItem('rms_sort');
    document.documentElement.classList.remove('dark');
    showToast('♻️ All data reset. Reload to see changes.');
    setShowConfirm(null);
    setTimeout(() => window.location.reload(), 1500);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-end bg-[#1E1E2D]/20 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ x: 380 }} animate={{ x: 0 }} exit={{ x: 380 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        onClick={e => e.stopPropagation()} className="w-full max-w-[340px] h-full bg-white border-l border-[#E8ECF0] overflow-y-auto shadow-xl dark:bg-[#1a1a2e] dark:border-[#2a2a3e]">
        <div className="sticky top-0 bg-white/95 backdrop-blur z-10 p-4 border-b border-[#E8ECF0] flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-[#1E1E2D]">⚙️ Settings</h2>
          <button onClick={onClose} className="p-1 hover:bg-[#F4F5F7] rounded-lg cursor-pointer"><X className="w-4 h-4 text-[#B0B7C3]" /></button>
        </div>

        <div className="p-4 space-y-4">
          {/* Appearance */}
          <div className="card p-4">
            <h3 className="text-[10px] font-bold text-[#B0B7C3] uppercase tracking-wider mb-3">Appearance</h3>
            <button onClick={toggleDarkMode}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-[#F4F5F7] transition cursor-pointer">
              <div className="flex items-center gap-3">
                {darkMode ? <Moon className="w-4 h-4 text-[#9B51E0]" /> : <Sun className="w-4 h-4 text-[#F2994A]" />}
                <div>
                  <div className="text-xs font-bold text-[#1E1E2D]">Dark Mode</div>
                  <div className="text-[10px] text-[#B0B7C3]">{darkMode ? 'Currently on' : 'Currently off'}</div>
                </div>
              </div>
              <div className={`w-10 h-5 rounded-full transition-colors flex items-center px-0.5 ${darkMode ? 'bg-[#9B51E0]' : 'bg-[#E8ECF0]'}`}>
                <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${darkMode ? 'translate-x-5' : ''}`} />
              </div>
            </button>
          </div>

          {/* Sort Preference */}
          <div className="card p-4">
            <h3 className="text-[10px] font-bold text-[#B0B7C3] uppercase tracking-wider mb-3">Default Sort</h3>
            <div className="flex gap-2">
              {[{ val: 'popular', label: '🔥 Popular' }, { val: 'recent', label: '🕐 Recent' }, { val: 'rating', label: '⭐ Top Rated' }].map(s => (
                <button key={s.val} onClick={() => handleSortChange(s.val)}
                  className={`flex-1 py-2 px-3 text-[10px] font-bold rounded-lg transition cursor-pointer ${defaultSort === s.val ? 'bg-[#00BFA6] text-white' : 'bg-[#F4F5F7] text-[#7B8190] hover:bg-[#E8ECF0]'}`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Data Management */}
          <div className="card p-4">
            <h3 className="text-[10px] font-bold text-[#B0B7C3] uppercase tracking-wider mb-3">Data Management</h3>
            <div className="space-y-2">
              <button onClick={handleExport}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[#F4F5F7] transition cursor-pointer text-left">
                <div className="w-8 h-8 rounded-lg bg-[#2F80ED]/10 flex items-center justify-center"><Download className="w-4 h-4 text-[#2F80ED]" /></div>
                <div><div className="text-xs font-bold text-[#1E1E2D]">Export Data</div><div className="text-[10px] text-[#B0B7C3]">Download your data as JSON</div></div>
              </button>

              {showConfirm === 'ratings' ? (
                <div className="p-3 bg-[#EB5757]/5 rounded-lg border border-[#EB5757]/20">
                  <p className="text-[11px] text-[#EB5757] font-bold mb-2">Clear all your ratings and upvotes?</p>
                  <div className="flex gap-2">
                    <button onClick={handleClearRatings} className="px-3 py-1.5 bg-[#EB5757] text-white text-[10px] font-bold rounded-lg cursor-pointer">Yes, clear</button>
                    <button onClick={() => setShowConfirm(null)} className="px-3 py-1.5 text-[10px] text-[#7B8190] font-bold cursor-pointer">Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowConfirm('ratings')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[#F4F5F7] transition cursor-pointer text-left">
                  <div className="w-8 h-8 rounded-lg bg-[#F2994A]/10 flex items-center justify-center"><Trash2 className="w-4 h-4 text-[#F2994A]" /></div>
                  <div><div className="text-xs font-bold text-[#1E1E2D]">Clear My Ratings</div><div className="text-[10px] text-[#B0B7C3]">Remove all your reviews & upvotes</div></div>
                </button>
              )}

              {showConfirm === 'reset' ? (
                <div className="p-3 bg-[#EB5757]/5 rounded-lg border border-[#EB5757]/20">
                  <p className="text-[11px] text-[#EB5757] font-bold mb-2">Reset everything? This cannot be undone.</p>
                  <div className="flex gap-2">
                    <button onClick={handleResetAll} className="px-3 py-1.5 bg-[#EB5757] text-white text-[10px] font-bold rounded-lg cursor-pointer">Yes, reset</button>
                    <button onClick={() => setShowConfirm(null)} className="px-3 py-1.5 text-[10px] text-[#7B8190] font-bold cursor-pointer">Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowConfirm('reset')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[#EB5757]/5 transition cursor-pointer text-left">
                  <div className="w-8 h-8 rounded-lg bg-[#EB5757]/10 flex items-center justify-center"><RotateCcw className="w-4 h-4 text-[#EB5757]" /></div>
                  <div><div className="text-xs font-bold text-[#EB5757]">Reset All Data</div><div className="text-[10px] text-[#B0B7C3]">Clear everything and start fresh</div></div>
                </button>
              )}
            </div>
          </div>

          {/* About */}
          <div className="card p-4">
            <h3 className="text-[10px] font-bold text-[#B0B7C3] uppercase tracking-wider mb-3">About</h3>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00BFA6] to-[#00897B] flex items-center justify-center">
                <span className="text-white font-black text-sm">R</span>
              </div>
              <div>
                <div className="text-sm font-extrabold text-[#1E1E2D]">RateMyStuff</div>
                <div className="text-[10px] text-[#B0B7C3]">v1.0.0</div>
              </div>
            </div>
            <div className="flex items-start gap-2 p-2.5 bg-[#F4F5F7] rounded-lg">
              <Info className="w-3.5 h-3.5 text-[#00BFA6] mt-0.5 flex-shrink-0" />
              <p className="text-[10px] text-[#7B8190] leading-relaxed">
                Rate and review anything — from tech products to football players. Built with React, Express & MongoDB.
              </p>
            </div>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-[#1E1E2D] text-white text-xs font-bold rounded-lg shadow-xl z-[60]">
            {toast}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
