import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, ArrowLeft, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import TopBar from '@/components/TopBar';
import Footer from '@/components/Footer';
import PageNotFound from '@/lib/PageNotFound';
import { getPostBySlug, blogPosts } from '@/data/blogPosts';

export default function BlogPost() {
  const { slug } = useParams();
  const post = getPostBySlug(slug);

  useEffect(() => {
    if (post) {
      document.title = `${post.title} — Hi-Tech Academy`;
    }
    return () => { document.title = 'Hi-Tech Academy'; };
  }, [post]);

  if (!post) {
    return <PageNotFound />;
  }

  const others = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <div className="min-h-screen bg-white">
      <TopBar />
      <Header />

      <main className="pt-32 pb-20">
        <article className="max-w-3xl mx-auto px-4 sm:px-6">

          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold mb-8 transition-all hover:gap-3"
            style={{ color: '#005064', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <ArrowLeft className="w-4 h-4" />
            Tous les articles
          </Link>

          {/* En-tête d'article */}
          <div className="mb-8">
            <span
              className="inline-block px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
              style={{ backgroundColor: '#F8B102', color: 'black', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {post.category}
            </span>
            <h1
              className="text-3xl sm:text-4xl font-bold leading-tight mb-4"
              style={{ color: '#001a4a', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {post.title}
            </h1>
            <div className="flex items-center gap-5 text-sm text-gray-500" style={{ fontFamily: "'Inter', sans-serif" }}>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <time dateTime={post.dateISO}>{post.date}</time>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {post.readTime} de lecture
              </span>
            </div>
          </div>

          {/* Image de couverture */}
          <div className="rounded-2xl overflow-hidden mb-10 aspect-[16/9]">
            <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
          </div>

          {/* Contenu */}
          <div className="article-content">
            {post.content}
          </div>

          {/* CTA formation */}
          <div
            className="mt-12 p-6 sm:p-8 rounded-2xl text-center"
            style={{ background: '#f0f3fa', border: '1px solid #e0e8f4' }}>
            <h2
              className="text-xl font-bold mb-2"
              style={{ color: '#001a4a', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Envie de passer à la pratique ?
            </h2>
            <p className="text-sm mb-5" style={{ color: '#6b7a9b', fontFamily: "'Inter', sans-serif" }}>
              Découvrez notre formation Kubernetes – Fondamentaux et introduction au GitOps : 21 h en direct, 100 % à distance,
              avec travaux pratiques sur un cluster réel.
            </p>
            <Link
              to="/#programmes"
              className="inline-flex items-center gap-2 h-11 px-6 rounded-xl font-bold text-sm transition-all hover:opacity-90"
              style={{ backgroundColor: '#005064', color: 'white', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Voir la formation
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Autres articles */}
          {others.length > 0 && (
            <div className="mt-14">
              <h2
                className="text-lg font-bold mb-6"
                style={{ color: '#001a4a', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                À lire aussi
              </h2>
              <div className="grid sm:grid-cols-2 gap-6">
                {others.map((p) => (
                  <Link key={p.slug} to={`/blog/${p.slug}`} className="group block">
                    <div className="rounded-xl overflow-hidden mb-3 aspect-[16/9]">
                      <img
                        src={p.image}
                        alt={p.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <h3
                      className="text-sm font-bold leading-snug group-hover:text-[#005064] transition-colors"
                      style={{ color: '#003040', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {p.title}
                    </h3>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>
      </main>

      {/* Styles du corps d'article */}
      <style>{`
        .article-content {
          font-family: 'Inter', sans-serif;
          color: #3d4d6b;
          font-size: 1rem;
          line-height: 1.8;
        }
        .article-content p {
          margin: 0 0 1.25rem;
        }
        .article-content h2 {
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: #001a4a;
          font-size: 1.35rem;
          font-weight: 700;
          margin: 2rem 0 0.75rem;
        }
        .article-content strong {
          color: #002d74;
        }
        .article-content a {
          color: #005064;
          text-decoration: underline;
        }
      `}</style>

      <Footer />
    </div>
  );
}
