# Chaly Backend

Présentation du parcours utilisateur disponible ici 👉 https://youtube.com/shorts/g5iDixabZ-E?feature=share

Backend serverless pour **Chaly**, une application mobile sociale de partage de photos avec défis quotidiens et gamification. Le projet est composé de deux microservices AWS Lambda : une API principale (Express) et un service d'authentification léger (Hono).

## Contexte du projet

- **Problème résolu** : fournir un backend complet pour une application mobile de partage de photos avec interactions sociales et mécaniques de jeu
- **Utilité** : gestion des utilisateurs, publications photo, interactions sociales (likes/commentaires), défis quotidiens, notifications push et analyse d'images par IA
- **Contexte** : application mobile destinée à un usage social, avec un backend entièrement serverless sur AWS

## Fonctionnalités principales

- **Authentification par SMS** : inscription et connexion via code OTP (4 chiffres) envoyé par SMS
- **Gestion de profil** : pseudo, photo de profil, bio, couleur de fond, mode de personnalité IA
- **Publication de photos** : création, brouillon, publication et suppression de posts avec upload d'images sur S3
- **Analyse d'images par IA** : génération automatique de titres et descriptions via AWS Bedrock (Nova Lite + Mistral Pixtral)
- **Interactions sociales** : likes et commentaires avec réponses imbriquées
- **Défis quotidiens** : challenges photo avec système de gagnants
- **Gamification** : système d'XP et de niveaux (`level = floor(0.1 × √xpTotal)`)
- **Notifications push** : via Expo Server SDK pour l'application mobile
- **Documentation API** : Swagger UI intégré (`/api/docs`)

## Architecture du projet

Le backend suit une architecture **microservices serverless** déployée sur AWS Lambda :

```
┌──────────────────────────────────────────────────┐
│                  AWS API Gateway                 │
├─────────────────────┬────────────────────────────┤
│                     │                            │
│   ┌─────────────┐   │   ┌────────────────────┐   │
│   │ Auth Lambda  │   │   │    API Lambda      │   │
│   │   (Hono)     │   │   │    (Express)       │   │
│   └──────┬───────┘   │   └────────┬───────────┘   │
│          │           │            │               │
│          │           │      ┌─────┼──────┐        │
│          │           │      │     │      │        │
│          ▼           │      ▼     ▼      ▼        │
│   ┌──────────┐       │   ┌────┐ ┌────┐ ┌───────┐ │
│   │PostgreSQL│◄──────┼───│ DB │ │ S3 │ │Bedrock│ │
│   │ (Prisma) │       │   └────┘ └────┘ └───────┘ │
│   └──────────┘       │                            │
└──────────────────────┴────────────────────────────┘
```

**Organisation du code** : chaque domaine métier est structuré en couches `controller → service → repository`, avec séparation claire des responsabilités.

**Décisions techniques** :

- **Express 5** pour l'API principale (routage, middlewares, Swagger)
- **Hono** pour le service auth (framework léger et rapide)
- **Prisma ORM** comme unique couche d'accès à la base de données
- **JWT double token** : access token (15 min) + refresh token (90 jours)
- **Secrets en production** chargés depuis AWS SSM Parameter Store

## Stack technique

| Catégorie                | Technologies                                     |
| ------------------------ | ------------------------------------------------ |
| **Langages**             | TypeScript 5.9, Node.js 20.x                     |
| **Frameworks**           | Express 5.1 (API), Hono 4.10 (Auth)              |
| **Base de données**      | PostgreSQL via Prisma ORM 6.18                   |
| **Infrastructure**       | AWS Lambda, API Gateway, S3, VPC                 |
| **IA**                   | AWS Bedrock (Nova Lite, Mistral Pixtral Large)   |
| **Authentification**     | JWT (jsonwebtoken), OTP par SMS (TopMessage API) |
| **Notifications**        | Expo Server SDK 3.15                             |
| **Linting / Formatting** | Biome 1.9                                        |
| **Build**                | esbuild, TypeScript compiler                     |
| **Déploiement**          | Serverless Framework 4.22, Makefile              |
| **Documentation API**    | swagger-jsdoc, swagger-ui-express                |

## Installation

### Prérequis

- Node.js >= 20.x
- npm
- PostgreSQL (local ou distant)
- Compte AWS avec accès S3, Bedrock, SSM (pour la production)

### Installation des dépendances

```bash
git clone <repository-url>
cd chaly-backend

# Installer les dépendances des deux services
make install
```

### Configuration

Copier le fichier d'exemple et renseigner les variables :

```bash
cp .env.exemple .env
```

