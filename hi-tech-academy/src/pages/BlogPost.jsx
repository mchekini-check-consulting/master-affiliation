import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, ArrowLeft, ArrowRight, User } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageNotFound from '@/lib/PageNotFound';
import MarkdownContent from '@/lib/markdown';
import BookOffer from '@/components/BookOffer';
import { getPostBySlug, blogPosts } from '@/data/blogPosts';
import { getPublishedBlogArticle } from '@/api/backend';
import { SEO_ARTICLE_CATEGORY, SEO_ARTICLE_COVER, seoArticleToPost } from '@/pages/Blog';

const headingFont = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
const serifFont = { fontFamily: "'Source Serif 4', Georgia, serif" };
const bodyFont = { fontFamily: "'Inter', sans-serif" };

/** Barre de progression de lecture, fixée au sommet de la fenêtre. */
function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? Math.min(100, (window.scrollY / total) * 100) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-[3px] pointer-events-none" aria-hidden="true">
      <div
        className="h-full transition-[width] duration-150"
        style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #007f64, #00d1a5)' }} />
    </div>
  );
}

export default function BlogPost() {
  const { slug } = useParams();
  const staticPost = getPostBySlug(slug);

  // Article du pipeline SEO : cherché via l'API publique quand le slug
  // n'existe pas dans les articles codés en dur
  const [seoArticle, setSeoArticle] = useState(null);
  const [seoState, setSeoState] = useState(staticPost ? 'skipped' : 'loading');

  useEffect(() => {
    if (staticPost) return undefined;
    let cancelled = false;
    setSeoState('loading');
    getPublishedBlogArticle(slug)
      .then((article) => { if (!cancelled) { setSeoArticle(article); setSeoState('found'); } })
      .catch(() => { if (!cancelled) setSeoState('not-found'); });
    return () => { cancelled = true; };
  }, [slug, staticPost]);

  const post = staticPost ?? (seoArticle && {
    ...seoArticleToPost(seoArticle),
    image: SEO_ARTICLE_COVER,
    category: SEO_ARTICLE_CATEGORY,
    content: <MarkdownContent md={seoArticle.body_md} />,
  });

  useEffect(() => {
    if (post) {
      document.title = `${post.title} — Hi-Tech Academy`;
    }
    return () => { document.title = 'Hi-Tech Academy'; };
  }, [post]);

  // Données structurées Article + FAQPage (JSON-LD) des articles SEO
  useEffect(() => {
    if (!seoArticle?.schema_org) return undefined;
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(seoArticle.schema_org);
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, [seoArticle]);

  if (!staticPost && seoState === 'loading') {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="pt-32 pb-20 text-center">
          <p className="text-sm" style={{ color: '#5f6b66', ...bodyFont }}>Chargement…</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return <PageNotFound />;
  }

  // La FAQ est déjà dans le corps Markdown de l'article ; le tableau faq de
  // l'API ne sert qu'aux données structurées (FAQPage) injectées ci-dessus.
  const others = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <div className="min-h-screen bg-white">
      <ReadingProgress />
      <Header />

      <main className="pt-28 pb-20">
        {/* En-tête éditorial sur bande dégradée, plus large que le corps */}
        <div
          className="pt-12 pb-14 mb-10"
          style={{ background: 'linear-gradient(115deg, #eafff6 0%, #f4fffb 45%, #ffffff 75%)' }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-sm font-semibold mb-7 transition-all hover:gap-3"
              style={{ color: '#007f64', ...headingFont }}>
              <ArrowLeft className="w-4 h-4" />
              Tous les articles
            </Link>

            <div className="flex items-center gap-3 mb-5">
              <span
                className="inline-block px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ backgroundColor: '#004c3c', color: 'white', ...headingFont }}>
                {post.category}
              </span>
            </div>

            <h1
              className="font-serif-display text-3xl sm:text-4xl lg:text-[2.85rem] font-bold leading-[1.12] mb-6 max-w-3xl"
              style={{ color: '#00382c', ...serifFont }}>
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm" style={{ color: '#5f6b66', ...bodyFont }}>
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" style={{ color: '#007f64' }} />
                Hi-Tech Academy
              </span>
              <span aria-hidden="true" style={{ color: '#c9ddd4' }}>•</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" style={{ color: '#007f64' }} />
                <time dateTime={post.dateISO}>{post.date}</time>
              </span>
              <span aria-hidden="true" style={{ color: '#c9ddd4' }}>•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" style={{ color: '#007f64' }} />
                {post.readTime} de lecture
              </span>
            </div>
          </div>
        </div>

        <article className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Image de couverture */}
          <div className="rounded-3xl overflow-hidden mb-12 aspect-[21/9] shadow-lg">
            <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
          </div>

          {/* Contenu */}
          <div className="article-content">
            {post.content}
          </div>

          {/* Livre IA offert (modale email → CRM) puis nos formations */}
          <BookOffer articleSlug={post.slug} />

          {/* Autres articles */}
          {others.length > 0 && (
            <div className="mt-16 pt-10" style={{ borderTop: '1px solid #e5e5e5' }}>
              <h2
                className="font-serif-display text-2xl font-bold mb-7"
                style={{ color: '#004c3c', ...serifFont }}>
                À lire aussi
              </h2>
              <div className="grid sm:grid-cols-2 gap-7">
                {others.map((p) => (
                  <Link key={p.slug} to={`/blog/${p.slug}`} className="group block">
                    <div className="rounded-2xl overflow-hidden mb-4 aspect-[16/9]">
                      <img
                        src={p.image}
                        alt={p.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <p className="text-xs font-semibold mb-1.5" style={{ color: '#007f64', ...headingFont }}>
                      {p.category} · {p.readTime}
                    </p>
                    <h3
                      className="text-base font-bold leading-snug group-hover:text-[#007f64] transition-colors"
                      style={{ color: '#004c3c', ...headingFont }}>
                      {p.title}
                    </h3>
                    <span
                      className="inline-flex items-center gap-1.5 text-sm font-semibold mt-2 transition-all group-hover:gap-2.5"
                      style={{ color: '#007f64', ...headingFont }}>
                      Lire l'article
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>
      </main>

      {/* Typographie éditoriale du corps d'article */}
      <style>{`
        .article-content {
          font-family: 'Inter', sans-serif;
          color: #33413c;
          font-size: 1.0625rem;
          line-height: 1.85;
        }
        .article-content > p:first-of-type {
          font-size: 1.2rem;
          line-height: 1.75;
          color: #00382c;
        }
        .article-content p {
          margin: 0 0 1.4rem;
        }
        .article-content h2 {
          font-family: 'Source Serif 4', Georgia, serif;
          color: #00382c;
          font-size: 1.65rem;
          font-weight: 700;
          line-height: 1.25;
          margin: 3rem 0 1rem;
          padding-top: 1.25rem;
          position: relative;
        }
        .article-content h2::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 44px;
          height: 4px;
          border-radius: 2px;
          background: linear-gradient(90deg, #007f64, #00d1a5);
        }
        .article-content h3 {
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: #004c3c;
          font-size: 1.2rem;
          font-weight: 700;
          margin: 2rem 0 0.6rem;
        }
        .article-content strong {
          color: #004c3c;
          font-weight: 700;
        }
        .article-content a {
          color: #007f64;
          font-weight: 600;
          text-decoration: underline;
          text-decoration-color: #9ff0cf;
          text-decoration-thickness: 2px;
          text-underline-offset: 3px;
          transition: text-decoration-color 0.2s;
        }
        .article-content a:hover {
          text-decoration-color: #007f64;
        }
        .article-content ul, .article-content ol {
          margin: 0 0 1.4rem;
          padding-left: 1.4rem;
        }
        .article-content ul { list-style: none; }
        .article-content ul li {
          position: relative;
          padding-left: 0.4rem;
          margin-bottom: 0.55rem;
        }
        .article-content ul li::before {
          content: '';
          position: absolute;
          left: -1.05rem;
          top: 0.72em;
          width: 7px;
          height: 7px;
          border-radius: 9999px;
          background: #00d1a5;
        }
        .article-content ol { list-style: decimal; }
        .article-content ol li {
          margin-bottom: 0.55rem;
          padding-left: 0.4rem;
        }
        .article-content ol li::marker {
          color: #007f64;
          font-weight: 700;
        }
        .article-content blockquote {
          margin: 2rem 0;
          padding: 1rem 1.5rem;
          border-left: 4px solid #00d1a5;
          background: #f4fffb;
          border-radius: 0 1rem 1rem 0;
          font-style: italic;
          color: #004c3c;
        }
        .article-content code {
          background: #eafff6;
          color: #004c3c;
          padding: 0.15rem 0.4rem;
          border-radius: 0.35rem;
          font-size: 0.9em;
        }
        .article-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 0 0 1.4rem;
          font-size: 0.95rem;
        }
        .article-content th, .article-content td {
          border: 1px solid #dff7ec;
          padding: 0.6rem 0.9rem;
          text-align: left;
        }
        .article-content th {
          background: #eafff6;
          color: #004c3c;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
      `}</style>

      <Footer />
    </div>
  );
}
