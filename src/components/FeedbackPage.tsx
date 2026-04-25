import { motion } from 'framer-motion';
import { Star, MessageSquareText, TrendingUp, Clock } from 'lucide-react';
import { type FeedbackEntry, timeAgo } from '../lib/store';

interface Props {
  feedback: FeedbackEntry[];
  onSelectItem: (id: string) => void;
}

export function FeedbackPage({ feedback, onSelectItem }: Props) {
  const avgScore = feedback.length > 0
    ? (feedback.reduce((s, f) => s + f.score, 0) / feedback.length)
    : 0;
  const fiveStars = feedback.filter(f => f.score === 5).length;
  const positive = feedback.filter(f => f.score >= 4).length;

  return (
    <div className="max-w-[1100px] mx-auto pb-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="stat-card flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#00BFA6]/10 flex items-center justify-center">
              <MessageSquareText className="w-4 h-4 text-[#00BFA6]" />
            </div>
            <div>
              <div className="stat-label">Total Reviews</div>
              <div className="text-lg font-extrabold text-[#1E1E2D]">{feedback.length}</div>
            </div>
          </div>
          <div className="stat-card flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#F2994A]/10 flex items-center justify-center">
              <Star className="w-4 h-4 text-[#F2994A]" />
            </div>
            <div>
              <div className="stat-label">Avg Score</div>
              <div className="text-lg font-extrabold text-[#1E1E2D]">{avgScore.toFixed(1)}<span className="text-xs text-[#B0B7C3] font-medium">/5</span></div>
            </div>
          </div>
          <div className="stat-card flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#2F80ED]/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-[#2F80ED]" />
            </div>
            <div>
              <div className="stat-label">Positive</div>
              <div className="text-lg font-extrabold text-[#1E1E2D]">{feedback.length > 0 ? Math.round((positive / feedback.length) * 100) : 0}%</div>
            </div>
          </div>
          <div className="stat-card flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#9B51E0]/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-[#9B51E0]" />
            </div>
            <div>
              <div className="stat-label">5-Star Reviews</div>
              <div className="text-lg font-extrabold text-[#1E1E2D]">{fiveStars}</div>
            </div>
          </div>
        </div>

        {/* ── Feedback List ── */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E8ECF0]">
            <h2 className="text-sm font-extrabold text-[#1E1E2D]">All User Feedback</h2>
            <p className="text-[10px] text-[#7B8190] mt-0.5">Complete history of ratings and reviews from all users</p>
          </div>

          {feedback.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-3xl mb-2">📝</p>
              <p className="text-sm text-[#7B8190]">No feedback yet. Reviews will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#F0F1F3]">
              {feedback.map((f, idx) => (
                <motion.div
                  key={`${f.itemId}-${f.userId}-${idx}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="px-5 py-4 hover:bg-[#FAFBFC] transition cursor-pointer group"
                  onClick={() => onSelectItem(f.itemId)}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    {/* Product image */}
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#F4F5F7] to-[#E8ECF0] flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {f.itemImage ? (
                        <img src={f.itemImage} alt={f.itemName} className="w-7 h-7 sm:w-8 sm:h-8 object-contain" loading="lazy" />
                      ) : (
                        <span className="text-lg font-bold text-[#00BFA6]">{f.itemName[0]}</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-xs font-bold text-[#1E1E2D]">{f.userName}</span>
                        <span className="text-[10px] text-[#B0B7C3]">reviewed</span>
                        <span className="text-xs font-bold text-[#00BFA6] group-hover:underline">{f.itemName}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${getCatColor(f.itemCategory)}`}>{f.itemCategory}</span>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-1 mt-1.5">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < f.score ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                        ))}
                        <span className="text-[11px] font-bold text-[#1E1E2D] ml-1">{f.score}/5</span>
                        <span className="text-[9px] text-[#B0B7C3] ml-2">{timeAgo(f.createdAt)}</span>
                      </div>

                      {f.review && (
                        <p className="text-[12px] text-[#7B8190] mt-1.5 leading-relaxed line-clamp-2">"{f.review}"</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function getCatColor(cat: string): string {
  const map: Record<string, string> = {
    Products: 'bg-blue-50 text-blue-600', Services: 'bg-emerald-50 text-emerald-600',
    Ideas: 'bg-amber-50 text-amber-600', Projects: 'bg-rose-50 text-rose-600', Tools: 'bg-violet-50 text-violet-600',
  };
  return map[cat] || 'bg-gray-100 text-gray-500';
}
