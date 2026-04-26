import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Star, ChevronUp, Send as SendIcon, Check } from 'lucide-react';
import { fetchUserActivity, SESSION_ID, getAvgRating, type Item, type AuthUser } from '../lib/store';

export function UserProfilePanel({ onClose, onNavigate, authUser }: { onClose: () => void; onNavigate: (id: string) => void; authUser?: AuthUser | null }) {
  const [activity, setActivity] = useState<{ submitted: Item[]; upvoted: Item[]; rated: Item[] }>({ submitted: [], upvoted: [], rated: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserActivity(SESSION_ID)
      .then(setActivity)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const displayName = authUser?.name || 'Anonymous User';
  const displayEmail = authUser?.email || '';
  const displayAvatar = authUser?.avatar || '';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-end bg-[#1E1E2D]/20 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ x: 380 }} animate={{ x: 0 }} exit={{ x: 380 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        onClick={e => e.stopPropagation()} className="w-full max-w-[340px] h-full bg-white border-l border-[#E8ECF0] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-white/95 backdrop-blur z-10 p-4 border-b border-[#E8ECF0] flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-[#1E1E2D]">My Profile</h2>
          <button onClick={onClose} className="p-1 hover:bg-[#F4F5F7] rounded-lg cursor-pointer"><X className="w-4 h-4 text-[#B0B7C3]" /></button>
        </div>
        <div className="p-4 space-y-4">
          {/* Profile Card */}
          <div className="card p-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                {displayAvatar ? (
                  <img src={displayAvatar} alt={displayName} className="w-16 h-16 rounded-2xl object-cover shadow-lg" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00BFA6] to-[#00897B] flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                    {displayName[0]?.toUpperCase() || '?'}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#34A853] flex items-center justify-center shadow-md">
                  <Check className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <div className="text-base font-extrabold text-[#1E1E2D]">{displayName}</div>
                {displayEmail && <div className="text-[10px] text-[#7B8190] mt-0.5">{displayEmail}</div>}
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#00BFA6]/10 text-[#00BFA6]">🔵 Google Account</span>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block w-6 h-6 border-2 border-[#00BFA6] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2">
                {[{ Icon: SendIcon, c: activity.submitted.length, l: 'Submitted', color: 'text-[#00BFA6] bg-[#00BFA6]/10' },
                  { Icon: ChevronUp, c: activity.upvoted.length, l: 'Upvoted', color: 'text-[#F2994A] bg-[#F2994A]/10' },
                  { Icon: Star, c: activity.rated.length, l: 'Reviewed', color: 'text-[#2F80ED] bg-[#2F80ED]/10' }
                ].map(({ Icon, c, l, color }) => (
                  <div key={l} className="card p-3 text-center">
                    <div className={`w-7 h-7 rounded-lg ${color} flex items-center justify-center mx-auto mb-1`}><Icon className="w-3 h-3" /></div>
                    <div className="text-base font-extrabold text-[#1E1E2D]">{c}</div>
                    <div className="text-[8px] text-[#B0B7C3] font-bold uppercase">{l}</div>
                  </div>
                ))}
              </div>
              {activity.submitted.length > 0 && <Sec title="My Submissions">{activity.submitted.map(i => (
                <Row key={i._id} image={i.image} name={i.name} sub={`▲ ${i.upvotes}`} onClick={() => { onNavigate(i._id); onClose(); }} />
              ))}</Sec>}
              {activity.rated.length > 0 && <Sec title="My Reviews">{activity.rated.map(i => {
                const my = i.ratings.find(r => r.userId === SESSION_ID);
                return <Row key={i._id} image={i.image} name={i.name} sub={`★ ${my?.score || '—'}`} onClick={() => { onNavigate(i._id); onClose(); }} />;
              })}</Sec>}
              {activity.upvoted.length > 0 && <Sec title="Upvoted">{activity.upvoted.slice(0, 6).map(i => (
                <Row key={i._id} image={i.image} name={i.name} sub={getAvgRating(i) ? `★ ${getAvgRating(i).toFixed(1)}` : ''} onClick={() => { onNavigate(i._id); onClose(); }} />
              ))}</Sec>}
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function Sec({ title, children }: { title: string; children: React.ReactNode }) {
  return <div><h3 className="text-[9px] font-bold text-[#B0B7C3] uppercase tracking-wider mb-2">{title}</h3><div className="space-y-1">{children}</div></div>;
}

function Row({ image, name, sub, onClick }: { image: string; name: string; sub?: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full card p-2.5 flex items-center gap-2.5 hover:shadow-md transition text-left cursor-pointer group">
      <div className="w-8 h-8 rounded-lg bg-[#F4F5F7] flex items-center justify-center overflow-hidden flex-shrink-0">
        {image ? (
          <img src={image} alt={name} className="w-5 h-5 object-contain" loading="lazy" />
        ) : (
          <span className="text-sm font-bold text-[#00BFA6]">{name[0]}</span>
        )}
      </div>
      <div className="flex-1 min-w-0"><div className="text-xs font-bold text-[#1E1E2D] truncate group-hover:text-[#00BFA6] transition">{name}</div>
        {sub && <div className="text-[10px] text-[#B0B7C3]">{sub}</div>}</div>
    </button>
  );
}
