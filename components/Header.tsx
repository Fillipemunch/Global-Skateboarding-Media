
import React from 'react';

interface HeaderProps {
  currentView: string;
  setView: (view: any) => void;
  searchQuery: string;
  onSearch: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setView, searchQuery, onSearch }) => {
  return (
    <header className="bg-black border-b border-zinc-900 py-10 px-8">
      <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row justify-between items-center gap-8">
        <div className="cursor-pointer group" onClick={() => setView('home')}>
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-none italic italic-headline text-white group-hover:text-zinc-200 transition-colors">
            GRIND<br /><span className="text-yellow-400">PULSE</span>
          </h1>
          <p className="text-yellow-400 mt-4 tracking-[0.3em] font-bold text-xs uppercase">
            Global Skateboarding Media
          </p>
        </div>
        
        <div className="flex flex-col items-center lg:items-end gap-6 w-full lg:w-auto">
          <div className="relative w-full max-w-md lg:max-w-xs">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-zinc-700 pointer-events-none">SEARCH_</span>
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="SCAN_DATABASE..."
              className="w-full bg-zinc-950 border border-zinc-900 px-4 py-3 pl-16 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-yellow-400 text-white placeholder-zinc-800 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => onSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white font-black text-[10px]"
              >
                [X]
              </button>
            )}
          </div>

          <nav className="flex flex-wrap justify-center gap-6 lg:gap-8 font-black text-sm uppercase italic tracking-widest">
            <button 
              onClick={() => setView('home')} 
              className={`${currentView === 'home' ? 'text-yellow-400' : 'text-zinc-500 hover:text-white'} transition-colors whitespace-nowrap`}
            >
              Home
            </button>
            <button 
              onClick={() => setView('events')} 
              className={`${currentView === 'events' ? 'text-yellow-400' : 'text-zinc-500 hover:text-white'} transition-colors whitespace-nowrap`}
            >
              Tour & Events
            </button>
            <button 
              onClick={() => setView('videos')} 
              className={`${currentView === 'videos' ? 'text-yellow-400' : 'text-zinc-500 hover:text-white'} transition-colors whitespace-nowrap`}
            >
              Video Parts
            </button>
            <button 
              onClick={() => setView('culture')} 
              className={`${currentView === 'culture' ? 'text-yellow-400' : 'text-zinc-500 hover:text-white'} transition-colors whitespace-nowrap`}
            >
              Culture
            </button>
          </nav>
          <div className="hidden lg:block text-[9px] font-black text-zinc-800 uppercase tracking-[0.5em] border border-zinc-900 px-4 py-2">
            Status: Synchronized // US_NODES_ACTIVE
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
