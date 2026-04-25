import { Home, Activity, BarChart2 } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (t: string) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'submit', label: 'Submit Review', icon: BarChart2 },
  ];

  return (
    <aside className="w-64 h-screen bg-[#5570F1] text-white flex flex-col fixed left-0 top-0 z-20">
      <div className="p-6 flex items-center gap-3">
        <Activity className="w-8 h-8" />
        <span className="text-xl font-bold tracking-wide">Pulse</span>
      </div>

      <nav className="flex-1 mt-6 flex flex-col gap-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 px-8 py-4 transition-all duration-200 ${
              activeTab === item.id
                ? 'bg-white text-[#5570F1] rounded-l-full ml-4 font-semibold shadow-sm'
                : 'hover:bg-white/10 text-white/80'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6 text-xs text-white/40 text-center">
        © 2026 Pulse Portal
      </div>
    </aside>
  );
}
