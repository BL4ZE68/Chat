import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* ─── Hero ─── */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 relative overflow-hidden">
        {/* Decorative stars */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="star" style={{ top: '12%', left: '18%', '--duration': '3s', '--delay': '0s' } as React.CSSProperties} />
          <div className="star" style={{ top: '25%', right: '22%', '--duration': '4s', '--delay': '1s' } as React.CSSProperties} />
          <div className="star" style={{ top: '60%', left: '10%', '--duration': '3.5s', '--delay': '0.5s' } as React.CSSProperties} />
          <div className="star" style={{ top: '45%', right: '15%', '--duration': '5s', '--delay': '2s' } as React.CSSProperties} />
          <div className="star" style={{ top: '75%', left: '35%', '--duration': '2.5s', '--delay': '1.5s' } as React.CSSProperties} />
          <div className="star" style={{ top: '15%', left: '55%', '--duration': '4s', '--delay': '0.8s' } as React.CSSProperties} />
          <div className="star" style={{ top: '80%', right: '30%', '--duration': '3s', '--delay': '2.2s' } as React.CSSProperties} />
          <div className="star" style={{ top: '35%', left: '70%', '--duration': '3.8s', '--delay': '0.3s' } as React.CSSProperties} />
        </div>

        {/* Heart icon */}
        <div className="animate-float mb-8">
          <svg width="64" height="64" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="hero-heart" x1="0" y1="0" x2="28" y2="28">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
            <path
              d="M14 25.5C14 25.5 3.5 19 3.5 11.5C3.5 8 6 5.5 9 5.5C11 5.5 12.8 6.8 14 8.5C15.2 6.8 17 5.5 19 5.5C22 5.5 24.5 8 24.5 11.5C24.5 19 14 25.5 14 25.5Z"
              fill="url(#hero-heart)"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 animate-fadeIn">
          <span className="gradient-text-animated">ForeverLink</span>
        </h1>

        {/* Tagline */}
        <p className="text-lg md:text-xl max-w-xl mx-auto mb-10 animate-fadeIn" style={{ color: 'var(--text-secondary)', animationDelay: '0.15s', opacity: 0 }}>
          Votre refuge numérique secret entre meilleurs amis. Partagez des messages, des souvenirs, et des capsules temporelles dans un espace qui n&apos;appartient qu&apos;à vous deux.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 animate-fadeIn" style={{ animationDelay: '0.3s', opacity: 0 }}>
          <Link href="/signin" className="btn-primary text-lg px-8 py-4" id="cta-start">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            Commencer l&apos;aventure
          </Link>
          <Link href="/dashboard" className="btn-secondary text-lg px-8 py-4" id="cta-login">
            Notre Monde
          </Link>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="px-6 pb-24">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 stagger-children">
          {/* Messages */}
          <div className="glass-card p-6 animate-fadeIn" style={{ opacity: 0 }} id="feature-messages">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(139, 92, 246, 0.15)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-lg mb-2">Messages privés</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Conversations en temps réel, uniquement entre vous deux. Chaque mot reste entre vous.
            </p>
          </div>

          {/* Journal */}
          <div className="glass-card p-6 animate-fadeIn" style={{ opacity: 0 }} id="feature-journal">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: 'rgba(236, 72, 153, 0.15)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-lg mb-2">Journal partagé</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Écrivez vos souvenirs ensemble. Une timeline de votre amitié, préservée pour toujours.
            </p>
          </div>

          {/* Capsules */}
          <div className="glass-card p-6 animate-fadeIn" style={{ opacity: 0 }} id="feature-capsules">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(236, 72, 153, 0.15))' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#cap-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <defs>
                  <linearGradient id="cap-grad" x1="0" y1="0" x2="24" y2="24">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <h3 className="font-semibold text-lg mb-2">Capsules temporelles</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Envoyez des messages qui s&apos;ouvrent dans le futur. Des surprises qui traversent le temps.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="py-8 text-center" style={{ borderTop: '1px solid var(--border-glass)' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
          ForeverLink — Fait avec 💜 pour les amitiés éternelles
        </p>
      </footer>
    </div>
  );
}
