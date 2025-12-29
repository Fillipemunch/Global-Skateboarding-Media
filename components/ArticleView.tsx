import React from 'react';

interface ArticleProps {
  article: {
    title: string;
    region: string;
    date: string;
    content: string;
  };
}

export const ArticleView: React.FC<ArticleProps> = ({ article }) => {
  if (!article) return <div className="text-white p-10">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-20 bg-black min-h-screen text-left">
      <nav className="mb-12">
        <a href="/" className="text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-white">
          ← Back to Feed
        </a>
      </nav>

      <span className="text-yellow-400 font-black uppercase text-sm tracking-widest">
        {article.region}
      </span>
      
      <h1 className="text-6xl md:text-8xl font-black italic uppercase leading-none my-8 text-white">
        {article.title}
      </h1>
      
      <p className="text-zinc-500 italic mb-12 border-l-4 border-yellow-400 pl-4 uppercase text-sm tracking-tighter">
        Published: {article.date}
      </p>
      
      <div className="text-zinc-300 text-2xl leading-relaxed space-y-8 italic font-medium">
        {article.content.split('\n').map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
};
