'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { upsertProfile } from '../../lib/friendshipClient';
import Navbar from '../../components/Navbar';
import Link from 'next/link';

const COLORS = [
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Rose', value: '#ec4899' },
  { name: 'Bleu', value: '#3b82f6' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Émeraude', value: '#10b981' },
  { name: 'Ambre', value: '#f59e0b' },
  { name: 'Rouge', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
];

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>({ nickname: '', location_city: '', favorite_color: '#8b5cf6' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) { setPageLoading(false); return; }
      const { data } = await supabase.from('users').select('*').eq('id', userData.user.id).single();
      if (data) setProfile(data);
      setPageLoading(false);
    }
    load();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setSuccess(false);
    try {
      await upsertProfile(profile);
      setSuccess(true);
      setMessage('Profil enregistré avec succès ✨');
    } catch (err: any) {
      setMessage(err.message || 'Erreur');
    }
    setLoading(false);
  }

  const initials = (profile.nickname || 'U').charAt(0).toUpperCase();

  if (pageLoading) {
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
        <div className="max-w-lg mx-auto">
          <h1 className="page-title gradient-text text-center">Votre profil</h1>
          <p className="page-subtitle text-center">Personnalisez votre identité ForeverLink</p>

          {/* Avatar */}
          <div className="flex justify-center mb-8">
            <div
              className="avatar-circle avatar-circle-lg animate-pulse-glow"
              style={{ background: `linear-gradient(135deg, ${profile.favorite_color || '#8b5cf6'}, #ec4899)` }}
            >
              {initials}
            </div>
          </div>

          {/* Form */}
          <div className="glass-card-static p-6">
            <form onSubmit={save} className="space-y-5">
              {/* Nickname */}
              <div>
                <label htmlFor="profile-nickname" className="label-text">Surnom</label>
                <input
                  id="profile-nickname"
                  value={profile.nickname || ''}
                  onChange={(e) => setProfile({ ...profile, nickname: e.target.value })}
                  className="input-field"
                  placeholder="Votre surnom"
                />
              </div>

              {/* City */}
              <div>
                <label htmlFor="profile-city" className="label-text">Ville</label>
                <input
                  id="profile-city"
                  value={profile.location_city || ''}
                  onChange={(e) => setProfile({ ...profile, location_city: e.target.value })}
                  className="input-field"
                  placeholder="Votre ville"
                />
              </div>

              {/* Favorite Color Picker */}
              <div>
                <label className="label-text">Couleur favorite</label>
                <div className="grid grid-cols-4 gap-3 mt-1">
                  {COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setProfile({ ...profile, favorite_color: c.value })}
                      className="flex flex-col items-center gap-1 p-3 rounded-xl transition-all"
                      style={{
                        background: profile.favorite_color === c.value ? `${c.value}15` : 'transparent',
                        border: profile.favorite_color === c.value ? `2px solid ${c.value}` : '2px solid var(--border-glass)',
                      }}
                      id={`color-${c.name.toLowerCase()}`}
                    >
                      <div
                        className="w-6 h-6 rounded-full"
                        style={{ background: c.value, boxShadow: profile.favorite_color === c.value ? `0 0 12px ${c.value}60` : 'none' }}
                      />
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Emotional Status */}
              <div>
                <label htmlFor="profile-status" className="label-text">Statut émotionnel</label>
                <input
                  id="profile-status"
                  value={profile.emotional_status || ''}
                  onChange={(e) => setProfile({ ...profile, emotional_status: e.target.value })}
                  className="input-field"
                  placeholder="Comment vous sentez-vous ? 😊"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button className="btn-primary flex-1" disabled={loading} id="profile-save">
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                      Sauvegarde...
                    </span>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Enregistrer
                    </>
                  )}
                </button>
                <Link href="/dashboard" className="btn-secondary" id="profile-back">
                  Retour
                </Link>
              </div>
            </form>

            {/* Message */}
            {message && (
              <div
                className={`mt-4 p-4 rounded-xl text-sm text-center animate-fadeIn ${success ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}
                id="profile-message"
              >
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
