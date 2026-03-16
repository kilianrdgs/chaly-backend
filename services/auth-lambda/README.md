# Auth Lambda

Service d'authentification Chaly avec Hono.

## Installation

```bash
npm install
npm run prisma:generate
```

## Développement

```bash
npm run dev  # Lance sur http://localhost:3000
```

## Routes

- `POST /auth/request-code` - Demander un code OTP par SMS
- `POST /auth/verify-code` - Vérifier le code et recevoir les tokens
- `POST /auth/refresh-token` - Rafraîchir les tokens
- `POST /auth/logout` - Se déconnecter

## Déploiement

```bash
npm run build
npm run deploy
```

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Structure détaillée du projet
- [SECURITY.md](./SECURITY.md) - Stratégie de sécurité (CORS, secrets, JWT)
- [RATE_LIMITING.md](./RATE_LIMITING.md) - Système de rate limiting & déblocage automatique
- [TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md) - Checklist complète de tests
- [NEXT_STEPS.md](./NEXT_STEPS.md) - Prochaines étapes

## Rate Limiting

- **Max tentatives OTP** : 2 codes invalides par numéro
- **Max demandes** : 3 requêtes de code OTP par numéro
- **Déblocage automatique** : Après 1 minute (configurable via `OTP_BLOCK_DURATION_MINUTES`)

Voir [RATE_LIMITING.md](./RATE_LIMITING.md) pour les détails complets.
