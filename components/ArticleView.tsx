export const ArticleView = ({ article }) => {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20 bg-black">
      <nav className="mb-10">
        <a href="/" className="text-zinc-500 uppercase text-xs font-bold tracking-widest hover:text-white">← Back to Feed</a>
      </nav>
      <span className="text-yellow-400 font-black uppercase text-xs">{article.region}</span>
      <h1 className="text-5xl font-black italic uppercase text-white my-6 leading-none">{article.title}</h1>
      <div className="text-zinc-300 text-xl leading-relaxed italic space-y-6">
        {article.content}
      </div>
    </div>
  );
};
