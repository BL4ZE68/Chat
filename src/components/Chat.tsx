'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Chat({ friendshipId }: { friendshipId: string | null }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [mode, setMode] = useState<'text' | 'image' | 'capsule'>('text');
  const [capsuleDate, setCapsuleDate] = useState('');
  
  const bottomRef = useRef<HTMLDivElement | null>(null);
  // Force a re-render every minute to update capsule locks
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

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
    if (mode === 'capsule' && !capsuleDate) return;
    
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    const senderId = userData.user?.id;
    
    const payload: any = { 
      friendship_id: friendshipId, 
      sender_id: senderId, 
      content: text.trim(), 
      message_type: mode 
    };

    if (mode === 'image') {
      payload.media_url = text.trim();
      payload.content = '📸 Image';
    } else if (mode === 'capsule') {
      payload.is_capsule = true;
      payload.unlock_at = new Date(capsuleDate).toISOString();
    }

    const { error } = await supabase.from('messages').insert(payload);
    if (error) console.error(error);
    
    setText('');
    setMode('text');
    setCapsuleDate('');
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

  const now = Date.now();

  return (
    <div className="glass-card-static flex flex-col" style={{ height: '70vh' }}>
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
          
          let content = <>{m.content}</>;
          if (m.message_type === 'image' && m.media_url) {
            content = <img src={m.media_url} alt="Shared media" className="rounded-lg max-w-full h-auto mt-1" style={{ maxHeight: '220px', objectFit: 'cover' }} />;
          } else if (m.is_capsule) {
            const unlockTime = m.unlock_at ? new Date(m.unlock_at).getTime() : 0;
            if (unlockTime > now) {
              content = (
                <div className="flex flex-col items-center gap-2 p-2 text-sm italic opacity-90">
                  <span className="text-2xl">🔒</span>
                  <span className="text-center">Capsule verrouillée<br/>s&apos;ouvrira le {new Date(m.unlock_at).toLocaleDateString('fr-FR')}</span>
                </div>
              );
            } else {
              content = (
                <div>
                  <div className="text-xs mb-1 opacity-70 flex items-center gap-1">
                    <span>⏳</span> Capsule ouverte
                  </div>
                  {m.content}
                </div>
              );
            }
          }

          return (
            <div
              key={m.id}
              className={`flex ${isMine ? 'justify-end' : 'justify-start'} animate-fadeIn`}
              style={{ animationDelay: `${Math.min(i * 0.03, 0.5)}s`, opacity: 0, animationFillMode: 'forwards' }}
            >
              <div style={{ maxWidth: '75%' }}>
                <div className={isMine ? 'bubble-mine' : 'bubble-theirs'} style={{ overflowWrap: 'break-word' }}>
                  {content}
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
      <div className="p-4" style={{ borderTop: '1px solid var(--border-glass)', background: 'rgba(0,0,0,0.2)' }}>
        
        {/* Mode selector */}
        <div className="flex gap-2 mb-3">
          <button onClick={() => setMode('text')} className={`text-xs px-3 py-1 rounded-full transition-colors ${mode === 'text' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            Texte
          </button>
          <button onClick={() => setMode('image')} className={`text-xs px-3 py-1 rounded-full transition-colors ${mode === 'image' ? 'bg-pink-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            Image (URL)
          </button>
          <button onClick={() => setMode('capsule')} className={`text-xs px-3 py-1 rounded-full transition-colors ${mode === 'capsule' ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            Capsule
          </button>
        </div>

        {mode === 'capsule' && (
          <div className="mb-3 animate-fadeIn">
            <label className="text-xs text-gray-300 block mb-1">Date d&apos;ouverture :</label>
            <input 
              type="datetime-local" 
              value={capsuleDate}
              onChange={e => setCapsuleDate(e.target.value)}
              className="input-field text-sm p-2"
              style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
            />
          </div>
        )}

        <div className="flex gap-3 items-end">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="input-field flex-1 resize-none"
            rows={mode === 'image' ? 1 : 2}
            placeholder={
              mode === 'image' ? "Collez le lien de l'image (ex: https://.../photo.jpg)" : 
              mode === 'capsule' ? "Message secret à envoyer dans le futur..." : 
              "Écrire un message..."
            }
            id="chat-input"
            style={{ minHeight: mode === 'image' ? '44px' : '60px' }}
          />
          <button
            onClick={send}
            className="btn-primary px-4 h-[60px]"
            disabled={loading || !text.trim() || (mode === 'capsule' && !capsuleDate)}
            id="chat-send"
            style={{ borderRadius: 'var(--radius-md)', height: mode === 'image' ? '44px' : '60px' }}
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
