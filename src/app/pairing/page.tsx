'use client';

import { useState } from 'react';
import { createFriendship, joinFriendshipByCode } from '../../lib/friendshipClient';
import Navbar from '../../components/Navbar';
import Link from 'next/link';

export default function PairingPage() {
  const [code, setCode] = useState('');
  const [created, setCreated] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleCreate() {
    setLoading(true);
    setMessage('');
    setSuccess(false);
    try {
      const data: any = await createFriendship();
      setCreated(data.pairing_code || data.pairing_code);
      setSuccess(true);
      setMessage('Code généré ! Partagez-le avec votre meilleur(e) ami(e) 💜');
    } catch (err: any) {
      setMessage(err.message || 'Erreur');
    }
    setLoading(false);
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setSuccess(false);
    try {
      await joinFriendshipByCode(code.trim());
      setSuccess(true);
      setMessage('Appairage réussi ! Vous êtes maintenant connectés ✨');
    } catch (err: any) {
      setMessage(err.message || 'Erreur');
    }
    setLoading(false);
  }

  async function copyCode() {
    if (created) {
      await navigator.clipboard.writeText(created);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <>
      <Navbar />
      <div className="page-container animate-fadeIn">
        <div className="max-w-lg mx-auto">
          <h1 className="page-title gradient-text text-center">Appairage Duo</h1>
          <p className="page-subtitle text-center">Connectez-vous avec votre meilleur(e) ami(e)</p>

          {/* Create section */}
          <div className="glass-card-static p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139, 92, 246, 0.15)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Créer un Duo</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Générez un code unique à partager</p>
              </div>
            </div>

            <button
              onClick={handleCreate}
              className="btn-primary w-full"
              disabled={loading}
              id="pair-create"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                  Génération...
                </span>
              ) : 'Générer un code Duo'}
            </button>

            {created && (
              <div className="mt-4 p-4 rounded-xl text-center animate-fadeIn" style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Votre code Duo</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl font-bold tracking-widest gradient-text">{created}</span>
                  <button
                    onClick={copyCode}
                    className="btn-ghost"
                    id="pair-copy"
                    title="Copier"
                  >
                    {copied ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 divider-gradient" style={{ margin: 0 }} />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>OU</span>
            <div className="flex-1 divider-gradient" style={{ margin: 0 }} />
          </div>

          {/* Join section */}
          <div className="glass-card-static p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(236, 72, 153, 0.15)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Rejoindre un Duo</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Entrez le code de votre ami(e)</p>
              </div>
            </div>

            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label htmlFor="pair-code" className="label-text">Code Duo</label>
                <input
                  id="pair-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="input-field text-center text-lg tracking-widest"
                  placeholder="a1b2c3d4"
                />
              </div>
              <div className="flex gap-3">
                <button
                  className="btn-primary flex-1"
                  disabled={loading || !code.trim()}
                  id="pair-join"
                >
                  {loading ? 'En cours...' : 'Rejoindre'}
                </button>
                <Link href="/dashboard" className="btn-secondary" id="pair-back">
                  Retour
                </Link>
              </div>
            </form>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`mt-6 p-4 rounded-xl text-sm text-center animate-fadeIn ${success ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}
              id="pair-message"
            >
              {message}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
