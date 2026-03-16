# Chaly Backend

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
- **Interactions sociales** : likes, commentaires avec images, memes, blocage d'utilisateurs
- **Défis quotidiens** : challenges photo avec système de votes et de gagnants
- **Gamification** : système d'XP et de niveaux (`level = floor(0.1 × √xpTotal)`)
- **Popups in-app** : système de popups avec suivi de lecture
- **Administration** : dashboard stats, analytics, gestion des défis et notifications
- **Notifications push** : via Expo Server SDK pour l'application mobile
- **Health check** : monitoring de l'état de la DB et des services
- **Documentation API** : Swagger UI intégré (`/api/docs`)

## Architecture du projet

Le backend suit une architecture **microservices serverless** déployée sur AWS Lambda :

```
┌─────────────────────────────────────────────────────────────────┐
│                        AWS API Gateway                          │
├──────────────────┬──────────────────────┬───────────────────────┤
│                  │                      │                       │
│  ┌────────────┐  │  ┌────────────────┐  │  ┌────────────────┐   │
│  │Auth Lambda │  │  │  API Lambda    │  │  │ Public Lambda  │   │
│  │  (Hono)    │  │  │  (Express)     │  │  │   (Hono)       │   │
│  └─────┬──────┘  │  └───────┬────────┘  │  └───────┬────────┘   │
│        │         │          │           │          │             │
│        │         │    ┌─────┼──────┐    │          │             │
│        │         │    │     │      │    │          ▼             │
│        ▼         │    ▼     ▼      ▼    │    ┌───────────┐      │
│  ┌──────────┐    │  ┌────┐┌────┐┌─────┐│    │  Bedrock   │      │
│  │PostgreSQL│◄───┼──│ DB ││ S3 ││Bedr.││    │(Analyse IA)│      │
│  │ (Prisma) │    │  └────┘└────┘└─────┘│    └───────────┘      │
│  └──────────┘    │                      │                       │
└──────────────────┴──────────────────────┴───────────────────────┘
```

**Organisation du code** : chaque domaine métier est structuré en couches `controller → service → repository`, avec séparation claire des responsabilités.

**Trois microservices** :
- **API Lambda (Express)** : API principale authentifiée — utilisateurs, publications, social, défis, notifications, admin, popups
- **Auth Lambda (Hono)** : service d'authentification dédié (OTP, JWT, tokens)
- **Public Lambda (Hono)** : endpoints publics sans authentification — analyse d'images par IA

**Décisions techniques** :

- **Express 5** pour l'API principale (routage, middlewares, Swagger)
- **Hono** pour les services auth et public (framework léger et rapide)
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

# Public Lambda (dans un autre terminal)
cd services/public-lambda
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
│   ├── api-lambda/                # Service API principal (Express)
│   │   └── src/
│   │       ├── admin/             # Administration (stats, création défis/popups)
│   │       ├── app/               # État de l'application (controller, service, models)
│   │       ├── challenges/        # Défis quotidiens
│   │       ├── communication/     # Services S3 et push notifications
│   │       ├── configs/           # Configuration (Swagger, etc.)
│   │       ├── cuites/            # Publications photo
│   │       ├── globals/           # Client Prisma (singleton), gestion d'erreurs
│   │       ├── health/            # Endpoint de health check
│   │       ├── middlewares/       # Auth JWT, API key, rate limiting, tracking
│   │       ├── notifications/     # Gestion des notifications push
│   │       ├── popup/             # Système de popups in-app
│   │       ├── social/            # Likes et commentaires
│   │       ├── users/             # Gestion des utilisateurs
│   │       ├── utils/             # Utilitaires (chalyDay, level, tokens)
│   │       ├── app.ts             # Config Express, middlewares, Swagger
│   │       └── router.ts          # Agrégation des routes
│   │
│   ├── auth-lambda/               # Service d'authentification (Hono)
│   │   └── src/
│   │       ├── config/            # Configuration du service
│   │       ├── lib/               # Connexion Prisma
│   │       ├── middlewares/       # Middlewares spécifiques auth
│   │       ├── modules/           # Logique métier
│   │       │   ├── handlers/      # Handlers de routes
│   │       │   ├── repositories/  # Accès base de données
│   │       │   └── services/      # Logique métier
│   │       ├── utils/             # Utilitaires
│   │       ├── app.ts             # Application Hono
│   │       ├── dev.ts             # Serveur de développement
│   │       └── index.ts           # Handler Lambda
│   │
│   └── public-lambda/             # Service public sans auth (Hono)
│       └── src/
│           ├── config/            # Configuration du service
│           ├── handlers/          # Handlers de routes
│           ├── pictures/          # Analyse d'images par IA (Bedrock)
│           │   ├── services/      # Services d'analyse
│           │   └── utils/         # Utilitaires image
│           ├── services/          # Services partagés
│           └── utils/             # Utilitaires
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

- **Communication** : module transversal utilisé par `cuites`, `users`, `social` et `notifications` pour l'upload S3 et l'envoi de push
- **Globals** : fournit le client Prisma (singleton), les classes d'erreurs HTTP et les utilitaires partagés
- **Middlewares** : appliqués globalement (`apiKey`, `rateLimit`) ou par route (`authenticateToken`, `trackActivity`)
- **Public Lambda** : service autonome qui gère l'analyse d'images (Bedrock) et le proxy d'authentification, sans dépendance à l'API principale

