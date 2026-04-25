import { Home, Activity, BarChart2 } from 'lucide-react';

export function Sidebar({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) {
  return (
    <div className="w-64 h-screen bg-[#5570F1] text-white flex flex-col fixed left-0 top-0">
      <div className="p-6 flex items-center gap-3">
        <Activity className="w-8 h-8" />
        <span className="text-xl font-bold tracking-wide">Pulse</span>
      </div>
      
      <nav className="flex-1 mt-6">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`w-full flex items-center gap-4 px-8 py-4 transition-colors ${
            activeTab === 'dashboard' 
              ? 'bg-white text-[#5570F1] rounded-l-full ml-4' 
              : 'hover:bg-white/10 text-white/80'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="font-medium">Dashboard</span>
        </button>

        <button 
          onClick={() => setActiveTab('submit')}
          className={`w-full flex items-center gap-4 px-8 py-4 transition-colors ${
            activeTab === 'submit' 
              ? 'bg-white text-[#5570F1] rounded-l-full ml-4' 
              : 'hover:bg-white/10 text-white/80'
          }`}
        >
          <BarChart2 className="w-5 h-5" />
          <span className="font-medium">Submit Rating</span>
        </button>
      </nav>
    </div>
  );
}
