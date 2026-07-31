# 💜 ForeverLink

> Un refuge numérique premium, secret et exclusif, pour les meilleurs amis. 

ForeverLink est une application web conçue pour offrir un espace intime, esthétique et sécurisé entre deux personnes. Partagez des messages en temps réel, conservez des souvenirs dans un journal partagé, et créez des capsules temporelles.

## ✨ Fonctionnalités

- **Duo Privé** : Un espace strictement limité à vous et votre meilleur(e) ami(e).
- **Messages en temps réel** : Chat privé fluide avec design de bulles (Glassmorphism).
- **Journal Partagé** : Une *timeline* pour consigner vos moments inoubliables.
- **Capsules Temporelles** : (Bientôt) Envoyez des messages ou photos qui se déverrouillent dans le futur.
- **Profil Personnalisable** : Couleurs favorites dynamiques et statuts émotionnels.
- **Design Premium** : Interface *Dark Mode* ultra soignée, animations douces, typographie élégante, et effets "glass" (verre dépoli).

## 🛠️ Stack Technique

- **Framework** : Next.js 14 (App Router)
- **Langage** : TypeScript
- **Styling** : Tailwind CSS + CSS modules natifs
- **Base de données / Auth / Realtime** : Supabase

## 🚀 Installation locale

1. **Cloner le projet**
   ```bash
   git clone https://github.com/VOTRE-NOM/foreverlink.git
   cd foreverlink
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configuration Supabase (Variables d'environnement)**
   - Créez un fichier `.env.local` à la racine du projet (copiez le `.env.local.example` si présent).
   - Ajoutez vos clés Supabase (récupérables dans `Project Settings > API` sur votre dashboard Supabase) :
     ```env
     NEXT_PUBLIC_SUPABASE_URL=https://<votre-id-projet>.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=<votre-cle-anon>
     ```

4. **Base de données**
   - Le schéma de la base de données est disponible dans `supabase/migrations/init.sql`.
   - Lancez ce script SQL dans le **SQL Editor** de votre dashboard Supabase pour créer les tables (`users`, `friendships`, `messages`, `memories`) et leurs règles de sécurité RLS.
   - N'oubliez pas de lancer aussi la fonction `supabase/migrations/funcs_join_friendship.sql` !

5. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```
   L'application sera accessible sur `http://localhost:3000`.

## 🔐 Configuration de l'Authentification

Ce projet utilise l'authentification Supabase. Pour permettre la connexion :
- Allez dans **Authentication > URL Configuration** sur Supabase.
- Définissez le **Site URL** sur `http://localhost:3000` (ou votre domaine en production).
- Si vous utilisez **Google OAuth**, activez le Provider Google dans Supabase et ajoutez les identifiants (Client ID / Secret) depuis Google Cloud Console.

## 🎨 Design System

Le design est centré autour de la palette `violet/rose` avec des composants flottants et réactifs :
- **Typographie** : Inter (Google Fonts)
- **Couleurs de fond** : `#0a0a12` et `#12121e`
- **Gradients** : Violet (`#8b5cf6`) vers Rose (`#ec4899`)

---
*Fait avec 💜 pour les amitiés éternelles.*
