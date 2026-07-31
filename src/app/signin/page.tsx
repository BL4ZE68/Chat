'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Link from 'next/link';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setSuccess(false);
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setMessage(error.message);
    } else {
      setSuccess(true);
      setMessage('Vérifiez votre boîte mail pour le lien de connexion ✨');
    }
    setLoading(false);
  }

  async function oauth(provider: 'google' | 'apple' | 'facebook') {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({ provider });
    if (error) setMessage(error.message);
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-slideUp">
        {/* Back link */}
        <Link href="/" className="btn-ghost mb-6 inline-flex" id="signin-back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Retour
        </Link>

        <div className="glass-card-static p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4" style={{ background: 'rgba(139, 92, 246, 0.15)' }}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <defs>
                  <linearGradient id="si-grad" x1="0" y1="0" x2="28" y2="28">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
                <path
                  d="M14 25.5C14 25.5 3.5 19 3.5 11.5C3.5 8 6 5.5 9 5.5C11 5.5 12.8 6.8 14 8.5C15.2 6.8 17 5.5 19 5.5C22 5.5 24.5 8 24.5 11.5C24.5 19 14 25.5 14 25.5Z"
                  fill="url(#si-grad)"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-1">Se connecter</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Entrez dans votre monde secret
            </p>
          </div>

          {/* Magic link form */}
          <form onSubmit={sendMagicLink} className="space-y-4 mb-6">
            <div>
              <label htmlFor="email-input" className="label-text">Email</label>
              <input
                id="email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field"
                placeholder="votre@email.com"
              />
            </div>
            <button className="btn-primary w-full" disabled={loading} id="signin-magic-btn">
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                  En cours...
                </span>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                  Envoyer le lien magique
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 divider-gradient" style={{ margin: 0 }} />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>OU</span>
            <div className="flex-1 divider-gradient" style={{ margin: 0 }} />
          </div>

          {/* OAuth */}
          <div className="grid grid-cols-3 gap-3">
            <button onClick={() => oauth('google')} className="btn-secondary py-3 text-sm" id="signin-google" disabled={loading}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </button>
            <button onClick={() => oauth('apple')} className="btn-secondary py-3 text-sm" id="signin-apple" disabled={loading}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.32 2.32-1.96 4.41-3.74 4.25z"/>
              </svg>
            </button>
            <button onClick={() => oauth('facebook')} className="btn-secondary py-3 text-sm" id="signin-facebook" disabled={loading}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mt-4 p-4 rounded-xl text-sm text-center animate-fadeIn ${success ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}
            id="signin-message"
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
