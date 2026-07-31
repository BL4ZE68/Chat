import Navbar from '../../components/Navbar';

export default function AlbumPage() {
  return (
    <>
      <Navbar />
      <div className="page-container animate-fadeIn">
        <h1 className="page-title gradient-text">Album photo</h1>
        <p className="page-subtitle">Vos plus beaux moments capturés ensemble</p>

        {/* Coming soon state */}
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
          <h2 className="text-xl font-semibold mb-2">Bientôt disponible</h2>
          <p className="max-w-md mx-auto" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            L&apos;album photo vous permettra de partager et conserver vos plus beaux souvenirs visuels avec votre meilleur(e) ami(e).
          </p>

          {/* Placeholder grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="aspect-square rounded-xl animate-fadeIn"
                style={{
                  background: `linear-gradient(${135 + i * 15}deg, rgba(139, 92, 246, ${0.03 + i * 0.01}), rgba(236, 72, 153, ${0.03 + i * 0.01}))`,
                  border: '1px solid var(--border-glass)',
                  animationDelay: `${i * 0.1}s`,
                  opacity: 0,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
