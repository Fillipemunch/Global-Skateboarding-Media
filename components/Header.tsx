
import React from 'react';

interface HeaderProps {
  currentView: string;
  setView: (view: any) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setView }) => {
  return (
    <header className="bg-black border-b border-zinc-900 py-10 px-8">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="cursor-pointer" onClick={() => setView('home')}>
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-none italic italic-headline text-white">
            GRIND<br /><span className="text-yellow-400">PULSE</span>
          </h1>
          <p className="text-yellow-400 mt-4 tracking-[0.3em] font-bold text-xs uppercase">
            AI-Driven Global Skateboarding Media
          </p>
        </div>
        
        <div className="flex flex-col items-end gap-6">
          <nav className="flex gap-8 font-black text-sm uppercase italic tracking-widest">
            <button 
              onClick={() => setView('home')} 
              className={`${currentView === 'home' ? 'text-yellow-400' : 'text-zinc-500 hover:text-white'} transition-colors`}
            >
              Home
            </button>
            <button 
              onClick={() => setView('events')} 
              className={`${currentView === 'events' ? 'text-yellow-400' : 'text-zinc-500 hover:text-white'} transition-colors`}
            >
              Tour & Events
            </button>
            <button 
              onClick={() => setView('videos')} 
              className={`${currentView === 'videos' ? 'text-yellow-400' : 'text-zinc-500 hover:text-white'} transition-colors`}
            >
              Video Parts
            </button>
            <button 
              onClick={() => setView('culture')} 
              className={`${currentView === 'culture' ? 'text-yellow-400' : 'text-zinc-500 hover:text-white'} transition-colors`}
            >
              Culture
            </button>
          </nav>
          <div className="text-[9px] font-black text-zinc-800 uppercase tracking-[0.5em] border border-zinc-900 px-4 py-2">
            Status: Synchronized // US_NODES_ACTIVE
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
