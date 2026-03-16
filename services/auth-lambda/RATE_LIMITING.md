# 🚦 Rate Limiting & Déblocage Automatique

## Système de protection OTP

### Configuration

```typescript
// config/env.ts
MAX_OTP_RETRIES: 2                    // Max 2 tentatives de code invalide
OTP_EXPIRATION_MINUTES: 5             // Code OTP expire après 5 min
OTP_BLOCK_DURATION_MINUTES: 15        // Déblocage automatique après 15 min
```

---

## 📊 Règles de rate limiting

### 1. Demande de code OTP (`POST /auth/request-code`)

**Limite** : 3 requêtes par numéro de téléphone

| Tentative | Comportement |
|-----------|-------------|
| 1ère | ✅ Code OTP généré et envoyé par SMS |
| 2ème | ✅ Nouveau code généré (ancien invalidé) |
| 3ème | ✅ Dernier code autorisé |
| 4ème+ | ❌ **BLOQUÉ** pendant 15 minutes |

**Erreur retournée (4ème tentative) :**
```json
{
  "success": false,
  "error": {
    "code": "TOO_MANY_ATTEMPTS",
    "message": "Numéro bloqué. Réessayez dans 12 minute(s)"
  }
}
```

**Statut HTTP** : `429 Too Many Requests`

---

### 2. Vérification du code (`POST /auth/verify-code`)

**Limite** : 2 tentatives de code invalide

| Tentative | Comportement |
|-----------|-------------|
| 1ère (code invalide) | ⚠️ Retries = 1, code reste valide |
| 2ème (code invalide) | ⚠️ Retries = 2, code reste valide |
| 3ème (code invalide) | ❌ **BLOQUÉ** pendant 15 minutes |

**Erreur retournée (3ème tentative) :**
```json
{
  "success": false,
  "error": {
    "code": "TOO_MANY_ATTEMPTS",
    "message": "Trop de tentatives. Réessayez dans 14 minute(s)"
  }
}
```

**Statut HTTP** : `429 Too Many Requests`

---

## ⏰ Déblocage automatique

### Principe

Un numéro bloqué est **automatiquement débloqué** après `OTP_BLOCK_DURATION_MINUTES` (15 minutes par défaut).

### Fonctionnement

#### Scénario 1 : Blocage puis déblocage

```
10:00 → Demande #1 (Retries = 0)
10:02 → Demande #2 (Retries = 1)
10:04 → Demande #3 (Retries = 2)
10:06 → Demande #4 → ❌ BLOQUÉ (message: "Réessayez dans 14 minutes")

10:20 → Demande #5 → ✅ DÉBLOQUÉ (Retries réinitialisé à 0)
```

#### Scénario 2 : Code OTP expiré → Réinitialisation automatique

```
10:00 → Demande #1 (code expire à 10:05)
10:02 → Demande #2 (Retries = 1)
10:07 → Demande #3 → ✅ Nouveau code généré, Retries réinitialisé (OTP expiré)
```

### Calcul du temps restant

Le message d'erreur affiche le **temps restant avant déblocage** :

```typescript
const unblockAt = CreatedAt + OTP_BLOCK_DURATION_MINUTES;
const remainingMinutes = Math.ceil((unblockAt - now) / 1000 / 60);

// Message: "Numéro bloqué. Réessayez dans X minute(s)"
```

---

## 🔄 Conditions de réinitialisation des tentatives

Les tentatives (`Retries`) sont **réinitialisées à 0** dans les cas suivants :

### 1. ✅ Déblocage automatique (délai expiré)

```typescript
if (Retries >= MAX_OTP_RETRIES && now >= unblockAt) {
  Retries = 0;
  CreatedAt = now; // Nouveau point de départ pour le prochain blocage
}
```

### 2. ✅ Code OTP expiré

```typescript
if (ExpiresAt < now) {
  Retries = 0;
  // Nouveau code généré avec nouveau ExpiresAt
}
```

### 3. ✅ Code OTP vérifié avec succès

```typescript
// Suppression complète de l'entrée PhoneVerifications
await prisma.phoneVerifications.delete({ where: { Phone } });
```

---

## 📐 Schéma de la table `PhoneVerifications`

```sql
CREATE TABLE PhoneVerifications (
  Id        SERIAL PRIMARY KEY,
  Phone     VARCHAR(20) UNIQUE NOT NULL,
  Code      VARCHAR(4) NOT NULL,
  Retries   INT DEFAULT 0,
  CreatedAt TIMESTAMP NOT NULL,   -- Point de départ pour calculer unblockAt
  ExpiresAt TIMESTAMP NOT NULL    -- Expiration du code OTP
);
```

**Colonnes clés pour le rate limiting :**

- `CreatedAt` : Calcul du déblocage (`CreatedAt + 15 minutes`)
- `ExpiresAt` : Expiration du code OTP (5 minutes après génération)
- `Retries` : Nombre de tentatives (demandes OTP + codes invalides)

---

## 🧪 Tests du système de déblocage

### Test 1 : Blocage et déblocage automatique

```bash
# 1. Demander 4 codes (bloquer le numéro)
for i in {1..4}; do
  curl -X POST http://localhost:3000/auth/request-code \
    -H "Content-Type: application/json" \
    -d '{"phone": "+33698765432"}'
done

# Résultat attendu (4ème requête) :
# "Numéro bloqué. Réessayez dans 15 minute(s)"

# 2. Attendre 15 minutes (ou modifier CreatedAt en DB)
# UPDATE "PhoneVerifications"
# SET "CreatedAt" = NOW() - INTERVAL '16 minutes'
# WHERE "Phone" = '+33698765432';

# 3. Redemander un code
curl -X POST http://localhost:3000/auth/request-code \
  -H "Content-Type: application/json" \
  -d '{"phone": "+33698765432"}'

# Résultat attendu : ✅ "Code envoyé avec succès"
```

