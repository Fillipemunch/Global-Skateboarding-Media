
import React from 'react';
import { SkateNewsItem } from '../types';

interface ArticleViewProps {
  article: SkateNewsItem;
  onBack: () => void;
}

const ArticleView: React.FC<ArticleViewProps> = ({ article, onBack }) => {
  const getDisplayImage = () => {
    if (article.image_url && article.image_url.startsWith('http')) {
      return article.image_url;
    }
    if (article.youtube_id) {
      return `https://img.youtube.com/vi/${article.youtube_id.trim()}/maxresdefault.jpg`;
    }
    return `https://images.unsplash.com/photo-1547447134-cd3f5c716030?q=80&w=1000&auto=format&fit=crop`;
  };

  return (
    <div className="min-h-screen bg-black animate-in fade-in duration-700">
      <nav className="p-8 border-b border-zinc-900 flex justify-between items-center sticky top-0 bg-black/90 backdrop-blur-xl z-50">
        <button 
          onClick={onBack}
          className="text-yellow-400 font-black uppercase tracking-[0.3em] text-[10px] flex items-center gap-4 group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4 group-hover:-translate-x-1 transition-transform">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Feed
        </button>
        <div className="flex items-center gap-8">
           <span className="text-yellow-400 font-black text-[10px] tracking-[0.5em] uppercase hidden md:block italic">{article.date || 'SIGNAL_LIVE'}</span>
           <span className="text-zinc-700 font-black text-[10px] tracking-[0.5em] uppercase hidden md:block font-mono">NODE_TX_{article.id || 'LIVE'}</span>
        </div>
      </nav>

      <main className="max-w-[1000px] mx-auto py-24 px-8">
        <article>
          <div className="flex flex-col items-center text-center mb-20">
            <div className="flex items-center gap-4 mb-6">
               {article.region && (
                 <span className="bg-yellow-400 text-black px-3 py-1 text-[10px] font-black uppercase tracking-tighter italic">
                   {article.region}
                 </span>
               )}
               <span className="text-zinc-500 font-black text-[11px] uppercase tracking-[0.3em] italic">
                 {article.category.replace(/_/g, ' ')}
               </span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black italic italic-headline text-white leading-none tracking-tighter mb-8 max-w-4xl uppercase">
              {article.title}
            </h1>
            <div className="w-24 h-1 bg-zinc-800 mb-8"></div>
            <p className="text-zinc-600 font-black uppercase tracking-[0.4em] text-[10px] italic">
              Verified Source Node: {new URL(article.url).hostname} // {article.date || 'ARCHIVE'}
            </p>
          </div>

          <div className="mb-20 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] border border-zinc-900 bg-zinc-950 overflow-hidden group">
            <div className="relative aspect-video w-full bg-black overflow-hidden">
              <img 
                src={getDisplayImage()} 
                alt={article.title} 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" 
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all duration-700"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-8">
              <div className="text-zinc-300 text-xl leading-relaxed space-y-8">
                <p className="text-white text-3xl font-black italic italic-headline leading-tight border-l-8 border-yellow-400 pl-10 py-4 mb-20 uppercase">
                  {article.summary}
                </p>

                <div className="article-body whitespace-pre-wrap space-y-12 text-2xl text-zinc-400 font-medium tracking-tight italic italic-headline leading-[1.6]">
                  {article.content}
                </div>
              </div>

              <div className="mt-24 pt-16 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div className="max-w-md">
                  <h4 className="text-zinc-600 font-black uppercase tracking-widest text-[9px] mb-4 italic">Origin Source Node</h4>
                  <a 
                    href={article.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-white hover:text-yellow-400 transition-colors font-black text-sm underline decoration-zinc-800 underline-offset-8 italic break-all"
                  >
                    {article.url}
                  </a>
                </div>
                <button 
                   onClick={() => window.open(article.url, '_blank')}
                   className="bg-white text-black px-12 py-5 font-black uppercase text-[11px] tracking-widest hover:bg-yellow-400 transition-all shadow-xl italic"
                >
                  Visit Origin Site
                </button>
              </div>
            </div>

            <aside className="lg:col-span-4">
              <div className="bg-zinc-950 border border-zinc-900 p-8 sticky top-32 shadow-2xl">
                <h4 className="text-xs font-black uppercase tracking-[0.3em] text-yellow-400 mb-8 italic">Transmission Info</h4>
                <div className="space-y-6">
                  <div className="flex flex-col gap-1 border-b border-zinc-900 pb-4">
                    <span className="text-[9px] text-zinc-700 uppercase font-black tracking-widest italic font-mono">Region_Node</span>
                    <span className="text-xs text-zinc-300 uppercase font-black italic italic-headline">{article.region || 'GLOBAL_CORE'}</span>
                  </div>
                  <div className="flex flex-col gap-1 border-b border-zinc-900 pb-4">
                    <span className="text-[9px] text-zinc-700 uppercase font-black tracking-widest italic font-mono">Status</span>
                    <span className="text-xs text-zinc-300 uppercase font-black italic italic-headline">Verified_Intel</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-zinc-700 uppercase font-black tracking-widest italic font-mono">Security</span>
                    <span className="text-xs text-zinc-300 uppercase font-black italic italic-headline">End_To_End_Encrypted</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </article>
      </main>

      <footer className="bg-black border-t border-zinc-900 py-20 px-8 text-center">
        <p className="text-zinc-900 font-black uppercase tracking-[1.5em] text-[10px]">End of Transmission</p>
      </footer>
    </div>
  );
};

export default ArticleView;
