'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Navbar from '../../components/Navbar';
import Link from 'next/link';

export default function AlbumPage() {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) { setLoading(false); return; }
      
      const { data: friendship } = await supabase.from('friendships').select('*').or(`user_1_id.eq.${uid},user_2_id.eq.${uid}`).limit(1).single();
      if (!friendship) { setLoading(false); return; }
      
      const { data } = await supabase.from('messages')
        .select('*')
        .eq('friendship_id', friendship.id)
        .eq('message_type', 'image')
        .not('media_url', 'is', null)
        .order('created_at', { ascending: false });
        
      setImages(data || []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="page-container flex items-center justify-center" style={{ minHeight: '60vh' }}>
          <div className="spinner" />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="page-container animate-fadeIn">
        <h1 className="page-title gradient-text">Album photo</h1>
        <p className="page-subtitle">Vos plus beaux moments capturés ensemble</p>

        {images.length === 0 ? (
          <div className="glass-card-static p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-6 animate-float" style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(236, 72, 153, 0.15))' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <defs>
                  <linearGradient id="album-grad" x1="0" y1="0" x2="24" y2="24">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="url(#album-grad)" />
                <circle cx="8.5" cy="8.5" r="1.5" stroke="url(#album-grad)" />
                <polyline points="21 15 16 10 5 21" stroke="url(#album-grad)" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">L&apos;album est vide</h2>
            <p className="max-w-md mx-auto" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Partagez votre première photo dans les messages pour commencer à remplir votre album de souvenirs.
            </p>
            <Link href="/messages" className="btn-primary mt-6 inline-block">
              Aller aux messages
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
            {images.map((img, i) => (
              <div
                key={img.id}
                className="aspect-square rounded-xl overflow-hidden animate-fadeIn relative group cursor-pointer"
                style={{
                  border: '1px solid var(--border-glass)',
                  animationDelay: `${i * 0.1}s`,
                  opacity: 0,
                  animationFillMode: 'forwards'
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={img.media_url} 
                  alt="Souvenir" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3 pointer-events-none">
                  <span className="text-white text-xs font-medium drop-shadow-md">
                    {new Date(img.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
