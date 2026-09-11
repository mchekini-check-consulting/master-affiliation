import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { blogPosts } from '@/data/blogPosts';

export default function Blog() {
  useEffect(() => {
    document.title = 'Blog — Hi-Tech Academy';
    return () => { document.title = 'Hi-Tech Academy'; };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          <div className="text-center mb-14">
            <span
              className="inline-block text-xs font-semibold uppercase tracking-[0.25em] mb-4"
              style={{ color: '#007f64', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Blog & Actualités
            </span>
            <h1
              className="font-serif-display text-3xl sm:text-4xl lg:text-[3rem] font-bold tracking-tight leading-[1.15]"
              style={{ color: '#004c3c', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Tous nos <span style={{ color: '#007f64' }}>Articles</span>
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <Link key={post.slug} to={`/blog/${post.slug}`} className="group block">
                <div className="relative overflow-hidden rounded-2xl mb-5 aspect-[4/3]">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div
                    className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: '#004c3c', color: 'white', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {post.category}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <time dateTime={post.dateISO} style={{ fontFamily: "'Inter', sans-serif" }}>{post.date}</time>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span style={{ fontFamily: "'Inter', sans-serif" }}>{post.readTime}</span>
                    </span>
                  </div>
                  <h2
                    className="text-lg font-bold leading-snug group-hover:text-[#007f64] transition-colors"
                    style={{ color: '#004c3c', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {post.title}
                  </h2>
                  <p
                    className="text-sm leading-relaxed line-clamp-2"
                    style={{ color: '#5f6b66', fontFamily: "'Inter', sans-serif" }}>
                    {post.excerpt}
                  </p>
                  <span
                    className="inline-flex items-center gap-2 text-sm font-semibold transition-all group-hover:gap-3"
                    style={{ color: '#007f64', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Lire l'article
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
