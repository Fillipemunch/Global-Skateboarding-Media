
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from './components/Header';
import ArticleView from './components/ArticleView';
import NewsCard from './components/NewsCard';
import { fetchSkateHubData } from './services/geminiService';
import { getSkateNews, syncNewsToSupabase, isSupabaseConfigured } from './services/supabaseService';
import { SkateNewsItem, GroundingChunk } from './types';

type ViewState = 'home' | 'events' | 'videos' | 'culture' | 'article';
type CultureSubView = 'daily' | 'heritage';
type RegionFilter = 'ALL' | 'BRAZIL' | 'EUROPE' | 'USA' | 'GLOBAL';

const SKATE_KEYWORDS = [
  'skate', 'skating', 'skater', 'thrasher', 'sls', 'ollie', 'contest', 
  'deck', 'trucks', 'wheels', 'berrics', 'cph', 'pushed', 'grind', 
  'kickflip', 'heelflip', 'vert', 'bowl', 'street', 'session', 'transworld', 'copenhagen open'
];

const App: React.FC = () => {
  const [news, setNews] = useState<SkateNewsItem[]>([]);
  const [sources, setSources] = useState<GroundingChunk[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [cultureSubView, setCultureSubView] = useState<CultureSubView>('daily');
  const [selectedRegion, setSelectedRegion] = useState<RegionFilter>('ALL');
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadData = useCallback(async (refreshFromAI = false) => {
    setLoading(true);
    setError(null);
    try {
      if (refreshFromAI) {
        const result = await fetchSkateHubData();
        setNews(result.data);
        setSources(result.sources);
        if (isSupabaseConfigured()) await syncNewsToSupabase(result.data);
      } else {
        const dbNews = await getSkateNews();
        if (dbNews && dbNews.length > 0) {
          setNews(dbNews);
        } else {
          const result = await fetchSkateHubData();
          setNews(result.data);
          setSources(result.sources);
        }
      }
    } catch (err: any) {
      setError(`SATELLITE INTERRUPT: ${err.message || 'Signal lost.'}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredNews = useMemo(() => {
    let result = news.filter(item => {
      const textToSearch = `${item.title} ${item.summary} ${item.content}`.toLowerCase();
      return SKATE_KEYWORDS.some(word => textToSearch.includes(word));
    });

    if (selectedRegion !== 'ALL') {
      result = result.filter(item => item.region === selectedRegion);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.title.toLowerCase().includes(q) || 
        item.summary.toLowerCase().includes(q) ||
        item.content.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    }

    return result;
  }, [news, searchQuery, selectedRegion]);

  const headlines = useMemo(() => filteredNews.map(n => n.title), [filteredNews]);

  const activeArticle = useMemo(() => {
    if (!selectedArticleId) return null;
    return filteredNews.find((n) => n.id?.toString() === selectedArticleId || n.id === selectedArticleId);
  }, [filteredNews, selectedArticleId]);

  const openArticle = (item: SkateNewsItem) => {
    if (item.id) {
      setSelectedArticleId(item.id.toString());
      setCurrentView('article');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const setView = (view: ViewState) => {
    setCurrentView(view);
    setSelectedArticleId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (currentView === 'article') setView('home');
  };

  const categories = useMemo(() => {
    const sortedNews = [...filteredNews];
    return {
      hero: sortedNews.find(n => n.is_hero) || sortedNews[0],
      industry: sortedNews.filter(n => n.category === 'industry'),
      videos: sortedNews.filter(n => n.category === 'video_parts'),
      events2025: sortedNews.filter(n => n.category === 'event_2025_recap'),
      events2026: sortedNews.filter(n => n.category === 'event_2026_schedule'),
      culture: sortedNews.filter(n => n.category === 'culture'),
      heritage: sortedNews.filter(n => n.category === 'brand_history').sort((a, b) => a.title.localeCompare(b.title)),
    };
  }, [filteredNews]);

  const renderRegionTabs = () => (
    <nav className="flex gap-8 border-b border-zinc-900 pb-4 mb-12 overflow-x-auto whitespace-nowrap no-scrollbar sticky top-[TickerHeight]">
      {(['ALL', 'BRAZIL', 'EUROPE', 'USA', 'GLOBAL'] as RegionFilter[]).map((region) => (
        <button 
          key={region}
          onClick={() => setSelectedRegion(region)} 
          className={`font-black text-[12px] uppercase tracking-[0.4em] transition-all pb-2 italic ${selectedRegion === region ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-zinc-500 hover:text-white'}`}
        >
          {region === 'ALL' ? 'All News' : region}
        </button>
      ))}
    </nav>
  );

  const renderContent = () => {
    if (loading && filteredNews.length === 0 && !searchQuery) return (
      <div className="flex flex-col items-center justify-center py-48 gap-8">
        <div className="w-20 h-20 border-t-2 border-yellow-400 rounded-full animate-spin"></div>
        <p className="font-black text-xs uppercase tracking-[0.8em] text-zinc-800 animate-pulse">Syncing Global Satellite Feed...</p>
      </div>
    );

    if (error && filteredNews.length === 0) return (
      <div className="flex flex-col items-center justify-center py-48 gap-8 text-center px-8">
        <h2 className="text-red-500 font-black text-4xl italic tracking-tighter mb-4 uppercase">Signal Interrupt</h2>
        <p className="text-zinc-500 font-medium max-w-md">{error}</p>
        <button onClick={() => loadData(true)} className="mt-8 bg-white text-black px-10 py-4 font-black uppercase text-[10px] tracking-widest hover:bg-yellow-400">Restart Uplink</button>
      </div>
    );

    if (currentView === 'article' && activeArticle) {
      return <ArticleView article={activeArticle} onBack={() => setView('home')} />;
    }

    const newsToDisplay = currentView === 'home' ? filteredNews : (
      currentView === 'videos' ? categories.videos : (
        currentView === 'events' ? [...categories.events2025, ...categories.events2026] : (
          currentView === 'culture' ? (cultureSubView === 'daily' ? categories.culture : categories.heritage) : []
        )
      )
    );

    return (
      <div className="space-y-12">
        {renderRegionTabs()}
        
        {currentView === 'culture' && cultureSubView === 'heritage' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.heritage.map((h, i) => (
              <div 
                key={h.id || i} 
                onClick={() => openArticle(h)}
                className="brand-card group"
              >
                <div className="relative overflow-hidden aspect-[16/9] mb-8 bg-zinc-900">
                  <img 
                    src={h.image_url || `https://via.placeholder.com/800x450?text=HERITAGE`} 
                    alt={h.title} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-in-out" 
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-all duration-500"></div>
                </div>
                <div className="flex flex-col gap-4 flex-grow">
                  <span className="text-yellow-400 text-[10px] font-black uppercase tracking-[0.3em] italic">{h.region || 'GLOBAL'} // ARCHIVE</span>
                  <h3 className="font-black text-4xl italic italic-headline leading-none group-hover:text-yellow-400 transition-colors uppercase">
                    {h.title}
                  </h3>
                  <p className="text-zinc-400 text-base italic italic-headline line-clamp-3 mb-8">{h.summary}</p>
                  <button className="mt-auto bg-white text-black px-10 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-yellow-400 transition-all italic shadow-2xl">
                    Read Full Heritage
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {newsToDisplay.map((item, i) => (
              <NewsCard 
                key={item.id || i}
                title={item.title}
                category={item.category}
                region={item.region}
                description={item.summary}
                link={item.url}
                date={item.date}
                youtubeId={item.youtube_id}
                onClick={() => openArticle(item)}
              />
            ))}
            {newsToDisplay.length === 0 && <p className="text-center py-24 text-zinc-800 font-black uppercase tracking-[0.8em] text-[10px]">No sector intelligence found for "{selectedRegion}".</p>}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black flex flex-col selection:bg-yellow-400 selection:text-black">
      <div className="bg-yellow-400 text-black py-2 ticker-container border-b border-black sticky top-0 z-[60]">
        <div className="ticker-content font-black text-[10px] uppercase tracking-tighter">
          {headlines.length > 0 ? headlines.join(" • ") + " • " + headlines.join(" • ") : "SYNCHRONIZING GLOBAL INTELLIGENCE NODES... SIGNAL_STRENGTH_MAXIMIZED..."}
        </div>
      </div>
      <Header 
        currentView={currentView} 
        setView={setView} 
        searchQuery={searchQuery}
        onSearch={handleSearch}
      />
      <main className="max-w-[1400px] mx-auto px-8 py-20 w-full">{renderContent()}</main>
      <footer className="bg-black border-t border-zinc-900 py-40 px-8 mt-32 text-center">
        <h2 className="text-9xl md:text-[14rem] font-black italic italic-headline text-white leading-[0.75] tracking-tighter mb-16 uppercase">GRIND<br /><span className="text-yellow-400">PULSE</span></h2>
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
