# Architecture Auth-Lambda

## Structure

```
auth-lambda/
├── src/
│   ├── app.ts                    # Application Hono principale
│   ├── index.ts                  # Handler Lambda
│   ├── dev.ts                    # Dev server
│   │
│   ├── config/
│   │   └── env.ts                # Variables d'environnement typées
│   │
│   ├── lib/
│   │   ├── prisma.ts             # Client Prisma
│   │   └── jwt.ts                # JWT utils
│   │
│   ├── middlewares/
│   │   ├── rateLimit.middleware.ts
│   │   └── errorHandler.middleware.ts
│   │
│   ├── modules/
│   │   ├── auth.routes.ts        # Routes
│   │   ├── auth.schema.ts        # Validation Zod
│   │   ├── auth.types.ts         # Types TypeScript
│   │   ├── handlers/             # 1 handler = 1 endpoint
│   │   ├── services/             # 1 service = 1 logique métier
│   │   └── repositories/         # 1 repo = 1 fonction DB
│   │
│   └── utils/
│       ├── errors.ts             # AppError classes
│       ├── response.ts           # Réponses standardisées
│       └── sms.ts                # Service SMS (TopMessage)
```

## Architecture

**Routes → Handlers → Services → Repositories**

- **Routes** : Validation Zod + appel handler
- **Handlers** : Orchestration (try/catch)
- **Services** : Logique métier
- **Repositories** : Accès DB (Prisma)

Principe : **1 fichier = 1 fonction**

## Endpoints

### POST /auth/request-code
```json
{ "phone": "+33600000000" }
→ Génère OTP, envoie SMS
```

### POST /auth/verify-code
```json
{ "phone": "+33600000000", "code": "1234" }
→ Retourne accessToken + refreshToken + user
```

### POST /auth/refresh-token
```json
{ "refreshToken": "xxx" }
→ Rotation des tokens
```

### POST /auth/logout
```json
{ "refreshToken": "xxx" }
→ Invalide le refresh token
```

## JWT

- **Access Token** : 15min
- **Refresh Token** : 90 jours
- Claims : `tokenType`, `sub` (userId), `jti`

## Rate Limiting

- OTP : 3 requêtes / 15min par numéro
- Code invalide : max 2 tentatives
- **Déblocage automatique** : Après 15 minutes, le numéro bloqué est automatiquement débloqué

## Env Variables

```env
ENV=DEV|PROD
ACCESS_TOKEN_SECRET=xxx
REFRESH_TOKEN_SECRET=xxx
API_TOP_MESSAGE_KEY=xxx
DATABASE_URL=postgresql://...
```

## Notes

- Compte test (DEV) : `+33600000000` / code `1234`
- Pas de middleware auth dans auth-lambda (routes publiques)
- Rate limiting en mémoire (à migrer vers Redis en prod)
