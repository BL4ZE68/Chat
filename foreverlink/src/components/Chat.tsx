'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Chat({ friendshipId }: { friendshipId: string | null }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let channel: any;
    async function init() {
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id ?? null);
      if (!friendshipId) return;

      const { data: list } = await supabase.from('messages').select('*').eq('friendship_id', friendshipId).order('created_at', { ascending: true });
      setMessages(list || []);

      channel = supabase.channel('public:messages')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `friendship_id=eq.${friendshipId}` }, (payload: any) => {
          setMessages((m) => [...m, payload.new]);
        })
        .subscribe();
    }
    init();
    return () => { try { channel?.unsubscribe(); } catch (e) {} };
  }, [friendshipId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function send() {
    if (!text.trim() || !friendshipId) return;
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    const senderId = userData.user?.id;
    const payload = { friendship_id: friendshipId, sender_id: senderId, content: text.trim(), message_type: 'text' };
    const { error } = await supabase.from('messages').insert(payload);
    if (error) console.error(error);
    setText('');
    setLoading(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  if (!friendshipId) {
    return (
      <div className="glass-card-static p-8 text-center">
        <p style={{ color: 'var(--text-secondary)' }}>
          Pas d&apos;espace Duo. Créez ou rejoignez un Duo via l&apos;appairage.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card-static flex flex-col" style={{ height: '65vh' }}>
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3 opacity-30">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <p className="text-sm">Aucun message encore. Dites bonjour ! 👋</p>
          </div>
        )}
        {messages.map((m, i) => {
          const isMine = m.sender_id === userId;
          return (
            <div
              key={m.id}
              className={`flex ${isMine ? 'justify-end' : 'justify-start'} animate-fadeIn`}
              style={{ animationDelay: `${Math.min(i * 0.03, 0.5)}s`, opacity: 0 }}
            >
              <div>
                <div className={isMine ? 'bubble-mine' : 'bubble-theirs'}>
                  {m.content}
                </div>
                <div
                  className={`text-xs mt-1 ${isMine ? 'text-right' : 'text-left'}`}
                  style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}
                >
                  {new Date(m.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="p-4" style={{ borderTop: '1px solid var(--border-glass)' }}>
        <div className="flex gap-3 items-end">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="input-field flex-1"
            placeholder="Écrire un message..."
            id="chat-input"
          />
          <button
            onClick={send}
            className="btn-primary px-4 py-3"
            disabled={loading || !text.trim()}
            id="chat-send"
            style={{ borderRadius: 'var(--radius-md)' }}
          >
            {loading ? (
              <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