| Variable                    | Description                                  |
| --------------------------- | -------------------------------------------- |
| `PORT`                      | Port du serveur local (ex: 3000)             |
| `DATABASE_URL`              | URL de connexion PostgreSQL                  |
| `ENV`                       | Environnement : `DEV`, `STAGING` ou `PROD`   |
| `API_KEY`                   | Clé API pour l'authentification des requêtes |
| `ACCESS_TOKEN_SECRET`       | Secret pour les JWT access tokens            |
| `REFRESH_TOKEN_SECRET`      | Secret pour les JWT refresh tokens           |
| `BEDROCK_ACCESS_KEY_ID`     | AWS Access Key pour Bedrock                  |
| `BEDROCK_SECRET_ACCESS_KEY` | AWS Secret Key pour Bedrock                  |
| `AWS_S3_BUCKET`             | Nom du bucket S3                             |
| `API_TOP_MESSAGE_KEY`       | Clé API TopMessage (envoi SMS)               |

### Base de données

```bash
cd services/api-lambda
npx prisma migrate dev
```

### Lancement en développement

```bash
# API Lambda
cd services/api-lambda
npm run dev

# Auth Lambda (dans un autre terminal)
cd services/auth-lambda
npm run dev
```

L'API est accessible sur `http://localhost:<PORT>/api/` et la documentation Swagger sur `/api/docs`.

## Structure du repository

```
chaly-backend/
├── prisma/
│   ├── schema.prisma              # Schéma unique de la base de données
│   └── migrations/                # Fichiers de migration
│
├── services/
│   ├── api-lambda/                # Service API principal
│   │   └── src/
│   │       ├── auth/              # Authentification (OTP, JWT, tokens)
│   │       ├── challenges/        # Défis quotidiens
│   │       ├── communication/     # Services S3 et push notifications
│   │       ├── cuites/            # Publications photo
│   │       ├── globals/           # Utilitaires partagés, gestion d'erreurs
│   │       ├── middlewares/       # Auth JWT, API key, rate limiting
│   │       ├── notifications/     # Gestion des notifications push
│   │       ├── pictures/          # Analyse d'images par IA (Bedrock)
│   │       ├── social/            # Likes et commentaires
│   │       ├── users/             # Gestion des utilisateurs
│   │       ├── app.ts             # Config Express, middlewares, Swagger
│   │       └── router.ts          # Agrégation des routes
│   │
│   └── auth-lambda/               # Service d'authentification léger
│       └── src/
│           ├── app.ts             # Application Hono
│           ├── dev.ts             # Serveur de développement
│           ├── index.ts           # Handler Lambda
│           └── lib/prisma.ts      # Connexion Prisma
│
├── Makefile                       # Orchestration build et déploiement
├── biome.json                     # Configuration linting/formatting
└── .env.exemple                   # Template des variables d'environnement
```

## Fonctionnement interne

### Flux d'authentification

1. L'utilisateur envoie son numéro de téléphone → un code OTP est envoyé par SMS
2. L'utilisateur soumet le code → le serveur vérifie et crée/récupère le compte
3. Deux tokens JWT sont retournés : **access** (15 min) et **refresh** (90 jours)
4. L'access token est envoyé dans chaque requête via `Authorization: Bearer <token>`
5. À expiration, le refresh token permet d'obtenir un nouvel access token
6. La déconnexion invalide le refresh token (table `Invalid_Tokens`)

### Sécurité

- **Rate limiting** : 1000 req / 15 min (global), 5 req / 15 min (OTP)
- **API Key** : header `X-API-Key` requis en production (désactivé en DEV)
- **Validation téléphone** : format E.164 vérifié via `libphonenumber-js`
- **Limite OTP** : maximum 2 tentatives par numéro
- **Blacklist tokens** : les tokens invalidés sont stockés en base

### Analyse d'images par IA

Deux étapes via AWS Bedrock :

1. **Nova Lite** : analyse factuelle de l'image (description objective)
2. **Mistral Pixtral Large** : réécriture créative adaptée au mode de personnalité de l'utilisateur et au défi en cours

Le résultat (titre + description) est attaché automatiquement à la publication.

### Interactions entre modules

- **Communication** : module transversal utilisé par `cuites`, `users` et `notifications` pour l'upload S3 et l'envoi de push
- **Globals** : fournit le client Prisma (singleton), les classes d'erreurs HTTP et les utilitaires partagés
- **Middlewares** : appliqués globalement (`apiKey`, `rateLimit`) ou par route (`authenticateToken`)

## API

Toutes les routes sont préfixées par `/api/`. Documentation Swagger complète disponible sur `/api/docs`.

### Authentification — `/api/auth`

