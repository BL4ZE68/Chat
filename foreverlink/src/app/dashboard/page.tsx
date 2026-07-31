'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Navbar from '../../components/Navbar';
import Link from 'next/link';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [friendship, setFriendship] = useState<any>(null);
  const [friend, setFriend] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ messages: 0, entries: 0 });

  useEffect(() => {
    let subscription: any;
    async function init() {
      const { data } = await supabase.auth.getUser();
      const u = data.user || null;
      setUser(u);

      if (u) {
        // Load friendship
        const { data: fs } = await supabase.from('friendships').select('*').or(`user_1_id.eq.${u.id},user_2_id.eq.${u.id}`).limit(1).single();
        if (fs) {
          setFriendship(fs);
          // Load friend profile
          const friendId = fs.user_1_id === u.id ? fs.user_2_id : fs.user_1_id;
          if (friendId) {
            const { data: friendData } = await supabase.from('users').select('*').eq('id', friendId).single();
            setFriend(friendData);
          }
          // Count messages
          const { count: msgCount } = await supabase.from('messages').select('*', { count: 'exact', head: true }).eq('friendship_id', fs.id);
          // Count journal entries
          const { count: entryCount } = await supabase.from('journal_entries').select('*', { count: 'exact', head: true }).eq('friendship_id', fs.id);
          setStats({ messages: msgCount || 0, entries: entryCount || 0 });
        }
      }

      setLoading(false);

      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });
      subscription = listener;
    }
    init();
    return () => {
      try { subscription?.subscription?.unsubscribe(); } catch (e) { /* ignore */ }
    };
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setFriendship(null);
  }

  function daysSince(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  }

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

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="page-container">
          <div className="glass-card-static p-12 text-center max-w-lg mx-auto animate-fadeIn">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6" style={{ background: 'rgba(139, 92, 246, 0.15)' }}>
              <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
                <defs><linearGradient id="d-hg" x1="0" y1="0" x2="28" y2="28"><stop offset="0%" stopColor="#8b5cf6" /><stop offset="100%" stopColor="#ec4899" /></linearGradient></defs>
                <path d="M14 25.5C14 25.5 3.5 19 3.5 11.5C3.5 8 6 5.5 9 5.5C11 5.5 12.8 6.8 14 8.5C15.2 6.8 17 5.5 19 5.5C22 5.5 24.5 8 24.5 11.5C24.5 19 14 25.5 14 25.5Z" fill="url(#d-hg)" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Bienvenue sur ForeverLink</h2>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>Connectez-vous pour accéder à votre monde partagé</p>
            <Link href="/signin" className="btn-primary" id="dash-signin">
              Se connecter
            </Link>
          </div>
        </div>
      </>
    );
  }

  const nickname = user.user_metadata?.nickname || user.email?.split('@')[0] || 'Ami';
  const friendNickname = friend?.nickname || 'Ton/ta BFF';

  return (
    <>
      <Navbar />
      <div className="page-container animate-fadeIn">
        {/* Welcome header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="page-title">
              Salut, <span className="gradient-text">{nickname}</span> 💜
            </h1>
            <p className="page-subtitle" style={{ marginBottom: 0 }}>
              Bienvenue dans votre monde partagé
            </p>
          </div>
          <button onClick={signOut} className="btn-ghost text-red-400 hover:text-red-300" id="dash-signout">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Déconnexion
          </button>
        </div>

        {/* Duo status card */}
        {friendship ? (
          <div className="glass-card-static p-6 mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex -space-x-3">
                <div className="avatar-circle" style={{ zIndex: 2 }}>
                  {nickname.charAt(0).toUpperCase()}
                </div>
                <div className="avatar-circle" style={{ zIndex: 1, background: 'linear-gradient(135deg, #ec4899, #f97316)' }}>
                  {friendNickname.charAt(0).toUpperCase()}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{nickname} & {friendNickname}</h3>
                  <span className={`badge ${friendship.status === 'active' ? 'badge-active' : 'badge-pending'}`}>
                    {friendship.status === 'active' ? '● Connectés' : '◐ En attente'}
                  </span>
                </div>
                {friendship.met_since && (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    🎉 {daysSince(friendship.met_since)} jours d&apos;amitié
                  </p>
                )}
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-xl" style={{ background: 'rgba(139, 92, 246, 0.08)' }}>
                <div className="text-2xl font-bold gradient-text">{stats.messages}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Messages</div>
              </div>
              <div className="text-center p-3 rounded-xl" style={{ background: 'rgba(236, 72, 153, 0.08)' }}>
                <div className="text-2xl font-bold gradient-text">{stats.entries}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Souvenirs</div>
              </div>
              <div className="text-center p-3 rounded-xl" style={{ background: 'rgba(139, 92, 246, 0.08)' }}>
                <div className="text-2xl font-bold gradient-text">∞</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Ensemble</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-card-static p-8 text-center mb-8">
            <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>Vous n&apos;avez pas encore d&apos;Espace Duo</p>
            <Link href="/pairing" className="btn-primary" id="dash-pair">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              Créer ou rejoindre un Duo
            </Link>
          </div>
        )}

        {/* Quick access cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          <Link href="/messages" className="glass-card p-5 block animate-fadeIn" style={{ opacity: 0 }} id="dash-messages">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139, 92, 246, 0.15)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h3 className="font-semibold">Messages</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Discuter en temps réel</p>
          </Link>

          <Link href="/journal" className="glass-card p-5 block animate-fadeIn" style={{ opacity: 0 }} id="dash-journal">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(236, 72, 153, 0.15)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </div>
              <h3 className="font-semibold">Journal</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Écrire un souvenir ensemble</p>
          </Link>

          <Link href="/album" className="glass-card p-5 block animate-fadeIn" style={{ opacity: 0 }} id="dash-album">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(236, 72, 153, 0.15))' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
              <h3 className="font-semibold">Album</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Vos photos et médias</p>
          </Link>
        </div>
      </div>
    </>
  );
}
