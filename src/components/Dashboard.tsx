import { Star } from 'lucide-react';
import type { Feedback } from '../lib/api';
import { PRODUCTS } from './MoodCards';

interface DashboardProps {
  feedbacks: Feedback[];
}

const MOOD_EMOJI: Record<number, string> = { 1: '😠', 2: '🙁', 3: '😐', 4: '🙂', 5: '😍' };
function ratingEmoji(r: number) { return MOOD_EMOJI[Math.round(r)] ?? '😐'; }

export function Dashboard({ feedbacks }: DashboardProps) {
  const total = feedbacks.length;
  const overallAvg = total ? feedbacks.reduce((s, f) => s + f.rating, 0) / total : 0;
  const avgDesign = total ? feedbacks.reduce((s, f) => s + f.rating_design, 0) / total : 0;
  const avgSpeed = total ? feedbacks.reduce((s, f) => s + f.rating_speed, 0) / total : 0;
  const avgUsability = total ? feedbacks.reduce((s, f) => s + f.rating_usability, 0) / total : 0;

  // Per-product stats
  const productStats = PRODUCTS.map(p => {
    const items = feedbacks.filter(f => f.target === p.name);
    const avg = items.length ? items.reduce((s, f) => s + f.rating, 0) / items.length : 0;
    return { ...p, avg, count: items.length };
  });

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Live overview of all submitted reviews.</p>
      </div>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Reviews" value={total.toString()} accent="bg-[#5570F1]" />
        <StatCard label="Overall Rating" value={overallAvg ? overallAvg.toFixed(1) : '—'} accent="bg-blue-400" />
        <StatCard label="Design Avg" value={avgDesign ? avgDesign.toFixed(1) : '—'} accent="bg-indigo-400" />
        <StatCard label="Speed Avg" value={avgSpeed ? avgSpeed.toFixed(1) : '—'} accent="bg-sky-400" />
      </div>

      {/* Product Breakdown + Recent Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Product Breakdown */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-5">Product Ratings</h3>
          <div className="space-y-4">
            {productStats.map(p => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="text-xl w-8">{p.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700 truncate">{p.name}</span>
                    <span className="text-xs text-gray-400">{p.count} review{p.count !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(p.avg / 5) * 100}%`,
                        backgroundColor: p.avg >= 4 ? '#22c55e' : p.avg >= 3 ? '#eab308' : p.avg > 0 ? '#ef4444' : '#e5e7eb',
                      }}
                    />
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-800 w-8 text-right">{p.avg ? p.avg.toFixed(1) : '—'}</span>
              </div>
            ))}
          </div>

          {/* Category breakdown */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Category Averages</h4>
            <div className="grid grid-cols-3 gap-3">
              <MiniStat label="Design" value={avgDesign} />
              <MiniStat label="Speed" value={avgSpeed} />
              <MiniStat label="Usability" value={avgUsability} />
            </div>
          </div>
        </div>

        {/* Recent Reviews Feed */}
        <div className="lg:col-span-3 bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col max-h-[520px]">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-800">Recent Reviews</h3>
            <span className="text-xs font-medium text-[#5570F1]">{total} total</span>
          </div>
          <div className="overflow-y-auto flex-1 divide-y divide-gray-50">
            {feedbacks.length === 0 && (
              <div className="p-12 text-center text-gray-400">
                <p className="text-4xl mb-3">📭</p>
                <p className="text-sm">No reviews yet. Go to "Submit Review" to add one!</p>
              </div>
            )}
            {feedbacks.slice(0, 20).map(f => (
              <div key={f.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{ratingEmoji(f.rating)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-gray-900 truncate">{f.target}</span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-bold text-gray-700">{f.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    {f.comment && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">"{f.comment}"</p>
                    )}
                    <div className="flex gap-4 mt-2">
                      <span className="text-[10px] text-gray-400">🎨 {f.rating_design}/5</span>
                      <span className="text-[10px] text-gray-400">⚡ {f.rating_speed}/5</span>
                      <span className="text-[10px] text-gray-400">👆 {f.rating_usability}/5</span>
                      <span className="text-[10px] text-gray-400 ml-auto">{new Date(f.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
      <div className={`w-2 h-2 rounded-full ${accent} mb-3`} />
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <h3 className="text-2xl font-bold text-gray-800 mt-1">{value}</h3>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 text-center">
      <p className="text-lg font-bold text-gray-800">{value ? value.toFixed(1) : '—'}</p>
      <p className="text-[10px] text-gray-500 font-medium mt-1">{label}</p>
    </div>
  );
}