| Méthode | Route                 | Description                 |
| ------- | --------------------- | --------------------------- |
| POST    | `/auth/request-code`  | Envoyer un code OTP par SMS |
| POST    | `/auth/verify-code`   | Vérifier le code OTP        |
| POST    | `/auth/login`         | Connexion                   |
| POST    | `/auth/refresh-token` | Rafraîchir l'access token   |
| POST    | `/auth/logout`        | Déconnexion                 |

### Utilisateurs — `/api/users`

| Méthode | Route                     | Description                        |
| ------- | ------------------------- | ---------------------------------- |
| GET     | `/users/`                 | Utilisateur courant                |
| GET     | `/users/:pseudo`          | Utilisateur par pseudo             |
| GET     | `/users/global-posts`     | Publications de l'utilisateur      |
| PATCH   | `/users/description`      | Modifier la bio                    |
| PATCH   | `/users/personality-mode` | Changer le mode IA                 |
| PATCH   | `/users/background-color` | Changer la couleur de fond         |
| PATCH   | `/users/:pseudo`          | Modifier le pseudo                 |
| POST    | `/users/photo`            | Upload photo de profil (multipart) |
| DELETE  | `/users/`                 | Supprimer le compte                |

### Publications — `/api/cuites`

| Méthode | Route                     | Description                       |
| ------- | ------------------------- | --------------------------------- |
| POST    | `/cuites/`                | Créer une publication (multipart) |
| GET     | `/cuites/list`            | Feed avec pagination par curseur  |
| GET     | `/cuites/:id`             | Détail d'une publication          |
| DELETE  | `/cuites/:id`             | Supprimer une publication         |
| PATCH   | `/cuites/pending`         | Modifier un brouillon             |
| PATCH   | `/cuites/pending/publish` | Publier un brouillon              |

### Social — `/api/social`

| Méthode | Route                               | Description              |
| ------- | ----------------------------------- | ------------------------ |
| GET     | `/social/cuites/:cuiteId/comments`  | Lister les commentaires  |
| POST    | `/social/cuites/:cuiteId/comment`   | Commenter                |
| DELETE  | `/social/cuites/:commentId/comment` | Supprimer un commentaire |
| GET     | `/social/cuites/:cuiteId/likes`     | Lister les likes         |
| POST    | `/social/cuites/:cuiteId/like`      | Liker                    |
| DELETE  | `/social/cuites/:cuiteId/like`      | Retirer un like          |

### Défis — `/api/challenges`

| Méthode | Route                              | Description                    |
| ------- | ---------------------------------- | ------------------------------ |
| POST    | `/challenges/`                     | Créer un défi                  |
| GET     | `/challenges/challenge-of-the-day` | Défi du jour                   |
| GET     | `/challenges/:challengeId/winners` | Gagnants d'un défi             |
| POST    | `/challenges/send-daily`           | Notification du défi quotidien |

### Notifications — `/api/notifications`

| Méthode | Route                              | Description                     |
| ------- | ---------------------------------- | ------------------------------- |
| POST    | `/notifications/`                  | Enregistrer un token push       |
| DELETE  | `/notifications/`                  | Supprimer un token push         |
| POST    | `/notifications/send-notification` | Envoyer une notification        |
| GET     | `/notifications/cron-daily`        | Cron : notification quotidienne |

### Images — `/api/pictures`

| Méthode | Route               | Description                                      |
| ------- | ------------------- | ------------------------------------------------ |
| POST    | `/pictures/analyse` | Analyser une image par IA (multipart, 20 Mo max) |

## Déploiement

Le déploiement utilise **Serverless Framework** sur AWS Lambda (région `eu-west-3`).

```bash
# Build et déploiement complet
make all

# Ou étape par étape
make build          # Build les deux services
make deploy         # Déploie les deux Lambdas

# Individuellement
make api-deploy
make auth-deploy
```

## Tests

Le projet inclut `ts-jest` et `c8` (coverage) dans les dépendances, mais aucune suite de tests n'est actuellement implémentée. Il n'y a pas de pipeline CI/CD automatisé.

## Améliorations possibles

- **Tests** : ajouter des tests unitaires et d'intégration (les dépendances Jest sont déjà présentes)
- **CI/CD** : mettre en place un pipeline GitHub Actions pour lint, tests et déploiement automatique
- **Validation des entrées** : ajouter une couche de validation formelle (zod ou joi) sur les endpoints
- **Logging structuré** : intégrer un logger (pino, winston) avec niveaux de log et contexte de requête
- **Monitoring** : ajouter AWS CloudWatch Alarms ou un service de monitoring externe
- **Cache** : implémenter un cache Redis pour les requêtes fréquentes (feed, défi du jour)
- **Pagination** : uniformiser la pagination par curseur sur tous les endpoints de listing
- **Rate limiting granulaire** : adapter les limites par endpoint selon la sensibilité

## Auteur

Projet développé par Kilian Rodrigues.
