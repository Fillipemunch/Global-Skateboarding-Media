import React from 'react';

interface NewsProps {
  item: {
    id: number;
    region: string;
    title: string;
    summary: string;
    date: string;
  };
}

export const NewsCard: React.FC<NewsProps> = ({ item }) => {
  return (
    <div className="border-b border-zinc-900 py-12 group bg-black">
      <div className="flex items-center gap-4 mb-4">
        <span className="bg-yellow-400 text-black text-[10px] font-black px-2 py-0.5 uppercase">
          {item.region}
        </span>
        <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
          {item.date}
        </span>
      </div>
      
      <h2 className="text-5xl md:text-7xl font-black italic uppercase leading-[0.85] mb-6 group-hover:text-yellow-400 transition-colors text-white text-left">
        {item.title}
      </h2>
      
      <p className="text-zinc-400 text-xl italic max-w-2xl mb-8 text-left">
        {item.summary}
      </p>

      <div className="flex justify-start">
        <a 
          href={`/article?id=${item.id}`} 
          className="inline-block border-b-2 border-white pb-1 text-sm font-black uppercase tracking-widest hover:border-yellow-400 hover:text-yellow-400 transition-all text-white"
        >
          Read Full Report →
        </a>
      </div>
    </div>
  );
};
