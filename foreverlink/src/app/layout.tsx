import '../styles/globals.css';

export const metadata = {
  title: 'ForeverLink — Refuge numérique pour meilleurs amis',
  description: 'ForeverLink est votre espace secret entre meilleurs amis. Messages, journal partagé, capsules temporelles et souvenirs précieux.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {/* Ambient background glow */}
        <div className="bg-ambient" aria-hidden="true" />

        {children}
      </body>
    </html>
  );
}
