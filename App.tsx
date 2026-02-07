import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from './components/Header';
import ArticleView from './components/ArticleView';
import { fetchSkateHubData } from './services/geminiService';
import { getSkateNews, syncNewsToSupabase, isSupabaseConfigured } from './services/supabaseService';
import { SkateNewsItem, GroundingChunk } from './types';

type ViewState = 'home' | 'events' | 'videos' | 'culture' | 'article';
type CultureSubView = 'daily' | 'heritage';

const App: React.FC = () => {
  const [news, setNews] = useState<SkateNewsItem[]>([]);
  const [sources, setSources] = useState<GroundingChunk[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [cultureSubView, setCultureSubView] = useState<CultureSubView>('daily');
  const [selectedArticleId, setSelectedArticleId] = useState<number | string | null>(null);

  const loadData = useCallback(async (refreshFromAI = false) => {
    setLoading(true);
    setError(null);
    try {
      if (refreshFromAI) {
        const result = await fetchSkateHubData();
        setNews(result.data);
        setSources(result.sources);
        setLastSync(new Date().toLocaleTimeString());
        if (isSupabaseConfigured()) await syncNewsToSupabase(result.data);
      } else {
        const dbNews = await getSkateNews();
        if (dbNews && dbNews.length > 0) {
          setNews(dbNews);
          setLastSync("Remote_DB");
        } else {
          const result = await fetchSkateHubData();
          setNews(result.data);
          setSources(result.sources);
          setLastSync(new Date().toLocaleTimeString());
        }
      }
    } catch (err: any) {
      setError(`SATELLITE INTERRUPT: ${err.message || 'Signal lost.'}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const headlines = useMemo(() => news.map(n => n.title), [news]);

  const activeArticle = useMemo(() => {
    if (!selectedArticleId) return null;
    return news.find((n, idx) => {
      if (n.id && n.id.toString() === selectedArticleId.toString()) return true;
      if (selectedArticleId === `ref-${idx}`) return true;
      return false;
    });
  }, [news, selectedArticleId]);

  const openArticle = (item: SkateNewsItem) => {
    const globalIdx = news.indexOf(item);
    setSelectedArticleId(item.id || `ref-${globalIdx}`);
    setCurrentView('article');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setView = (view: ViewState) => {
    setCurrentView(view);
    setSelectedArticleId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getDisplayImage = (item?: SkateNewsItem) => {
    if (!item) return 'https://via.placeholder.com/1600x900?text=UPLINK_PENDING';
    if (item.image_url && item.image_url.startsWith('http')) return item.image_url;
    if (item.youtube_id) return `https://img.youtube.com/vi/${item.youtube_id}/maxresdefault.jpg`;
    return `https://images.unsplash.com/photo-1547447134-cd3f5c716030?q=80&w=800&auto=format&fit=crop`;
  };

  const categories = useMemo(() => ({
    hero: news.find(n => n.is_hero) || news[0],
    industry: news.filter(n => n.category === 'industry'),
    videos: news.filter(n => n.category === 'video_parts'),
    events2025: news.filter(n => n.category === 'event_2025_recap'),
    events2026: news.filter(n => n.category === 'event_2026_schedule'),
    culture: news.filter(n => n.category === 'culture'),
    heritage: news.filter(n => n.category === 'brand_history'),
  }), [news]);

  const renderContent = () => {
    if (loading && news.length === 0) return (
      <div className="flex flex-col items-center justify-center py-48 gap-8">
        <div className="w-20 h-20 border-t-2 border-yellow-400 rounded-full animate-spin"></div>
        <p className="font-black text-xs uppercase tracking-[0.8em] text-zinc-800 animate-pulse">Decrypting Signal Packets...</p>
      </div>
    );

    if (error && news.length === 0) return (
      <div className="flex flex-col items-center justify-center py-48 gap-8 text-center px-8">
        <div className="bg-zinc-900 border border-zinc-800 p-12 max-w-2xl">
           <h2 className="text-red-500 font-black text-4xl italic tracking-tighter mb-4">SIGNAL LOST</h2>
           <p className="text-zinc-400 font-medium mb-8 leading-relaxed">{error}</p>
           <div className="text-[10px] text-zinc-600 font-mono mb-8 uppercase tracking-widest bg-black p-4 text-left border-l-2 border-red-500">
              Help: If running on Netlify, go to Site Settings {" > "} Env Variables and add API_KEY. 
              Ensure the value is your valid Google Gemini API Key.
           </div>
           <button onClick={() => loadData(true)} className="bg-white text-black px-10 py-4 font-black uppercase text-[10px] tracking-widest hover:bg-yellow-400 transition-colors">Retry Uplink</button>
        </div>
      </div>
    );

    if (currentView === 'article' && activeArticle) {
      return <ArticleView article={activeArticle} onBack={() => setView('home')} />;
    }

    if (currentView === 'events') return (
      <div className="space-y-32 py-12">
        <h2 className="text-7xl md:text-9xl font-black italic italic-headline text-white tracking-tighter">Tour & Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-24">
          <section className="space-y-12">
            <h3 className="text-3xl font-black text-yellow-400 border-b-2 border-yellow-400/20 pb-6 italic uppercase">2025 SEASON RECAP</h3>
            <div className="space-y-12">
              {categories.events2025.map((ev, i) => (
                <div key={i} onClick={() => openArticle(ev)} className="group cursor-pointer border-l-4 border-zinc-900 pl-8 py-4 hover:border-yellow-400 transition-all bg-zinc-950/30 p-6">
                  <h4 className="font-black text-3xl text-white group-hover:text-yellow-400 transition-colors italic leading-none mb-4">{ev.title}</h4>
                  <p className="text-zinc-500 text-sm font-medium leading-relaxed">{ev.summary}</p>
                </div>
              ))}
            </div>
          </section>
          <section className="space-y-12">
            <h3 className="text-3xl font-black text-emerald-400 border-b-2 border-emerald-400/20 pb-6 italic uppercase">2026 TOUR SCHEDULE</h3>
            <div className="space-y-12">
              {categories.events2026.map((ev, i) => (
                <div key={i} onClick={() => openArticle(ev)} className="group cursor-pointer border-l-4 border-zinc-900 pl-8 py-4 hover:border-emerald-400 transition-all bg-zinc-950/30 p-6">
                  <h4 className="font-black text-3xl text-white group-hover:text-emerald-400 transition-colors italic leading-none mb-4">{ev.title}</h4>
                  <p className="text-zinc-400 text-sm font-medium leading-relaxed">{ev.summary}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );

    if (currentView === 'videos') return (
      <div className="space-y-32 py-12">
        <h2 className="text-7xl md:text-9xl font-black italic italic-headline text-white tracking-tighter">Video Parts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
          {categories.videos.map((v, i) => (
            <div key={i} onClick={() => openArticle(v)} className="group bg-zinc-950 border border-zinc-900 overflow-hidden flex flex-col h-full shadow-2xl cursor-pointer">
              <div className="relative aspect-video bg-black overflow-hidden border-b border-zinc-900">
                <img src={getDisplayImage(v)} alt={v.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
              </div>
              <div className="p-8">
                <h4 className="font-black text-3xl text-white group-hover:text-yellow-400 transition-colors italic leading-none mb-4">{v.title}</h4>
                <p className="text-zinc-500 text-sm font-medium leading-relaxed">{v.summary}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );

    if (currentView === 'culture') return (
      <div className="space-y-32 py-12">
        <div className="text-center">
          <h2 className="text-7xl md:text-9xl font-black italic italic-headline text-white tracking-tighter">Culture</h2>
        </div>
        <div className="flex justify-center gap-12 border-b border-zinc-900 mb-20 max-w-2xl mx-auto">
          <button onClick={() => setCultureSubView('daily')} className={`pb-6 font-black uppercase text-[10px] tracking-[0.3em] ${cultureSubView === 'daily' ? 'text-yellow-400 border-b-4 border-yellow-400' : 'text-zinc-700'}`}>DAILY FEED</button>
          <button onClick={() => setCultureSubView('heritage')} className={`pb-6 font-black uppercase text-[10px] tracking-[0.3em] ${cultureSubView === 'heritage' ? 'text-yellow-400 border-b-4 border-yellow-400' : 'text-zinc-700'}`}>BRAND HERITAGE</button>
        </div>
        <div className="max-w-5xl mx-auto space-y-32">
          {(cultureSubView === 'daily' ? categories.culture : categories.heritage).map((c, i) => (
            <div key={i} onClick={() => openArticle(c)} className="group cursor-pointer">
              <div className="w-full aspect-[21/9] mb-8 overflow-hidden border border-zinc-900">
                <img src={getDisplayImage(c)} alt={c.title} className="w-full h-full object-cover grayscale opacity-30 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-1000" />
              </div>
              <h3 className="text-5xl md:text-7xl font-black italic text-white group-hover:text-yellow-400 transition-colors text-center">{c.title}</h3>
              <p className="text-zinc-500 text-xl leading-relaxed font-medium italic text-center mt-4">{c.summary}</p>
            </div>
          ))}
        </div>
      </div>
    );

    return (
      <div className="space-y-32">
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 relative group overflow-hidden border border-zinc-900 bg-zinc-950">
            <div className="h-[650px] overflow-hidden">
              <img src={getDisplayImage(categories.hero)} className="w-full h-full object-cover grayscale opacity-20 group-hover:opacity-50 transition-all duration-1000 group-hover:scale-105" alt="Hero" />
            </div>
            <div className="absolute inset-0 hero-gradient pointer-events-none"></div>
            {categories.hero && (
              <div className="absolute bottom-0 left-0 p-12 z-20">
                <span className="bg-yellow-400 text-black px-4 py-1.5 font-black text-[10px] uppercase mb-6 inline-block italic tracking-widest">Priority Intel</span>
                <h2 onClick={() => openArticle(categories.hero)} className="text-6xl md:text-9xl font-black italic text-white leading-[0.85] mb-8 group-hover:text-yellow-400 transition-colors cursor-pointer">{categories.hero.title}</h2>
                <p className="text-zinc-400 max-w-2xl text-lg leading-relaxed mb-12 font-medium">{categories.hero.summary}</p>
                <button onClick={() => openArticle(categories.hero)} className="bg-zinc-900 px-10 py-5 border border-zinc-800 hover:border-yellow-400 text-[11px] font-black uppercase tracking-[0.5em] transition-all">Full Intel</button>
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <h3 className="text-3xl font-black italic text-white border-b-8 border-yellow-400 pb-6 mb-10 tracking-tighter">Pro Rank Intel</h3>
            <div className="space-y-10">
              {categories.industry.slice(0, 5).map((item, i) => (
                <div key={i} onClick={() => openArticle(item)} className="group border-b border-zinc-900 pb-8 last:border-0 cursor-pointer">
                  <h4 className="font-black text-2xl leading-tight group-hover:text-yellow-400 transition-colors italic">{item.title}</h4>
                  <p className="text-zinc-500 text-sm mt-4 font-medium line-clamp-2">{item.summary}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {sources.length > 0 && (
          <section className="pt-32 border-t-8 border-zinc-900">
            <h3 className="text-xs font-black uppercase tracking-[0.8em] text-zinc-700 mb-12">Scan Origin Nodes</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {sources.map((source, idx) => source.web && (
                <a key={idx} href={source.web.uri} target="_blank" rel="noopener noreferrer" className="group border border-zinc-900 p-8 text-[11px] font-black uppercase text-zinc-600 hover:border-yellow-400 hover:text-white transition-all bg-zinc-950 aspect-square flex flex-col justify-between">
                  <span className="text-zinc-800 text-[9px] font-mono">NODE_{idx}</span>
                  <span className="line-clamp-4 leading-relaxed">{source.web.title}</span>
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black flex flex-col selection:bg-yellow-400 selection:text-black">
      <div className="bg-yellow-400 text-black py-2 ticker-container border-b border-black sticky top-0 z-50">
        <div className="ticker-content font-black text-[10px] uppercase tracking-tighter">
          {headlines.length > 0 ? headlines.join(" • ") + " • " + headlines.join(" • ") : "SYNCHRONIZING GLOBAL INTELLIGENCE NODES..."}
        </div>
      </div>
      <Header currentView={currentView} setView={setView} />
      <main className="max-w-[1500px] mx-auto px-8 py-20 w-full">{renderContent()}</main>
      <footer className="bg-black border-t border-zinc-900 py-40 px-8 mt-32 text-center">
        <h2 className="text-9xl md:text-[14rem] font-black italic text-white leading-[0.75] tracking-tighter mb-16">GRIND<br /><span className="text-yellow-400">PULSE</span></h2>
        <p className="text-zinc-900 font-black uppercase tracking-[1.2em] text-[10px]">MMXXIV GRIND PULSE OPERATIONS.</p>
      </footer>
    </div>
  );
};

export default App;