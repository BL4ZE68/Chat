'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Navbar from '../../components/Navbar';

export default function JournalPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [friendshipId, setFriendshipId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) { setLoading(false); return; }
      const { data: friendship } = await supabase.from('friendships').select('*').or(`user_1_id.eq.${uid},user_2_id.eq.${uid}`).limit(1).single();
      if (!friendship) { setLoading(false); return; }
      setFriendshipId(friendship.id);
      const { data } = await supabase.from('journal_entries').select('*').eq('friendship_id', friendship.id).order('created_at', { ascending: false });
      setEntries(data || []);
      setLoading(false);
    }
    load();
  }, []);

  async function addEntry(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (!uid || !friendshipId) { setSaving(false); return; }
    await supabase.from('journal_entries').insert({ friendship_id: friendshipId, author_id: uid, title, content });
    setTitle(''); setContent('');
    const { data } = await supabase.from('journal_entries').select('*').eq('friendship_id', friendshipId).order('created_at', { ascending: false });
    setEntries(data || []);
    setSaving(false);
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

  return (
    <>
      <Navbar />
      <div className="page-container animate-fadeIn">
        <h1 className="page-title gradient-text">Journal partagé</h1>
        <p className="page-subtitle">Vos souvenirs les plus précieux, ensemble pour toujours</p>

        {/* New entry form */}
        <div className="glass-card-static p-6 mb-8">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nouveau souvenir
          </h3>
          <form onSubmit={addEntry} className="space-y-4">
            <div>
              <label htmlFor="journal-title" className="label-text">Titre</label>
              <input
                id="journal-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Un moment inoubliable..."
                className="input-field"
              />
            </div>
            <div>
              <label htmlFor="journal-content" className="label-text">Votre souvenir</label>
              <textarea
                id="journal-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Racontez ce moment spécial..."
                className="textarea-field"
                rows={4}
              />
            </div>
            <button className="btn-primary" disabled={saving || !title.trim() || !content.trim()} id="journal-add">
              {saving ? (
                <span className="inline-flex items-center gap-2">
                  <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                  Sauvegarde...
                </span>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                  Ajouter au journal
                </>
              )}
            </button>
          </form>
        </div>

        {/* Timeline */}
        {entries.length === 0 ? (
          <div className="glass-card-static p-12 text-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }}>
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <p style={{ color: 'var(--text-secondary)' }}>Aucune entrée pour l&apos;instant. Commencez à écrire votre histoire ✨</p>
          </div>
        ) : (
          <div className="relative pl-10 space-y-6">
            {/* Timeline line */}
            <div className="timeline-line" />

            {entries.map((entry, i) => (
              <div
                key={entry.id}
                className="relative animate-fadeIn"
                style={{ animationDelay: `${i * 0.1}s`, opacity: 0 }}
              >
                {/* Timeline dot */}
                <div className="timeline-dot" style={{ top: '24px' }} />

                {/* Entry card */}
                <div className="glass-card p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg">{entry.title}</h3>
                    <span className="text-xs flex-shrink-0 ml-3" style={{ color: 'var(--text-muted)' }}>
                      {new Date(entry.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                    {entry.content}
                  </p>
                  {entry.location_name && (
                    <div className="mt-3 flex items-center gap-1" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {entry.location_name}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
