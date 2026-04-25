import { motion } from 'framer-motion';
import { Star, TrendingUp, Package, Users, BarChart3 as BarChartIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { type AnalyticsData } from '../lib/store';

const PIE_COLORS = ['#00BFA6', '#2F80ED', '#F2994A', '#EB5757', '#9B51E0'];
const CAT_COLORS: Record<string, string> = { Products: '#2F80ED', Services: '#00BFA6', Ideas: '#F2994A', Projects: '#EB5757', Tools: '#9B51E0' };

interface Props {
  data: AnalyticsData | null;
  onSelectItem: (id: string) => void;
}

export function AnalyticsPage({ data, onSelectItem }: Props) {
  if (!data) {
    return (
      <div className="text-center py-16">
        <div className="inline-block w-8 h-8 border-3 border-[#00BFA6] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[#7B8190] mt-3">Loading analytics...</p>
      </div>
    );
  }

  // Prepare chart data
  const ratingBarData = [5, 4, 3, 2, 1].map(s => ({ star: `${s}★`, count: data.ratingDist[s - 1] }));

  const categoryData = Object.entries(data.categories).map(([name, d]) => ({
    name, count: d.count, upvotes: d.upvotes, ratings: d.ratings,
  }));

  const catPieData = categoryData.map(c => ({ name: c.name, value: c.count }));

  const monthlyTrend = Object.entries(data.monthlyData).map(([month, count]) => ({ month, reviews: count }));

  return (
    <div className="max-w-[1100px] mx-auto pb-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        {/* ── Stats Summary ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="stat-card flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#00BFA6]/10 flex items-center justify-center">
              <Package className="w-4 h-4 text-[#00BFA6]" />
            </div>
            <div>
              <div className="stat-label">Total Listings</div>
              <div className="text-lg font-extrabold text-[#1E1E2D]">{data.totalItems}</div>
            </div>
          </div>
          <div className="stat-card flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#2F80ED]/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-[#2F80ED]" />
            </div>
            <div>
              <div className="stat-label">Total Upvotes</div>
              <div className="text-lg font-extrabold text-[#1E1E2D]">{data.totalUpvotes.toLocaleString()}</div>
            </div>
          </div>
          <div className="stat-card flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#F2994A]/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-[#F2994A]" />
            </div>
            <div>
              <div className="stat-label">Total Reviews</div>
              <div className="text-lg font-extrabold text-[#1E1E2D]">{data.totalRatings}</div>
            </div>
          </div>
          <div className="stat-card flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#9B51E0]/10 flex items-center justify-center">
              <Star className="w-4 h-4 text-[#9B51E0]" />
            </div>
            <div>
              <div className="stat-label">Avg Rating</div>
              <div className="text-lg font-extrabold text-[#1E1E2D]">{data.avgRating.toFixed(1)}<span className="text-xs text-[#B0B7C3] font-medium">/5</span></div>
            </div>
          </div>
        </div>

        {/* ── Charts Row ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
          {/* Rating Distribution */}
          <div className="md:col-span-4 card p-4">
            <h3 className="text-xs font-extrabold text-[#1E1E2D] mb-3 flex items-center gap-1.5">
              <BarChartIcon className="w-3.5 h-3.5 text-[#00BFA6]" /> Rating Distribution
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={ratingBarData} layout="vertical" barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="star" axisLine={false} tickLine={false} width={35} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E8ECF0', borderRadius: 8, fontSize: 11 }} />
                <Bar dataKey="count" name="Reviews" radius={[0, 4, 4, 0]} fill="#00BFA6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category Breakdown Pie */}
          <div className="md:col-span-3 card p-4">
            <h3 className="text-xs font-extrabold text-[#1E1E2D] mb-3">Category Breakdown</h3>
            {catPieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie data={catPieData} cx="50%" cy="50%" innerRadius={30} outerRadius={55} dataKey="value" strokeWidth={0}>
                      {catPieData.map((entry, i) => <Cell key={i} fill={CAT_COLORS[entry.name] || PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E8ECF0', borderRadius: 8, fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-2 mt-1">
                  {catPieData.map((d, i) => (
                    <span key={i} className="text-[9px] font-bold text-[#7B8190] flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full" style={{ background: CAT_COLORS[d.name] || PIE_COLORS[i % PIE_COLORS.length] }} />{d.name}: {d.value}
                    </span>
                  ))}
                </div>
              </>
            ) : <p className="text-xs text-[#B0B7C3] text-center py-8">No data</p>}
          </div>

          {/* Review Trend Area Chart */}
          <div className="md:col-span-5 card p-4">
            <h3 className="text-xs font-extrabold text-[#1E1E2D] mb-3">Review Trend</h3>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={monthlyTrend.length > 0 ? monthlyTrend : [{ month: 'No data', reviews: 0 }]}>
                <defs>
                  <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00BFA6" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#00BFA6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E8ECF0', borderRadius: 8, fontSize: 11 }} />
                <Area type="monotone" dataKey="reviews" stroke="#00BFA6" strokeWidth={2} fill="url(#trendGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Top Items Row ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Top Rated */}
          <div className="card p-5">
            <h3 className="text-sm font-extrabold text-[#1E1E2D] mb-4 flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-400" /> Top Rated
            </h3>
            <div className="space-y-3">
              {data.topRated.map((item, idx) => (
                <div key={item._id} onClick={() => onSelectItem(item._id)}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#FAFBFC] transition cursor-pointer group">
                  <span className="text-xs font-black text-[#B0B7C3] w-5 text-right">{idx + 1}</span>
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#F4F5F7] to-[#E8ECF0] flex items-center justify-center overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-6 h-6 object-contain" loading="lazy" />
                    ) : (
                      <span className="text-sm font-bold text-[#00BFA6]">{item.name[0]}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-[#1E1E2D] truncate group-hover:text-[#00BFA6] transition">{item.name}</div>
                    <div className="flex items-center gap-1 mt-0.5">
                      {Array.from({ length: 5 }, (_, i) => <Star key={i} className={`w-2.5 h-2.5 ${i < Math.round(item.avgRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />)}
                      <span className="text-[10px] font-bold text-[#1E1E2D] ml-0.5">{item.avgRating.toFixed(1)}</span>
                      <span className="text-[9px] text-[#B0B7C3]">({item.ratings.length})</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Upvoted */}
          <div className="card p-5">
            <h3 className="text-sm font-extrabold text-[#1E1E2D] mb-4 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[#00BFA6]" /> Most Upvoted
            </h3>
            <div className="space-y-3">
              {data.topUpvoted.map((item, idx) => (
                <div key={item._id} onClick={() => onSelectItem(item._id)}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#FAFBFC] transition cursor-pointer group">
                  <span className="text-xs font-black text-[#B0B7C3] w-5 text-right">{idx + 1}</span>
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#F4F5F7] to-[#E8ECF0] flex items-center justify-center overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-6 h-6 object-contain" loading="lazy" />
                    ) : (
                      <span className="text-sm font-bold text-[#00BFA6]">{item.name[0]}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-[#1E1E2D] truncate group-hover:text-[#00BFA6] transition">{item.name}</div>
                    <div className="text-[10px] text-[#B0B7C3] font-bold mt-0.5">▲ {item.upvotes.toLocaleString()} upvotes</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Category Performance Table ── */}
        <div className="card p-5 mb-6">
          <h3 className="text-sm font-extrabold text-[#1E1E2D] mb-4">Category Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#E8ECF0]">
                  <th className="text-left py-2.5 px-3 font-bold text-[#7B8190] uppercase text-[10px] tracking-wider">Category</th>
                  <th className="text-right py-2.5 px-3 font-bold text-[#7B8190] uppercase text-[10px] tracking-wider">Listings</th>
                  <th className="text-right py-2.5 px-3 font-bold text-[#7B8190] uppercase text-[10px] tracking-wider">Upvotes</th>
                  <th className="text-right py-2.5 px-3 font-bold text-[#7B8190] uppercase text-[10px] tracking-wider">Reviews</th>
                  <th className="text-right py-2.5 px-3 font-bold text-[#7B8190] uppercase text-[10px] tracking-wider">Avg/Listing</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(data.categories).map(([cat, d]) => (
                  <tr key={cat} className="border-b border-[#F0F1F3] last:border-0 hover:bg-[#FAFBFC] transition">
                    <td className="py-3 px-3">
                      <span className="font-bold text-[#1E1E2D]">{cat}</span>
                    </td>
                    <td className="text-right py-3 px-3 font-bold text-[#1E1E2D]">{d.count}</td>
                    <td className="text-right py-3 px-3 font-bold text-[#00BFA6]">{d.upvotes.toLocaleString()}</td>
                    <td className="text-right py-3 px-3 text-[#7B8190]">{d.ratings}</td>
                    <td className="text-right py-3 px-3 text-[#7B8190]">{d.count > 0 ? (d.upvotes / d.count).toFixed(0) : 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Recent Activity ── */}
        <div className="card p-5">
          <h3 className="text-sm font-extrabold text-[#1E1E2D] mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {data.recentActivity.map((a, i) => (
              <div key={i} className="flex items-center gap-3 pb-3 border-b border-[#F0F1F3] last:border-0 last:pb-0">
                <div className="w-8 h-8 rounded-lg bg-[#00BFA6] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                  {a.userName[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1 text-xs">
                    <span className="font-bold text-[#1E1E2D]">{a.userName}</span>
                    <span className="text-[#B0B7C3]">rated</span>
                    <span className="font-bold text-[#00BFA6]">{a.itemName}</span>
                    <span className="flex items-center gap-0.5 ml-1">
                      {Array.from({ length: 5 }, (_, j) => <Star key={j} className={`w-2.5 h-2.5 ${j < a.score ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />)}
                    </span>
                  </div>
                  {a.review && <p className="text-[11px] text-[#7B8190] mt-0.5 truncate">"{a.review}"</p>}
                </div>
                <span className="text-[9px] text-[#B0B7C3] whitespace-nowrap">{new Date(a.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
