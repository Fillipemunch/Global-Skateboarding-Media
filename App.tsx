
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
      // 1. Match by Database ID if available
      if (n.id && n.id.toString() === selectedArticleId.toString()) return true;
      // 2. Match by Global Index reference
      if (selectedArticleId === `ref-${idx}`) return true;
      return false;
    });
  }, [news, selectedArticleId]);

  const openArticle = (item: SkateNewsItem) => {
    // Determine the absolute index in the master news array
    const globalIdx = news.indexOf(item);
    // Use the database ID or the global index reference as the key
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
    
    if (item.image_url && item.image_url.startsWith('http')) {
      return item.image_url;
    }
    if (item.youtube_id) {
      return `https://img.youtube.com/vi/${item.youtube_id}/maxresdefault.jpg`;
    }
    if (item.category === 'brand_history') {
      try {
        const hostname = new URL(item.url).hostname.replace('www.', '');
        return `https://logo.clearbit.com/${hostname}`;
      } catch (e) {
        return `https://source.unsplash.com/featured/?skate-logo,${item.title.split(':')[0]}`;
      }
    }
    return `https://source.unsplash.com/featured/?skateboarding,${item.category || 'news'}`;
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
        <h2 className="text-red-500 font-black text-4xl italic tracking-tighter mb-4">SIGNAL LOST</h2>
        <p className="text-zinc-500 font-medium max-w-md">{error}</p>
        <button onClick={() => loadData(true)} className="mt-8 bg-white text-black px-10 py-4 font-black uppercase text-[10px] tracking-widest hover:bg-yellow-400">Retry Synchronize</button>
      </div>
    );

    if (currentView === 'article' && activeArticle) {
      return <ArticleView article={activeArticle} onBack={() => setView('home')} />;
    }

    if (currentView === 'events') return (
      <div className="space-y-32 py-12">
        <div className="space-y-6">
          <h2 className="text-7xl md:text-9xl font-black italic italic-headline text-white tracking-tighter">Tour & Events</h2>
          <p className="text-zinc-600 font-black uppercase tracking-[0.5em] text-[10px]">Recent Victories & Future Battles</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-24">
          <section className="space-y-12">
            <h3 className="text-3xl font-black text-yellow-400 border-b-2 border-yellow-400/20 pb-6 italic tracking-widest uppercase">2025 SEASON RECAP</h3>
            <div className="space-y-12">
              {categories.events2025.map((ev, i) => (
                <div key={i} onClick={() => openArticle(ev)} className="group cursor-pointer border-l-4 border-zinc-900 pl-8 py-4 hover:border-yellow-400 transition-all bg-zinc-950/30 p-6">
                  <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest mb-2 block">Archive_Confirmed</span>
                  <h4 className="font-black text-3xl text-white group-hover:text-yellow-400 transition-colors italic leading-none mb-4">{ev.title}</h4>
                  <p className="text-zinc-500 text-sm font-medium leading-relaxed">{ev.summary}</p>
                </div>
              ))}
              {categories.events2025.length === 0 && <p className="text-zinc-800 font-black uppercase text-[10px] tracking-widest">No 2025 recaps synchronized.</p>}
            </div>
          </section>
          <section className="space-y-12">
            <h3 className="text-3xl font-black text-emerald-400 border-b-2 border-emerald-400/20 pb-6 italic tracking-widest uppercase">2026 TOUR SCHEDULE</h3>
            <div className="space-y-12">
              {categories.events2026.map((ev, i) => (
                <div key={i} onClick={() => openArticle(ev)} className="group cursor-pointer border-l-4 border-zinc-900 pl-8 py-4 hover:border-emerald-400 transition-all bg-zinc-950/30 p-6">
                  <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest mb-2 block">Forecast_Active</span>
                  <h4 className="font-black text-3xl text-white group-hover:text-emerald-400 transition-colors italic leading-none mb-4">{ev.title}</h4>
                  <p className="text-zinc-400 text-sm font-medium leading-relaxed">{ev.summary}</p>
                </div>
              ))}
              {categories.events2026.length === 0 && <p className="text-zinc-800 font-black uppercase text-[10px] tracking-widest">Awaiting 2026 tour leaks.</p>}
            </div>
          </section>
        </div>
      </div>
    );

    if (currentView === 'videos') return (
      <div className="space-y-32 py-12">
        <div className="space-y-6">
          <h2 className="text-7xl md:text-9xl font-black italic italic-headline text-white tracking-tighter">Video Parts</h2>
          <p className="text-zinc-600 font-black uppercase tracking-[0.5em] text-[10px]">Pure Visual Adrenaline</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
          {categories.videos.map((v, i) => (
            <div key={i} className="group bg-zinc-950 border border-zinc-900 overflow-hidden flex flex-col h-full shadow-2xl">
              <div className="relative aspect-video bg-black overflow-hidden border-b border-zinc-900">
                <img 
                  src={getDisplayImage(v)} 
                  alt={v.title} 
                  className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" 
                  onError={(e) => (e.currentTarget.src = `https://via.placeholder.com/800x450?text=GRIND+PULSE+NEWS`)}
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" className="w-8 h-8 ml-1">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="p-8 flex flex-col flex-grow">
                <h4 onClick={() => openArticle(v)} className="font-black text-3xl text-white group-hover:text-yellow-400 transition-colors cursor-pointer italic leading-none mb-4">{v.title}</h4>
                <p className="text-zinc-500 text-sm font-medium leading-relaxed flex-grow">{v.summary}</p>
                <div className="mt-8 flex items-center justify-between">
                  <button onClick={() => openArticle(v)} className="text-[10px] font-black uppercase tracking-[0.4em] text-white border-b-2 border-white/10 pb-1 hover:border-yellow-400 transition-all">Full Intelligence</button>
                  <span className="text-[8px] font-mono text-zinc-800">SECURE_FEED</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );

    if (currentView === 'culture') return (
      <div className="space-y-32 py-12">
        <div className="text-center space-y-6">
          <h2 className="text-7xl md:text-9xl font-black italic italic-headline text-white tracking-tighter">Culture & Heritage</h2>
          <p className="text-zinc-500 font-black uppercase tracking-[0.6em] text-[11px] italic">Art. Music. Rebellion. The Lifestyle Transmission.</p>
        </div>

        <div className="flex justify-center gap-12 border-b border-zinc-900 mb-20 max-w-2xl mx-auto">
          <button 
            onClick={() => setCultureSubView('daily')}
            className={`pb-6 font-black uppercase text-[10px] tracking-[0.3em] transition-all ${cultureSubView === 'daily' ? 'text-yellow-400 border-b-4 border-yellow-400' : 'text-zinc-700 hover:text-white'}`}
          >
            DAILY FEED
          </button>
          <button 
            onClick={() => setCultureSubView('heritage')}
            className={`pb-6 font-black uppercase text-[10px] tracking-[0.3em] transition-all ${cultureSubView === 'heritage' ? 'text-yellow-400 border-b-4 border-yellow-400' : 'text-zinc-700 hover:text-white'}`}
          >
            BRAND HERITAGE
          </button>
        </div>

        {cultureSubView === 'daily' ? (
          <div className="max-w-5xl mx-auto space-y-32">
            {categories.culture.map((c, i) => (
              <div key={i} className="group flex flex-col items-center">
                <div className="w-full aspect-[21/9] mb-16 overflow-hidden border border-zinc-900">
                  <img 
                    src={getDisplayImage(c)} 
                    alt={c.title} 
                    className="w-full h-full object-cover grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000 scale-105 group-hover:scale-100" 
                    onError={(e) => (e.currentTarget.src = `https://via.placeholder.com/1200x500?text=CULTURE+NODE`)}
                  />
                </div>
                <div className="text-center max-w-3xl space-y-8">
                  <span className="text-yellow-400 font-black text-[11px] tracking-[0.5em] uppercase">Culture Node</span>
                  <h3 onClick={() => openArticle(c)} className="text-5xl md:text-7xl font-black italic italic-headline text-white group-hover:text-yellow-400 transition-colors cursor-pointer leading-none">
                    {c.title}
                  </h3>
                  <p className="text-zinc-500 text-xl leading-relaxed font-medium italic italic-headline">{c.summary}</p>
                  <button onClick={() => openArticle(c)} className="bg-white text-black px-12 py-5 font-black uppercase text-[10px] tracking-widest hover:bg-yellow-400 transition-all shadow-xl">Read More</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
            {categories.heritage.map((h, i) => (
              <div key={i} className="bg-zinc-950 border-l-8 border-yellow-400 p-12 group cursor-pointer hover:bg-zinc-900 transition-all flex flex-col gap-8 shadow-2xl">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.4em] italic">Established Heritage</span>
                  <img 
                    src={getDisplayImage(h)} 
                    alt="Logo" 
                    className="h-10 w-auto object-contain grayscale group-hover:grayscale-0 transition-all opacity-40 group-hover:opacity-100" 
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                </div>
                <h3 onClick={() => openArticle(h)} className="text-5xl font-black italic italic-headline text-white group-hover:text-yellow-400 leading-[0.85] transition-colors">{h.title}</h3>
                <p className="text-zinc-400 text-lg leading-relaxed font-medium line-clamp-4">{h.summary}</p>
                <div className="mt-auto pt-8 border-t border-zinc-900">
                  <button onClick={() => openArticle(h)} className="text-[11px] font-black border-b-2 border-white/10 hover:border-yellow-400 pb-1 text-white transition-all uppercase tracking-widest">Read Full History</button>
                </div>
              </div>
            ))}
            {categories.heritage.length === 0 && (
              <div className="col-span-2 py-40 text-center border-4 border-dashed border-zinc-900">
                <span className="text-zinc-800 font-black uppercase tracking-[1em] text-xs">Awaiting Heritage Sync</span>
              </div>
            )}
          </div>
        )}
      </div>
    );

    // HOME VIEW
    return (
      <div className="space-y-32">
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 relative group overflow-hidden border border-zinc-900 bg-zinc-950">
            <div className="h-[650px] bg-zinc-900 flex items-center justify-center overflow-hidden">
              {categories.hero ? (
                <img 
                  src={getDisplayImage(categories.hero)} 
                  className="w-full h-full object-cover grayscale opacity-20 group-hover:opacity-50 transition-all duration-1000 group-hover:scale-105" 
                  alt="Hero" 
                  onError={(e) => (e.currentTarget.src = `https://via.placeholder.com/1600x900?text=GRIND+PULSE+HERO`)}
                />
              ) : (
                <div className="flex flex-col items-center gap-4 opacity-50">
                   <div className="w-12 h-12 border-4 border-zinc-800 border-t-yellow-400 rounded-full animate-spin"></div>
                   <span className="font-black uppercase tracking-[0.5em] text-[10px] text-zinc-600">Syncing Hero Intel...</span>
                </div>
              )}
            </div>
            <div className="absolute inset-0 hero-gradient pointer-events-none"></div>
            {categories.hero && (
              <div className="absolute bottom-0 left-0 p-12 z-20">
                <span className="bg-yellow-400 text-black px-4 py-1.5 font-black text-[10px] uppercase mb-6 inline-block italic tracking-widest">Priority Intel // {categories.hero.category.replace(/_/g, ' ')}</span>
                <h2 onClick={() => openArticle(categories.hero)} className="text-6xl md:text-9xl font-black italic italic-headline text-white leading-[0.85] mb-8 group-hover:text-yellow-400 transition-colors cursor-pointer drop-shadow-2xl">{categories.hero.title}</h2>
                <p className="text-zinc-400 max-w-2xl text-lg leading-relaxed mb-12 font-medium">{categories.hero.summary}</p>
                <button onClick={() => openArticle(categories.hero)} className="bg-zinc-900 px-10 py-5 border border-zinc-800 hover:border-yellow-400 text-[11px] font-black uppercase tracking-[0.5em] transition-all">Full Intelligence Report</button>
              </div>
            )}
          </div>
          <div className="flex flex-col h-full">
            <h3 className="text-3xl font-black italic text-white border-b-8 border-yellow-400 pb-6 mb-10 tracking-tighter">Pro Rank Intel</h3>
            <div className="flex flex-col gap-10">
              {categories.industry.length > 0 ? categories.industry.slice(0, 5).map((item, i) => (
                <div key={i} className="group border-b border-zinc-900 pb-8 last:border-0">
                  <span className="text-yellow-400 text-[9px] font-black uppercase tracking-widest mb-2 block">Source Node: 0{i+1}</span>
                  <h4 onClick={() => openArticle(item)} className="font-black text-2xl leading-tight group-hover:text-yellow-400 transition-colors cursor-pointer italic">{item.title}</h4>
                  <p className="text-zinc-500 text-sm mt-4 font-medium line-clamp-2 leading-relaxed">{item.summary}</p>
                </div>
              )) : (
                <div className="py-12 border border-dashed border-zinc-900 flex items-center justify-center">
                  <span className="text-zinc-800 font-black uppercase text-[10px] tracking-widest">No Industry Data Synced</span>
                </div>
              )}
            </div>
          </div>
        </section>
        
        {/* Source grounding */}
        {sources.length > 0 && (
          <section className="pt-32 border-t-8 border-zinc-900">
            <div className="flex justify-between items-center mb-12">
              <h3 className="text-xs font-black uppercase tracking-[0.8em] text-zinc-700">Scan Origin Nodes // Active_Grounding</h3>
              <div className="h-[1px] flex-grow mx-8 bg-zinc-900"></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {sources.map((source, idx) => source.web && (
                <a key={idx} href={source.web.uri} target="_blank" rel="noopener noreferrer" className="group border border-zinc-900 p-8 text-[11px] font-black uppercase text-zinc-600 hover:border-yellow-400 hover:text-white transition-all bg-zinc-950 aspect-square flex flex-col justify-between shadow-xl">
                  <span className="text-zinc-800 text-[9px] font-mono italic">NODE_SIG_{idx}</span>
                  <span className="line-clamp-4 leading-relaxed tracking-wider">{source.web.title}</span>
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
          {headlines.length > 0 ? headlines.join(" • ") + " • " + headlines.join(" • ") : "SYNCHRONIZING GLOBAL INTELLIGENCE NODES... SIGNAL_STRENGTH_MAXIMIZED..."}
        </div>
      </div>
      <Header currentView={currentView} setView={setView} />
      <main className="max-w-[1500px] mx-auto px-8 py-20 w-full">{renderContent()}</main>
      <footer className="bg-black border-t border-zinc-900 py-40 px-8 mt-32 text-center">
        <h2 className="text-9xl md:text-[14rem] font-black italic italic-headline text-white leading-[0.75] tracking-tighter mb-16">GRIND<br /><span className="text-yellow-400">PULSE</span></h2>
        <div className="flex flex-col md:flex-row justify-center items-center gap-12 text-[11px] font-black uppercase tracking-[0.5em] text-zinc-700 italic mb-24">
           <span>The Manifesto</span>
           <div className="w-2 h-2 rounded-full bg-zinc-900"></div>
           <span>Satellite Ops</span>
           <div className="w-2 h-2 rounded-full bg-zinc-900"></div>
           <span>Network Status: Online</span>
        </div>
        <p className="text-zinc-900 font-black uppercase tracking-[1.2em] text-[10px]">MMXXIV GRIND PULSE OPERATIONS. ALL CHANNELS ENCRYPTED.</p>
      </footer>
    </div>
  );
};

export default App;
