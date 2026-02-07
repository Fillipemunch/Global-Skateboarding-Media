import React from 'react';

interface CardProps {
  title: string;
  category: string;
  description: string;
  link: string;
  badge?: string;
  imageUrl?: string;
}

const NewsCard: React.FC<CardProps> = ({ title, category, description, link, badge, imageUrl }) => {
  return (
    <div className="border-l-4 border-yellow-400 bg-zinc-900 card-shadow group hover:bg-zinc-800/50 transition-all duration-300 flex flex-col h-full overflow-hidden">
      {imageUrl && (
        <div className="aspect-video bg-black overflow-hidden">
          <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
          />
        </div>
      )}
      <div className="p-8 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-4">
          <span className="text-[10px] uppercase font-black text-yellow-400 tracking-[0.2em] bg-zinc-950 px-2 py-1">
            {category}
          </span>
          {badge && (
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest border border-zinc-800 px-2 py-1">
              {badge}
            </span>
          )}
        </div>
        
        <h2 className="text-2xl font-black italic italic-headline text-white mt-2 uppercase leading-none group-hover:text-yellow-400 transition-colors">
          {title}
        </h2>
        
        <p className="text-zinc-400 mt-6 font-medium text-sm leading-relaxed mb-8 flex-grow">
          {description}
        </p>

        <div className="mt-auto flex items-center justify-between">
          <a 
            href={link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center text-[11px] font-black uppercase tracking-[0.2em] text-white hover:text-yellow-400 transition-colors"
          >
            Full Intel
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3 ml-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </a>
          <div className="w-12 h-[1px] bg-zinc-800"></div>
        </div>
      </div>
    </div>
  );
};

export default NewsCard;