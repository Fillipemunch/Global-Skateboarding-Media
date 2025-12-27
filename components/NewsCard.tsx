
import React from 'react';

interface CardProps {
  title: string;
  category: string;
  region?: string;
  description: string;
  link: string;
  date?: string;
  youtubeId?: string;
  onClick?: () => void;
}

const NewsCard: React.FC<CardProps> = ({ title, category, region, description, date, youtubeId, onClick }) => {
  return (
    <div className="news-item border-b border-zinc-900 py-12 mb-4 group transition-all">
      <div className="max-w-4xl">
        {/* Meta Header */}
        <div className="flex items-center gap-4 mb-6">
          <span className="bg-white text-black text-[10px] font-black px-3 py-1 uppercase tracking-tighter">
            {region || 'GLOBAL'}
          </span>
          <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.2em]">
            {date || 'LATEST'} // {category.replace(/_/g, ' ') || 'NEWS'}
          </span>
        </div>
        
        {/* Headline */}
        <div onClick={onClick} className="cursor-pointer">
          <h2 className="font-skate text-5xl md:text-7xl italic leading-[0.9] text-white group-hover:text-yellow-400 transition-colors uppercase mb-6">
            {title}
          </h2>
        </div>
        
        {/* Summary Hook */}
        <p className="text-zinc-400 text-xl leading-relaxed italic mb-8 max-w-3xl">
          "{description}"
        </p>

        {/* Action Links */}
        <div className="flex items-center gap-8">
          <button 
            onClick={onClick}
            className="text-white border-b-2 border-white pb-1 text-sm font-black uppercase tracking-widest hover:text-yellow-400 hover:border-yellow-400 transition-all"
          >
            Read Full Report →
          </button>
          
          {youtubeId && (
            <a 
              href={`https://www.youtube.com/watch?v=${youtubeId.trim()}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-zinc-600 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all"
            >
              External Link: YouTube
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsCard;