## API

Toutes les routes sont préfixées par `/api/`. Documentation Swagger complète disponible sur `/api/docs`.

### Health — `/api/health`

| Méthode | Route      | Description                              |
| ------- | ---------- | ---------------------------------------- |
| GET     | `/health/` | Health check (état DB, timestamp)        |

### App — `/api/app`

| Méthode | Route            | Description                   |
| ------- | ---------------- | ----------------------------- |
| GET     | `/app/app-state` | État courant de l'application |

### Utilisateurs — `/api/users`

| Méthode | Route                     | Description                        |
| ------- | ------------------------- | ---------------------------------- |
| GET     | `/users/`                 | Utilisateur courant                |
| GET     | `/users/search`           | Rechercher un utilisateur          |
| GET     | `/users/global-posts`     | Publications de l'utilisateur      |
| GET     | `/users/:pseudo`          | Utilisateur par pseudo             |
| PATCH   | `/users/description`      | Modifier la bio                    |
| PATCH   | `/users/background-color` | Changer la couleur de fond         |
| PATCH   | `/users/:pseudo`          | Modifier le pseudo                 |
| POST    | `/users/photo`            | Upload photo de profil (multipart) |
| DELETE  | `/users/`                 | Supprimer le compte                |

### Publications — `/api/cuites`

| Méthode | Route          | Description                       |
| ------- | -------------- | --------------------------------- |
| POST    | `/cuites/`     | Créer une publication (multipart) |
| GET     | `/cuites/list` | Feed avec pagination par curseur  |
| GET     | `/cuites/:id`  | Détail d'une publication          |
| DELETE  | `/cuites/:id`  | Supprimer une publication         |

### Social — `/api/social`

| Méthode | Route                               | Description              |
| ------- | ----------------------------------- | ------------------------ |
| GET     | `/social/cuites/:cuiteId/comments`  | Lister les commentaires  |
| POST    | `/social/cuites/:cuiteId/comment`   | Commenter (multipart)    |
| DELETE  | `/social/cuites/:commentId/comment` | Supprimer un commentaire |
| GET     | `/social/cuites/:cuiteId/likes`     | Lister les likes         |
| POST    | `/social/cuites/:cuiteId/like`      | Liker                    |
| DELETE  | `/social/cuites/:cuiteId/like`      | Retirer un like          |
| POST    | `/social/users/:userId/block`       | Bloquer un utilisateur   |
| DELETE  | `/social/users/:userId/block`       | Débloquer un utilisateur |
| PATCH   | `/social/cuites/:cuiteId/blur`      | Toggle flou sur une photo |
| GET     | `/social/memes`                     | Lister les memes         |
| POST    | `/social/memes`                     | Créer un meme (multipart)|
| DELETE  | `/social/memes/:memeId`             | Supprimer un meme        |

### Défis — `/api/challenges`

| Méthode | Route                              | Description                |
| ------- | ---------------------------------- | -------------------------- |
| POST    | `/challenges/`                     | Créer un défi              |
| GET     | `/challenges/:challengeId/winners` | Gagnants d'un défi         |
| POST    | `/challenges/vote`                 | Voter pour une publication |
| GET     | `/challenges/:challengeId/votes/stats` | Statistiques des votes |

### Notifications — `/api/notifications`

| Méthode | Route                              | Description                     |
| ------- | ---------------------------------- | ------------------------------- |
| POST    | `/notifications/`                  | Enregistrer un token push       |
| DELETE  | `/notifications/`                  | Supprimer un token push         |
| GET     | `/notifications/cron-daily`        | Cron : notification quotidienne |
| POST    | `/notifications/cron-notification` | Cron : notification programmée  |

### Popups — `/api/popup`

| Méthode | Route          | Description                  |
| ------- | -------------- | ---------------------------- |
| GET     | `/popup/`      | Récupérer la popup active    |
| POST    | `/popup/seen`  | Marquer une popup comme vue  |

### Admin — `/api/admin`

| Méthode | Route                        | Description                          |
| ------- | ---------------------------- | ------------------------------------ |
| GET     | `/admin/get-stats`           | Statistiques générales               |
| POST    | `/admin/analytics/stats`     | Statistiques analytics               |
| POST    | `/admin/registration/stats`  | Statistiques d'inscription           |
| GET     | `/admin/test`                | Route de test                        |
| POST    | `/admin/daily-challenge`     | Créer un défi quotidien (DEV only)   |
| POST    | `/admin/send-notification`   | Envoyer une notification (DEV only)  |
| POST    | `/admin/popup`               | Créer une popup (DEV only)           |

### Public Lambda (service séparé)

| Méthode | Route                    | Description                                      |
| ------- | ------------------------ | ------------------------------------------------ |
| GET     | `/`                      | Health check du service public                   |
| POST    | `/auth/request-code`     | Demander un code OTP (proxy vers auth-lambda)    |
| POST    | `/pictures/analyse`      | Analyser une image par IA (Bedrock)              |
| GET     | `/send-notification`     | Envoyer une notification                         |

## Déploiement

Le déploiement utilise **Serverless Framework** sur AWS Lambda (région `eu-west-3`).

```bash
# Build et déploiement complet (3 services)
make all

# Ou étape par étape
make build          # Build les trois services
make deploy         # Déploie les trois Lambdas

# Individuellement
make api-deploy
make auth-deploy
make public-deploy
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
