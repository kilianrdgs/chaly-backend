# 🔒 Sécurité - Auth Lambda

## Stratégie CORS pour applications mobiles natives

### Contexte

Notre API est conçue pour être utilisée **uniquement par des applications mobiles natives** (iOS/Android), pas par des navigateurs web.

### Configuration CORS

```typescript
origin: (origin) => {
  // DEV : Accepte tout
  if (env.ENV === "DEV") return origin || "*";

  // PROD : Accepte uniquement requêtes sans Origin (mobiles)
  if (!origin) return "*";

  // Rejette si Origin présent (navigateurs)
  return "";
}
```

### Pourquoi cette approche ?

| Type de client | Header `Origin` | Comportement |
|----------------|-----------------|--------------|
| **App mobile native** | ❌ Absent | ✅ Autorisé |
| **Navigateur web** | ✅ Présent | ❌ Rejeté |
| **Postman/curl** | ❌ Absent | ✅ Autorisé (pour tests) |

### Protection CSRF

**Pourquoi c'est sécurisé ?**

1. **Pas de cookies** : On utilise JWT dans `Authorization: Bearer <token>`, pas de cookies `HttpOnly`
2. **Navigateurs bloqués** : Un attaquant ne peut pas lancer une requête depuis un site web malveillant car l'header `Origin` sera présent → Rejet
3. **Mobiles autorisés** : Les apps natives n'envoient pas d'`Origin` → Accepté

### Limitations connues

- Si votre app mobile utilise une WebView et envoie un `Origin`, elle sera rejetée
- Solution : Ne pas envoyer `Origin` depuis la WebView ou whitelister l'URL de la WebView

---

## Validation des secrets (env.ts)

### Validations en production

✅ Toutes les variables requises doivent être présentes
✅ Secrets JWT doivent avoir au moins 32 caractères
✅ Secrets ne doivent pas contenir de valeurs par défaut ("secret", "changeme", etc.)
✅ Variables de test interdites en PROD

### Génération de secrets sécurisés

```bash
# Générer un secret JWT de 64 caractères
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Variables d'environnement requises

```bash
# Production (obligatoires)
ENV=PROD
ACCESS_TOKEN_SECRET=<64+ caractères aléatoires>
REFRESH_TOKEN_SECRET=<64+ caractères aléatoires>
API_TOP_MESSAGE_KEY=<votre clé TopMessage>

# Développement (avec valeurs par défaut)
ENV=DEV
ACCESS_TOKEN_SECRET=dev_secret_key_at_least_32_chars_long
REFRESH_TOKEN_SECRET=dev_secret_key_at_least_32_chars_long
API_TOP_MESSAGE_KEY=test_key
TEST_PHONE_NUMBER=+33600000000
TEST_OTP_CODE=1234
```

---

## Autres mesures de sécurité

### JWT

- ✅ Secrets séparés pour Access/Refresh tokens
- ✅ Token rotation lors du refresh
- ✅ Claims structurés (`jti`, `sub`, `tokenType`)
- ✅ Expiration courte pour Access Token (15min)

### OTP

- ✅ Validation format E.164 avec libphonenumber-js
- ✅ Code 4 chiffres aléatoire (crypto.randomInt)
- ✅ Expiration 5 minutes
- ✅ Max 2 tentatives incorrectes
- ⚠️ **TODO** : Hasher les codes OTP en base (bcrypt)

### Rate Limiting

- ✅ 3 requêtes OTP max / 15 min par numéro
- ⚠️ **TODO** : Migrer vers DynamoDB (actuellement en mémoire)

### Prisma

- ✅ Parameterized queries (protection injection SQL native)
- ✅ Secrets DB via SSM Parameter Store

---

## Recommandations futures

### Court terme (1-2 semaines)

1. **Hasher les codes OTP** avec bcrypt avant stockage DB
2. **Migrer rate limiting** vers DynamoDB pour multi-instance
3. **Ajouter timing-safe comparison** pour vérification OTP

### Moyen terme (1-2 mois)

4. **AWS WAF** devant API Gateway (protection DDoS, IP blocking)
5. **AWS X-Ray** pour traçabilité des requêtes suspectes
6. **CloudWatch Alarmes** pour taux d'erreur anormal
7. **Logs structurés** avec Lambda Powertools

### Long terme (3+ mois)

8. **Audit de sécurité** externe (pentest)
9. **Rotation automatique des secrets** (AWS Secrets Manager)
10. **2FA optionnel** pour comptes sensibles

---

## Contact Sécurité

Pour signaler une vulnérabilité : [security@chaly.com](mailto:security@chaly.com)

**Bug Bounty** : Non actif pour le moment
