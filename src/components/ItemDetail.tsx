import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronUp, ExternalLink, Star as StarIcon, TrendingUp, Users, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { toggleUpvote, addRating, SESSION_ID, getAvgRating, getRatingDistribution, timeAgo, getUserProfile, type Item, type AuthUser } from '../lib/store';

const PIE_COLORS = ['#00BFA6', '#2F80ED', '#F2994A', '#EB5757', '#9B51E0'];

interface Props { item: Item; onBack: () => void; onUpdate: (item: Item) => void; authUser?: AuthUser | null; }

export function ItemDetail({ item, onBack, onUpdate, authUser }: Props) {
  const [authorName, setAuthorName] = useState(authUser?.name || getUserProfile().name || '');
  const [ratingScore, setRatingScore] = useState(0);
  const [ratingHover, setRatingHover] = useState(0);
  const [ratingReview, setRatingReview] = useState('');
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const hasUpvoted = item.upvotedBy.includes(SESSION_ID);
  const avg = getAvgRating(item);
  const dist = getRatingDistribution(item);
  const total = item.ratings.length;
  const myRating = item.ratings.find(r => r.userId === SESSION_ID);

  // Chart data
  const ratingBarData = [5, 4, 3, 2, 1].map(s => ({ star: `${s}★`, count: dist[s - 1] }));
  const ratingPieData = [5, 4, 3, 2, 1].map(s => ({ name: `${s}★`, value: dist[s - 1] })).filter(d => d.value > 0);
  const trendData = (() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const base = Math.max(1, Math.floor(total / 3));
    // eslint-disable-next-line react-hooks/purity
    return months.map((m, i) => ({ month: m, feedback: Math.max(0, Math.floor(base * (0.3 + Math.random() * 0.7) + (i >= 3 ? total * 0.2 : 0))) }));
  })();

  const handleUpvote = async () => {
    try {
      const updated = await toggleUpvote(item._id);
      onUpdate(updated);
    } catch (err) {
      console.error('Failed to upvote:', err);
    }
  };

  const handleRating = async () => {
    if (ratingScore === 0 || !authorName.trim()) return;
    try {
      setSubmitting(true);
      const updated = await addRating(item._id, authorName.trim(), ratingScore, ratingReview.trim());
      onUpdate(updated);
      setShowRatingForm(false);
      setRatingScore(0);
      setRatingReview('');
    } catch (err) {
      console.error('Failed to submit rating:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-[1050px] mx-auto pb-8">
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-bold text-[#7B8190] hover:text-[#00BFA6] mb-4 transition cursor-pointer">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Listings
      </button>

      {/* ── Header Card ── */}
      <div className="card-teal p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {item.image ? (
              <img src={item.image} alt={item.name} className="w-10 h-10 object-contain" loading="lazy" />
            ) : (
              <span className="text-3xl font-bold">{item.name[0]}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg md:text-xl font-extrabold text-white">{item.name}</h1>
            <p className="text-sm text-white/70 mt-1">{item.tagline}</p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-white/20 text-white">{item.category}</span>
              <span className="text-[10px] text-white/40">{timeAgo(item.submittedAt)}</span>
              {item.link && <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-white/70 hover:text-white flex items-center gap-0.5">Visit <ExternalLink className="w-3 h-3" /></a>}
            </div>
          </div>
          <button onClick={handleUpvote}
            className={`flex flex-col items-center gap-0.5 px-4 py-2.5 rounded-xl font-bold cursor-pointer transition ${hasUpvoted ? 'bg-white text-[#00BFA6] shadow-md' : 'bg-white/15 text-white hover:bg-white/25'}`}>
            <ChevronUp className="w-5 h-5 stroke-[3]" /><span className="text-sm font-extrabold">{item.upvotes}</span>
          </button>
        </div>
      </div>

      {/* ── Stat Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        <div className="stat-card flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#00BFA6]/10 flex items-center justify-center"><StarIcon className="w-4 h-4 text-[#00BFA6]" /></div>
          <div><div className="stat-label">Avg Rating</div><div className="text-lg font-extrabold text-[#1E1E2D]">{avg ? avg.toFixed(1) : '—'}<span className="text-xs text-[#B0B7C3] font-medium">/5</span></div></div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#2F80ED]/10 flex items-center justify-center"><Users className="w-4 h-4 text-[#2F80ED]" /></div>
          <div><div className="stat-label">Reviews</div><div className="text-lg font-extrabold text-[#1E1E2D]">{total}</div></div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#F2994A]/10 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-[#F2994A]" /></div>
          <div><div className="stat-label">Upvotes</div><div className="text-lg font-extrabold text-[#1E1E2D]">{item.upvotes}</div></div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#9B51E0]/10 flex items-center justify-center"><BarChart3 className="w-4 h-4 text-[#9B51E0]" /></div>
          <div><div className="stat-label">Score</div><div className="text-lg font-extrabold text-[#1E1E2D]">{avg ? (avg * 20).toFixed(0) : '—'}<span className="text-xs text-[#B0B7C3] font-medium">%</span></div></div>
        </div>
      </div>

      {/* ── Description ── */}
      <div className="card p-5 mt-4">
        <h3 className="text-sm font-extrabold text-[#1E1E2D] mb-2">About</h3>
        <p className="text-sm text-[#7B8190] leading-relaxed">{item.description}</p>
      </div>

      {/* ── Analytics Row: Charts ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-4">
        <div className="md:col-span-4 card p-4">
          <h3 className="text-xs font-extrabold text-[#1E1E2D] mb-3 flex items-center gap-1.5"><BarChart3 className="w-3.5 h-3.5 text-[#00BFA6]" /> Rating Distribution</h3>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={ratingBarData} layout="vertical" barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="star" axisLine={false} tickLine={false} width={30} />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E8ECF0', borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="count" name="Reviews" radius={[0, 4, 4, 0]} fill="#00BFA6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="md:col-span-3 card p-4">
          <h3 className="text-xs font-extrabold text-[#1E1E2D] mb-3">Score Breakdown</h3>
          {ratingPieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie data={ratingPieData} cx="50%" cy="50%" innerRadius={30} outerRadius={50} dataKey="value" strokeWidth={0}>
                    {ratingPieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E8ECF0', borderRadius: 8, fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-2 mt-1">
                {ratingPieData.map((d, i) => (
                  <span key={i} className="text-[9px] font-bold text-[#7B8190] flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />{d.name}: {d.value}
                  </span>
                ))}
              </div>
            </>
          ) : <p className="text-xs text-[#B0B7C3] text-center py-8">No data</p>}
        </div>

        <div className="md:col-span-5 card p-4">
          <h3 className="text-xs font-extrabold text-[#1E1E2D] mb-3">Feedback Trend</h3>
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={trendData}>
              <defs><linearGradient id="tg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00BFA6" stopOpacity={0.2} /><stop offset="100%" stopColor="#00BFA6" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E8ECF0', borderRadius: 8, fontSize: 11 }} />
              <Area type="monotone" dataKey="feedback" stroke="#00BFA6" strokeWidth={2} fill="url(#tg)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Rating Bars + Write Review ── */}
      <div className="card p-5 mt-4">
        <h3 className="text-sm font-extrabold text-[#1E1E2D] mb-4">Ratings Overview</h3>
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="text-center w-full sm:w-24 flex-shrink-0">
            <div className="text-4xl font-black text-[#1E1E2D]">{avg ? avg.toFixed(1) : '—'}</div>
            <div className="flex justify-center mt-1.5 gap-0.5">{stars(avg)}</div>
            <p className="text-[10px] text-[#B0B7C3] font-bold mt-1.5">{total} review{total !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex-1 w-full space-y-2">
            {[5,4,3,2,1].map(s => { const c = dist[s-1]; const p = total > 0 ? (c/total)*100 : 0; return (
              <div key={s} className="flex items-center gap-2.5">
                <span className="text-[11px] font-bold text-[#B0B7C3] w-3 text-right">{s}</span>
                <StarIcon className="w-3 h-3 fill-amber-400 text-amber-400" />
                <div className="rating-bar-bg flex-1"><div className="rating-bar-fill" style={{ width: `${p}%` }} /></div>
                <span className="text-[11px] font-bold text-[#B0B7C3] w-5 text-right">{c}</span>
              </div>
            ); })}
          </div>
        </div>
        <div className="mt-5 pt-4 border-t border-[#E8ECF0]">
          {myRating && !showRatingForm ? (
            <div className="flex items-center gap-2 text-xs text-[#7B8190]">Your rating: <span className="flex gap-0.5">{stars(myRating.score)}</span>
              <button onClick={() => setShowRatingForm(true)} className="text-[#00BFA6] font-bold hover:underline cursor-pointer ml-1">Edit</button></div>
          ) : !showRatingForm ? (
            <button onClick={() => setShowRatingForm(true)} className="w-full py-2.5 text-xs font-bold text-[#00BFA6] border border-[#00BFA6]/20 rounded-lg hover:bg-[#00BFA6]/5 transition cursor-pointer">✍️ Write a review</button>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              <input type="text" value={authorName} onChange={e => setAuthorName(e.target.value)} placeholder="Your name" className="w-full px-3 py-2 text-xs" />
              <div className="flex items-center gap-1">
                <span className="text-xs text-[#7B8190] font-bold mr-2">Rating:</span>
                {[1,2,3,4,5].map(s => <StarIcon key={s} className={`w-7 h-7 star ${s <= (ratingHover || ratingScore) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
                  onMouseEnter={() => setRatingHover(s)} onMouseLeave={() => setRatingHover(0)} onClick={() => setRatingScore(s)} />)}
              </div>
              <textarea value={ratingReview} onChange={e => setRatingReview(e.target.value)} placeholder="Share your experience (optional)" rows={2} className="w-full px-3 py-2 text-xs" />
              <div className="flex gap-2">
                <button onClick={handleRating} disabled={ratingScore === 0 || !authorName.trim() || submitting}
                  className="px-5 py-2 bg-[#00BFA6] text-white text-xs font-bold rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer">
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
                <button onClick={() => setShowRatingForm(false)} className="px-3 py-2 text-xs text-[#7B8190] hover:text-[#1E1E2D] cursor-pointer">Cancel</button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* ── Reviews List ── */}
      {item.ratings.length > 0 && (
        <div className="card p-5 mt-4">
          <h3 className="text-sm font-extrabold text-[#1E1E2D] mb-3">All Reviews ({item.ratings.length})</h3>
          <div className="space-y-3.5">
            {item.ratings.map((r, i) => (
              <div key={i} className="flex gap-3 pb-3.5 border-b border-[#F0F1F3] last:border-0 last:pb-0">
                <div className="w-8 h-8 rounded-lg bg-[#00BFA6] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">{r.userName[0].toUpperCase()}</div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2"><span className="text-xs font-bold text-[#1E1E2D]">{r.userName}</span>
                    <span className="flex gap-0.5">{stars(r.score, 'w-2.5 h-2.5')}</span>
                    <span className="text-[9px] text-[#B0B7C3]">{timeAgo(r.createdAt)}</span></div>
                  {r.review && <p className="text-xs text-[#7B8190] mt-1">{r.review}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function stars(r: number, sz = 'w-3.5 h-3.5') {
  return Array.from({ length: 5 }, (_, i) => <StarIcon key={i} className={`${sz} ${i < Math.round(r) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />);
}
