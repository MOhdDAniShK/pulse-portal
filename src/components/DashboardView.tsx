import { Users, Star, Palette, Zap, Smile, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { Feedback } from '../lib/api';

interface DashboardViewProps {
  feedbacks: Feedback[];
  averageRating: number | null;
}

export function DashboardView({ feedbacks, averageRating }: DashboardViewProps) {
  const total = feedbacks.length;
  
  // Averages
  const avgDesign = total ? (feedbacks.reduce((acc, curr) => acc + curr.rating_design, 0) / total).toFixed(1) : '0.0';
  const avgSpeed = total ? (feedbacks.reduce((acc, curr) => acc + curr.rating_speed, 0) / total).toFixed(1) : '0.0';
  const avgUsability = total ? (feedbacks.reduce((acc, curr) => acc + curr.rating_usability, 0) / total).toFixed(1) : '0.0';

  const positiveCount = feedbacks.filter(f => f.rating >= 4).length;
  const neutralCount = feedbacks.filter(f => f.rating === 3).length;
  const negativeCount = feedbacks.filter(f => f.rating < 3).length;

  // Generate dynamic chart data based on feedback timestamps
  const chartData = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(0, i).toLocaleString('en', { month: 'short' });
    const count = feedbacks.filter(f => new Date(f.created_at).getMonth() === i).length;
    return { name: month, total: count };
  });

  const MetricCard = ({ icon: Icon, title, value, change, isPositive, iconColor }: any) => (
    <div className="card p-5 flex flex-col justify-between h-32">
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-xl ${iconColor}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 font-medium">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">{value}</h3>
        </div>
      </div>
      <div className={`flex items-center gap-1 text-xs font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
        {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {change}
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Hi Kipruto, Welcome back!</h1>
        <p className="text-sm text-gray-500 mt-1">This is your overview for this year.</p>
      </div>

      {/* Row 1: 5 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <MetricCard 
          icon={Users} title="Total Ratings" value={total.toLocaleString()} 
          change="5.2%" isPositive={true} iconColor="bg-[#5570F1]"
        />
        <MetricCard 
          icon={Star} title="Overall Rating" value={averageRating?.toFixed(1) || '0.0'} 
          change="12.0%" isPositive={true} iconColor="bg-blue-400"
        />
        <MetricCard 
          icon={Palette} title="Design Rating" value={avgDesign} 
          change="1.7%" isPositive={false} iconColor="bg-indigo-400"
        />
        <MetricCard 
          icon={Zap} title="Speed Rating" value={avgSpeed} 
          change="20.0%" isPositive={true} iconColor="bg-sky-400"
        />
        <MetricCard 
          icon={Smile} title="Usability Rating" value={avgUsability} 
          change="5.2%" isPositive={false} iconColor="bg-violet-400"
        />
      </div>

      {/* Row 2: Trends and Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 flex items-center justify-between col-span-1 border-gray-200">
          <div>
            <div className="flex justify-between items-center w-full mb-1">
              <span className="text-xs font-medium text-gray-400">Current Average</span>
              <span className="text-xs font-bold text-green-500 flex items-center"><ArrowUpRight className="w-3 h-3"/> 8.7%</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{averageRating?.toFixed(1) || '0.0'} / 5.0</h2>
            <div className="mt-4">
              <span className="text-xs text-gray-400">Previous</span>
              <p className="text-sm text-gray-500 font-medium">3.8 / 5.0</p>
            </div>
          </div>
          <div className="w-[1px] h-full bg-gray-100 mx-4"></div>
          <div>
            <div className="flex justify-between items-center w-full mb-1">
              <span className="text-xs font-medium text-gray-400">Response Rate</span>
              <span className="text-xs font-bold text-red-500 flex items-center"><ArrowDownRight className="w-3 h-3"/> 3.7%</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">42.5%</h2>
            <div className="mt-4">
              <span className="text-xs text-gray-400">Previous</span>
              <p className="text-sm text-gray-500 font-medium">45.2%</p>
            </div>
          </div>
        </div>

        <div className="card p-6 border-gray-200">
          <h3 className="text-xs font-medium text-gray-400 mb-4">Category Averages</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="font-semibold text-gray-700">Design & Aesthetics</span>
              <span className="font-bold text-gray-900">{avgDesign}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="font-semibold text-gray-700">Performance & Speed</span>
              <span className="font-bold text-gray-900">{avgSpeed}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="font-semibold text-gray-700">Ease of Use</span>
              <span className="font-bold text-gray-900">{avgUsability}</span>
            </div>
          </div>
        </div>

        <div className="card p-6 border-gray-200">
          <h3 className="text-xs font-medium text-gray-400 mb-4">Recent Activity</h3>
          <div className="flex justify-between items-end h-[88px]">
            <div>
              <p className="text-xs text-blue-500 font-medium mb-1">Last 24h</p>
              <h4 className="text-xl font-bold text-gray-900">
                {feedbacks.filter(f => (new Date().getTime() - new Date(f.created_at).getTime()) < 86400000).length}
              </h4>
            </div>
            <div>
              <p className="text-xs text-red-500 font-medium mb-1">Last 7 Days</p>
              <h4 className="text-xl font-bold text-gray-900">
                {feedbacks.filter(f => (new Date().getTime() - new Date(f.created_at).getTime()) < 604800000).length}
              </h4>
            </div>
            <div>
              <p className="text-xs text-gray-800 font-medium mb-1">Last 30 Days</p>
              <h4 className="text-xl font-bold text-gray-900">{total}</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Chart and Side Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
        {/* Chart */}
        <div className="card p-6 lg:col-span-2 flex flex-col">
          <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
            <div className="flex gap-6">
              <button className="text-sm font-semibold text-blue-500 border-b-2 border-blue-500 pb-4 -mb-[18px]">Overview</button>
            </div>
            <select className="text-xs border border-gray-200 rounded p-1 px-2 text-gray-600 bg-white">
              <option>{new Date().getFullYear()}</option>
            </select>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5EA" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8E8E93' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8E8E93' }} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="total" fill="#5570F1" radius={[2, 2, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Stats */}
        <div className="flex flex-col gap-6">
          <div className="card p-6 flex-1 flex flex-col justify-center">
            <h3 className="text-xs font-medium text-gray-400 mb-6">Ratings this Month</h3>
            <div className="flex items-center">
              <div className="flex-1 space-y-4 pr-6 border-r border-gray-100">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-gray-700">Positive (4-5)</span>
                  <span className="font-bold text-gray-900">{positiveCount}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-gray-700">Neutral (3)</span>
                  <span className="font-bold text-gray-900">{neutralCount}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-gray-700">Negative (1-2)</span>
                  <span className="font-bold text-gray-900">{negativeCount}</span>
                </div>
              </div>
              <div className="w-32 text-center pl-6">
                <h2 className="text-4xl font-bold text-gray-900 mb-1">{total}</h2>
                <p className="text-[10px] text-gray-500 font-medium">Total ratings</p>
              </div>
            </div>
          </div>

          <div className="card p-6 flex-1 flex flex-col justify-center">
            <h3 className="text-xs font-medium text-gray-400 mb-6">Sentiment Tracking</h3>
            <div className="flex items-center">
              <div className="flex-1 space-y-4 pr-6 border-r border-gray-100">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-gray-700">Happy Users</span>
                  <span className="font-bold text-gray-900">{positiveCount}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-gray-700">Needs Attention</span>
                  <span className="font-bold text-gray-900">{negativeCount}</span>
                </div>
              </div>
              <div className="w-32 text-center pl-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-1">{total ? ((positiveCount / total) * 100).toFixed(0) : 0}%</h2>
                <p className="text-[10px] text-gray-500 font-medium">Satisfaction Rate</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
