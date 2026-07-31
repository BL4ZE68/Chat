'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Chat from '../../components/Chat';
import Navbar from '../../components/Navbar';

export default function MessagesPage() {
  const [friendshipId, setFriendshipId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [friendship, setFriendship] = useState<any>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) { setLoading(false); return; }
      const { data } = await supabase.from('friendships').select('*').or(`user_1_id.eq.${uid},user_2_id.eq.${uid}`).limit(1).single();
      if (data) { setFriendship(data); setFriendshipId(data.id); }
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="page-title gradient-text">Messages</h1>
            {friendship && (
              <p className="page-subtitle" style={{ marginBottom: 0 }}>
                Espace Duo : <span style={{ color: 'var(--accent-violet)' }}>{friendship.pairing_code}</span>
                <span className={`badge ml-2 ${friendship.status === 'active' ? 'badge-active' : 'badge-pending'}`}>
                  {friendship.status}
                </span>
              </p>
            )}
          </div>
        </div>

        {friendship ? (
          <Chat friendshipId={friendshipId} />
        ) : (
          <div className="glass-card-static p-12 text-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>Vous n&apos;avez pas encore d&apos;Espace Duo.</p>
            <a href="/pairing" className="btn-primary" id="msg-pair">Créer ou rejoindre</a>
          </div>
        )}
      </div>
    </>
  );
}
