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
  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <nav className="mb-12">
        <a href="/" className="text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-white">
          ← Back to Feed
        </a>
      </nav>

      <span className="text-yellow-400 font-black uppercase text-xs tracking-widest">
        {article.region}
      </span>
      
      <h1 className="text-6xl md:text-8xl font-black italic uppercase leading-none my-8">
        {article.title}
      </h1>
      
      <p className="text-zinc-500 italic mb-12 border-l-4 border-yellow-400 pl-4">
        Published on {article.date}
      </p>
      
      <div className="text-zinc-300 text-xl leading-relaxed space-y-8 italic">
        {article.content.split('\n').map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
};
