
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
      return `https://img.youtube.com/vi/${article.youtube_id}/maxresdefault.jpg`;
    }
    return `https://source.unsplash.com/featured/?skateboarding,${article.category}`;
  };

  return (
    <div className="min-h-screen bg-black">
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
        <span className="text-zinc-700 font-black text-[10px] tracking-[0.5em] uppercase hidden md:block">Node Transmission // {article.id || 'LIVE_SYNC'}</span>
      </nav>

      <main className="max-w-[1000px] mx-auto py-24 px-8">
        <article>
          <div className="flex flex-col items-center text-center mb-20">
            <span className="bg-yellow-400 text-black px-4 py-1.5 font-black text-[10px] uppercase tracking-[0.2em] italic mb-8">
              Channel: {article.category.replace(/_/g, ' ')}
            </span>
            <h1 className="text-6xl md:text-8xl font-black italic italic-headline text-white leading-none tracking-tighter mb-8 max-w-4xl">
              {article.title}
            </h1>
            <div className="w-24 h-1 bg-zinc-800 mb-8"></div>
            <p className="text-zinc-600 font-black uppercase tracking-[0.4em] text-[10px]">
              Verified Source Node: {new URL(article.url).hostname}
            </p>
          </div>

          <div className="mb-20 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] border-4 border-zinc-900 bg-zinc-950 overflow-hidden">
            {article.youtube_id ? (
              <div className="aspect-video w-full">
                <iframe 
                  className="w-full h-full" 
                  src={`https://www.youtube.com/embed/${article.youtube_id}?autoplay=0&rel=0`} 
                  title={article.title}
                  frameBorder="0" 
                  allowFullScreen
                ></iframe>
              </div>
            ) : (
              <img 
                src={getDisplayImage()} 
                alt={article.title} 
                className="w-full h-auto grayscale hover:grayscale-0 transition-all duration-700" 
                onError={(e) => (e.currentTarget.src = `https://via.placeholder.com/1000x600?text=TRANSMISSION_ERROR`)}
              />
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-8">
              <div className="text-zinc-300 text-xl leading-relaxed space-y-8">
                <p className="text-white text-3xl font-black italic italic-headline leading-tight border-l-8 border-yellow-400 pl-10 py-4 mb-16">
                  {article.summary}
                </p>

                <div className="article-body whitespace-pre-wrap space-y-8 text-lg text-zinc-400 font-medium tracking-wide">
                  {article.content}
                </div>
              </div>

              <div className="mt-24 pt-16 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div>
                  <h4 className="text-zinc-600 font-black uppercase tracking-widest text-[9px] mb-4 italic">Origin Protocol</h4>
                  <a 
                    href={article.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-white hover:text-yellow-400 transition-colors font-black text-sm underline decoration-zinc-800 underline-offset-8"
                  >
                    {article.url}
                  </a>
                </div>
                <button 
                   onClick={() => window.open(article.url, '_blank')}
                   className="bg-white text-black px-10 py-5 font-black uppercase text-[10px] tracking-widest hover:bg-yellow-400 transition-all"
                >
                  Visit Origin
                </button>
              </div>
            </div>

            <aside className="lg:col-span-4 space-y-12">
              <div className="bg-zinc-950 border border-zinc-900 p-8">
                <h4 className="text-xs font-black uppercase tracking-[0.3em] text-yellow-400 mb-8">Metadata</h4>
                <div className="space-y-6">
                  <div className="flex flex-col gap-1 border-b border-zinc-900 pb-4">
                    <span className="text-[9px] text-zinc-700 uppercase font-black tracking-widest">Protocol</span>
                    <span className="text-xs text-zinc-300 uppercase font-bold">Encrypted_Transmission</span>
                  </div>
                  <div className="flex flex-col gap-1 border-b border-zinc-900 pb-4">
                    <span className="text-[9px] text-zinc-700 uppercase font-black tracking-widest">Priority_Level</span>
                    <span className={`text-xs uppercase font-black ${article.is_hero ? 'text-red-500' : 'text-zinc-400'}`}>
                      {article.is_hero ? 'Omega_Primary' : 'Standard_Intelligence'}
                    </span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </article>
      </main>

      <footer className="bg-black border-t border-zinc-900 py-20 px-8 text-center">
        <p className="text-zinc-900 font-black uppercase tracking-[1.5em] text-[10px]">Transmission Complete</p>
      </footer>
    </div>
  );
};

export default ArticleView;