### Test 2 : Expiration du code OTP réinitialise les tentatives

```bash
# 1. Demander 2 codes (Retries = 1)
curl -X POST http://localhost:3000/auth/request-code \
  -H "Content-Type: application/json" \
  -d '{"phone": "+33611111111"}'

curl -X POST http://localhost:3000/auth/request-code \
  -H "Content-Type: application/json" \
  -d '{"phone": "+33611111111"}'

# Vérifier en DB : Retries = 1

# 2. Attendre 6 minutes (code expire)

# 3. Redemander un code
curl -X POST http://localhost:3000/auth/request-code \
  -H "Content-Type: application/json" \
  -d '{"phone": "+33611111111"}'

# Résultat attendu : ✅ Retries réinitialisé à 0
```

### Test 3 : Vérification avec codes invalides

```bash
# 1. Demander un code
curl -X POST http://localhost:3000/auth/request-code \
  -H "Content-Type: application/json" \
  -d '{"phone": "+33622222222"}'

# 2. Essayer 3 codes invalides
for i in {1..3}; do
  curl -X POST http://localhost:3000/auth/verify-code \
    -H "Content-Type: application/json" \
    -d '{"phone": "+33622222222", "code": "9999"}'
done

# Résultat attendu (3ème tentative) :
# "Trop de tentatives. Réessayez dans 15 minute(s)"
```

---

## ⚙️ Configuration recommandée par environnement

### Développement (DEV)

```typescript
MAX_OTP_RETRIES: 5,              // Plus permissif pour les tests
OTP_EXPIRATION_MINUTES: 10,      // Plus long pour debug
OTP_BLOCK_DURATION_MINUTES: 5,   // Déblocage rapide
```

### Production (PROD)

```typescript
MAX_OTP_RETRIES: 2,              // Strict
OTP_EXPIRATION_MINUTES: 5,       // Standard
OTP_BLOCK_DURATION_MINUTES: 15,  // Protection contre bruteforce
```

### Production haute sécurité

```typescript
MAX_OTP_RETRIES: 1,              // Très strict
OTP_EXPIRATION_MINUTES: 3,       // Court
OTP_BLOCK_DURATION_MINUTES: 30,  // Blocage prolongé
```

---

## 🚨 Limitations actuelles

### ⚠️ Rate limiting en mémoire (non distribué)

**Problème** : Le rate limiting actuel (middleware) utilise un store en mémoire qui ne persiste pas entre les invocations Lambda.

**Impact** :
- Un utilisateur peut contourner le rate limiting en attendant que la Lambda s'arrête (~15 min d'inactivité)
- En multi-instance, chaque Lambda a son propre compteur

**Solution recommandée** : Migrer vers DynamoDB

```typescript
// infrastructure/DynamoDBRateLimiter.ts
export class DynamoRateLimiter {
  private tableName = 'chaly-rate-limits';

  async checkLimit(key: string, maxRequests: number, windowMs: number) {
    // Atomic increment avec TTL
    const ttl = Math.floor((Date.now() + windowMs) / 1000);

    try {
      await this.client.updateItem({
        TableName: this.tableName,
        Key: { pk: { S: key } },
        UpdateExpression: 'ADD requests :incr SET #ttl = :ttl',
        ConditionExpression: 'attribute_not_exists(requests) OR requests < :max',
        ExpressionAttributeNames: { '#ttl': 'ttl' },
        ExpressionAttributeValues: {
          ':incr': { N: '1' },
          ':max': { N: String(maxRequests) },
          ':ttl': { N: String(ttl) }
        }
      });
      return true; // Allowed
    } catch {
      return false; // Rate limited
    }
  }
}
```

---

## 📊 Monitoring recommandé

### Métriques CloudWatch à surveiller

1. **Taux de blocage** : `COUNT(TOO_MANY_ATTEMPTS) / COUNT(request-code)`
2. **Temps moyen avant déblocage** : Durée entre blocage et nouvelle tentative réussie
3. **Patterns de bruteforce** : Pics de tentatives sur un même numéro

### Alarmes recommandées

```yaml
# CloudWatch Alarm
Alarm:
  Name: "auth-lambda-bruteforce-detected"
  Metric: "TOO_MANY_ATTEMPTS_Count"
  Threshold: 100 # Par heure
  Period: 3600
  EvaluationPeriods: 1
  ComparisonOperator: GreaterThanThreshold
  AlarmActions:
    - !Ref SecuritySNSTopic
```

---

## 🔐 Recommandations de sécurité

### Court terme

1. **Migrer vers DynamoDB** pour rate limiting distribué
2. **Logger les blocages** pour analyse forensique
3. **Alerter sur patterns suspects** (même IP, bruteforce coordonné)

### Moyen terme

4. **Captcha après 2 échecs** (mobile-friendly)
5. **Blocage IP** en plus du numéro (via AWS WAF)
6. **Analyse comportementale** (Device fingerprinting)

### Long terme

7. **ML-based fraud detection** (AWS Fraud Detector)
8. **2FA optionnel** pour comptes sensibles
9. **Rate limiting adaptatif** selon le pays/opérateur

---

**Durée de blocage actuelle** : 15 minutes (configurable via `OTP_BLOCK_DURATION_MINUTES`)
