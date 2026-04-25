import { ChevronDown, Bell } from 'lucide-react';

export function Header() {
  return (
    <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-end px-8 sticky top-0 z-10">
      <div className="flex items-center gap-6">
        <button className="text-gray-400 hover:text-gray-600 transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        <div className="flex items-center gap-3 cursor-pointer pl-6 border-l border-gray-100">
          <div className="flex flex-col items-end">
            <span className="text-sm font-semibold text-gray-700">Kipruto</span>
            <span className="text-xs text-gray-400">Admin</span>
          </div>
          <img 
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Kipruto" 
            alt="Profile" 
            className="w-10 h-10 rounded-full bg-gray-100"
          />
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </header>
  );
}
