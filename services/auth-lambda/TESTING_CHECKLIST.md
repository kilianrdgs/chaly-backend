# 🧪 Checklist de tests - Auth Lambda

## Configuration de test

### Variables d'environnement (local)
```bash
ENV=DEV
ACCESS_TOKEN_SECRET=dev_secret_key_at_least_32_chars_long
REFRESH_TOKEN_SECRET=dev_secret_key_at_least_32_chars_long
API_TOP_MESSAGE_KEY=test_key
TEST_PHONE_NUMBER=+33600000000
TEST_OTP_CODE=1234
DATABASE_URL=postgresql://user:password@localhost:5432/chaly
```

### Démarrer le serveur
```bash
cd services/auth-lambda
npm run dev
# Serveur sur http://localhost:3000
```

---

## 📍 Route: `GET /`

### ✅ Cas nominal

```bash
curl http://localhost:3000/
```

**Résultat attendu:**
```json
{
  "success": true,
  "message": "Auth Lambda API",
  "version": "2.0.0",
  "environment": "DEV"
}
```

**Statut:** `200 OK`

---

## 📍 Route: `POST /auth/request-code`

### ✅ Cas nominal - Compte test (DEV)

```bash
curl -X POST http://localhost:3000/auth/request-code \
  -H "Content-Type: application/json" \
  -d '{"phone": "+33600000000"}'
```

**Résultat attendu:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Code envoyé avec succès (compte test)"
  }
}
```

**Statut:** `200 OK`

**✓ Vérifications:**
- [ ] Code OTP stocké en DB (table `PhoneVerifications`)
- [ ] Code = `1234` pour le numéro de test
- [ ] `ExpiresAt` = maintenant + 5 minutes
- [ ] Pas de SMS envoyé (compte test)

---

### ✅ Cas nominal - Numéro réel (avec SMS)

```bash
curl -X POST http://localhost:3000/auth/request-code \
  -H "Content-Type: application/json" \
  -d '{"phone": "+33612345678"}'
```

**Résultat attendu:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Code envoyé avec succès"
  }
}
```

**Statut:** `200 OK`

**✓ Vérifications:**
- [ ] SMS envoyé au numéro
- [ ] Code OTP aléatoire (4 chiffres)
- [ ] Entrée créée dans `PhoneVerifications`

---

### ❌ Erreur - Format de téléphone invalide

```bash
# Test 1: Pas de "+"
curl -X POST http://localhost:3000/auth/request-code \
  -H "Content-Type: application/json" \
  -d '{"phone": "0612345678"}'

# Test 2: Trop court
curl -X POST http://localhost:3000/auth/request-code \
  -H "Content-Type: application/json" \
  -d '{"phone": "+336"}'

# Test 3: Contient des lettres
curl -X POST http://localhost:3000/auth/request-code \
  -H "Content-Type: application/json" \
  -d '{"phone": "+33abc123456"}'
```

**Résultat attendu:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Format invalide (+XXXXXXXXXXX)"
  }
}
```

**Statut:** `400 Bad Request`

**✓ Vérifications:**
- [ ] Validation Zod rejette avant d'atteindre le handler
- [ ] Message d'erreur clair

---

### ❌ Erreur - Body vide ou champ manquant

```bash
# Test 1: Body vide
curl -X POST http://localhost:3000/auth/request-code \
  -H "Content-Type: application/json" \
  -d '{}'

# Test 2: Champ phone absent
curl -X POST http://localhost:3000/auth/request-code \
  -H "Content-Type: application/json" \
  -d '{"number": "+33612345678"}'
```

**Résultat attendu:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Le numéro de téléphone est requis"
  }
}
```

**Statut:** `400 Bad Request`

---

### ❌ Erreur - Rate limiting (3+ requêtes)

```bash
# Envoyer 4 requêtes successives avec le même numéro
for i in {1..4}; do
  curl -X POST http://localhost:3000/auth/request-code \
    -H "Content-Type: application/json" \
    -d '{"phone": "+33698765432"}'
  echo "\n---"
done
```

**Résultat attendu (4ème requête):**
```json
{
  "success": false,
  "error": {
    "code": "TOO_MANY_ATTEMPTS",
    "message": "Numéro bloqué. Réessayez dans 1 minute(s)"
  }
}
```

**Statut:** `429 Too Many Requests`

**✓ Vérifications:**
- [ ] 3 premières requêtes acceptées
- [ ] 4ème requête rejetée
- [ ] `Retries` incrémenté dans DB
- [ ] Message affiche le temps restant avant déblocage

---

### ✅ Cas nominal - Déblocage automatique après délai

```bash
# 1. Bloquer un numéro (4 requêtes)
for i in {1..4}; do
  curl -X POST http://localhost:3000/auth/request-code \
    -H "Content-Type: application/json" \
    -d '{"phone": "+33698765432"}'
done

# 2. Attendre 1 minute (OTP_BLOCK_DURATION_MINUTES = 1)
# Ou modifier CreatedAt en DB pour simuler:
# UPDATE "PhoneVerifications"
# SET "CreatedAt" = NOW() - INTERVAL '2 minutes'
# WHERE "Phone" = '+33698765432';

# 3. Redemander un code
curl -X POST http://localhost:3000/auth/request-code \
  -H "Content-Type: application/json" \
  -d '{"phone": "+33698765432"}'
```

**Résultat attendu:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Code envoyé avec succès"
  }
}
```

**Statut:** `200 OK`

**✓ Vérifications:**
- [ ] Numéro débloqué automatiquement après 1 minute
- [ ] `Retries` réinitialisé à 0 dans DB
- [ ] `CreatedAt` mis à jour
- [ ] Nouveau code OTP généré

---

## 📍 Route: `POST /auth/verify-code`

### ✅ Cas nominal - Nouvel utilisateur

```bash
# 1. Demander un code
curl -X POST http://localhost:3000/auth/request-code \
  -H "Content-Type: application/json" \
  -d '{"phone": "+33600000000"}'

# 2. Vérifier avec le code test
curl -X POST http://localhost:3000/auth/verify-code \
  -H "Content-Type: application/json" \
  -d '{"phone": "+33600000000", "code": "1234"}'
```

**Résultat attendu:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "Id": 1,
      "PhoneNumber": "+33600000000",
      "Pseudo": null,
      "XpTotal": 0,
      "IsVerified": false
    },
    "isNewUser": true,
    "requiresPseudo": true
  }
}
```

**Statut:** `201 Created` (nouvel utilisateur)

**✓ Vérifications:**
- [ ] Utilisateur créé dans la table `Users`
- [ ] `accessToken` et `refreshToken` valides (vérifier avec jwt.io)
- [ ] `isNewUser: true`
- [ ] `requiresPseudo: true` (pas de pseudo)
- [ ] Entrée `PhoneVerifications` supprimée après vérification

---

### ✅ Cas nominal - Utilisateur existant avec pseudo

```bash
# Simuler un utilisateur existant avec pseudo déjà défini
# Puis:
curl -X POST http://localhost:3000/auth/verify-code \
  -H "Content-Type: application/json" \
  -d '{"phone": "+33600000000", "code": "1234"}'
```

**Résultat attendu:**
```json
{
  "success": true,
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "user": {
      "Id": 1,
      "PhoneNumber": "+33600000000",
      "Pseudo": "JohnDoe",
      "XpTotal": 150
    },
    "isNewUser": false,
    "requiresPseudo": false
  }
}
```

**Statut:** `200 OK` (utilisateur existant)

**✓ Vérifications:**
- [ ] Pas de création d'utilisateur (utilise l'existant)
- [ ] `isNewUser: false`
- [ ] `requiresPseudo: false` si pseudo défini

---

### ❌ Erreur - Code invalide

```bash
curl -X POST http://localhost:3000/auth/verify-code \
  -H "Content-Type: application/json" \
  -d '{"phone": "+33600000000", "code": "9999"}'
```

**Résultat attendu:**
```json
{
  "success": false,
  "error": {
    "code": "CODE_INVALID",
    "message": "Le code de vérification est incorrect"
  }
}
```

**Statut:** `400 Bad Request`

**✓ Vérifications:**
- [ ] `Retries` incrémenté dans `PhoneVerifications`
- [ ] Après 2 tentatives incorrectes → `TOO_MANY_ATTEMPTS`

---

### ❌ Erreur - Code expiré

```bash
# Attendre 6 minutes après request-code
# Ou modifier manuellement ExpiresAt en DB
curl -X POST http://localhost:3000/auth/verify-code \
  -H "Content-Type: application/json" \
  -d '{"phone": "+33600000000", "code": "1234"}'
```

**Résultat attendu:**
```json
{
  "success": false,
  "error": {
    "code": "CODE_EXPIRED",
    "message": "Le code de vérification a expiré"
  }
}
```

**Statut:** `401 Unauthorized`

**✓ Vérifications:**
- [ ] Entrée `PhoneVerifications` supprimée automatiquement

---

### ❌ Erreur - Aucune demande de vérification

```bash
# Essayer de vérifier un code sans avoir appelé /request-code
curl -X POST http://localhost:3000/auth/verify-code \
  -H "Content-Type: application/json" \
  -d '{"phone": "+33699999999", "code": "1234"}'
```

**Résultat attendu:**
```json
{
  "success": false,
  "error": {
    "code": "CODE_NOT_FOUND",
    "message": "Aucune demande de vérification trouvée"
  }
}
```

**Statut:** `404 Not Found`

---

### ❌ Erreur - Format code invalide

```bash
# Test 1: Code avec lettres
curl -X POST http://localhost:3000/auth/verify-code \
  -H "Content-Type: application/json" \
  -d '{"phone": "+33600000000", "code": "12ab"}'

# Test 2: Code trop court
curl -X POST http://localhost:3000/auth/verify-code \
  -H "Content-Type: application/json" \
  -d '{"phone": "+33600000000", "code": "123"}'

# Test 3: Code trop long
curl -X POST http://localhost:3000/auth/verify-code \
  -H "Content-Type: application/json" \
  -d '{"phone": "+33600000000", "code": "12345"}'
```

**Résultat attendu:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Le code doit contenir 4 chiffres"
  }
}
```

**Statut:** `400 Bad Request`

---

## 📍 Route: `POST /auth/refresh-token`

### ✅ Cas nominal - Refresh token valide

```bash
# 1. D'abord se connecter pour obtenir un refreshToken
RESPONSE=$(curl -s -X POST http://localhost:3000/auth/verify-code \
  -H "Content-Type: application/json" \
  -d '{"phone": "+33600000000", "code": "1234"}')

REFRESH_TOKEN=$(echo $RESPONSE | jq -r '.data.refreshToken')

# 2. Utiliser le refreshToken
curl -X POST http://localhost:3000/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}"
```

**Résultat attendu:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Statut:** `200 OK`

**✓ Vérifications:**
- [ ] Nouveau `accessToken` généré
- [ ] Nouveau `refreshToken` généré (rotation)
- [ ] Ancien `refreshToken` invalidé dans `Invalid_Tokens`
- [ ] Nouveaux tokens contiennent le même `userId`

---

### ❌ Erreur - Refresh token expiré

```bash
# Utiliser un token expiré (modifier JWT exp manuellement ou attendre 90 jours)
curl -X POST http://localhost:3000/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.expired_token"}'
```

**Résultat attendu:**
```json
{
  "success": false,
  "error": {
    "code": "TOKEN_EXPIRED",
    "message": "Token expiré"
  }
}
```

**Statut:** `401 Unauthorized`

---

### ❌ Erreur - Refresh token invalide (signature)

```bash
curl -X POST http://localhost:3000/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "invalid.jwt.token"}'
```

**Résultat attendu:**
```json
{
  "success": false,
  "error": {
    "code": "TOKEN_INVALID",
    "message": "Token invalide"
  }
}
```

**Statut:** `401 Unauthorized`

---

### ❌ Erreur - Refresh token révoqué (déjà utilisé)

```bash
# 1. Utiliser un refresh token une première fois
REFRESH_TOKEN="<token_valide>"
curl -X POST http://localhost:3000/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}"

# 2. Réutiliser le même token (doit être rejeté)
curl -X POST http://localhost:3000/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}"
```

**Résultat attendu (2ème appel):**
```json
{
  "success": false,
  "error": {
    "code": "TOKEN_INVALID",
    "message": "Token révoqué"
  }
}
```

**Statut:** `401 Unauthorized`

**✓ Vérifications:**
- [ ] Token présent dans `Invalid_Tokens` après 1er refresh
- [ ] 2ème tentative rejetée

---

### ❌ Erreur - Access token utilisé à la place

```bash
# Essayer d'utiliser un accessToken au lieu d'un refreshToken
curl -X POST http://localhost:3000/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "<access_token_au_lieu_de_refresh>"}'
```

**Résultat attendu:**
```json
{
  "success": false,
  "error": {
    "code": "TOKEN_INVALID",
    "message": "Type de token invalide"
  }
}
```

**Statut:** `401 Unauthorized`

**✓ Vérifications:**
- [ ] Service vérifie `payload.tokenType === "refresh"`

---

### ❌ Erreur - Champ manquant

```bash
curl -X POST http://localhost:3000/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Résultat attendu:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Le refresh token est requis"
  }
}
```

**Statut:** `400 Bad Request`

---

## 📍 Route: `POST /auth/logout`

### ✅ Cas nominal - Logout avec refresh token valide

```bash
# 1. D'abord se connecter
RESPONSE=$(curl -s -X POST http://localhost:3000/auth/verify-code \
  -H "Content-Type: application/json" \
  -d '{"phone": "+33600000000", "code": "1234"}')

REFRESH_TOKEN=$(echo $RESPONSE | jq -r '.data.refreshToken')

# 2. Se déconnecter
curl -X POST http://localhost:3000/auth/logout \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}"
```

**Résultat attendu:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Déconnexion réussie"
  }
}
```

**Statut:** `200 OK`

**✓ Vérifications:**
- [ ] `refreshToken` ajouté dans `Invalid_Tokens`
- [ ] Impossible de réutiliser ce token pour refresh

---

### ❌ Erreur - Refresh token déjà révoqué

```bash
# Essayer de se déconnecter 2 fois avec le même token
curl -X POST http://localhost:3000/auth/logout \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "<token_deja_revoque>"}'
```

**Résultat attendu:**
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "Erreur lors de la déconnexion"
  }
}
```

**Statut:** `500 Internal Server Error`

**Note:** Comportement actuel peut varier (le service catch l'erreur)

---

### ❌ Erreur - Champ manquant

```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Résultat attendu:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Le refresh token est requis"
  }
}
```

**Statut:** `400 Bad Request`

---

## 📍 Route: `GET /test/*` (DEV uniquement)

### ✅ GET /test/health

```bash
curl http://localhost:3000/test/health
```

**Résultat attendu:**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2025-01-05T12:34:56.789Z",
    "environment": "DEV"
  }
}
```

**Statut:** `200 OK`

---

### ✅ GET /test/db

```bash
curl http://localhost:3000/test/db
```

**Résultat attendu:**
```json
{
  "success": true,
  "data": {
    "ok": true,
    "message": "Connexion DB réussie",
    "users": [
      {
        "Id": 1,
        "PhoneNumber": "+33600000000",
        "Pseudo": "JohnDoe"
      }
    ]
  }
}
```

**Statut:** `200 OK`

**✓ Vérifications:**
- [ ] Connexion Prisma fonctionnelle
- [ ] Retourne au moins 1 utilisateur (si DB non vide)

---

### ❌ GET /test/health en PROD (doit être 404)

```bash
# Tester avec ENV=PROD
ENV=PROD npm run dev

curl http://localhost:3000/test/health
```

**Résultat attendu:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Route non trouvée"
  }
}
```

**Statut:** `404 Not Found`

**✓ Vérifications:**
- [ ] Routes `/test/*` désactivées en production

---

## 🔒 Tests de sécurité

### ❌ CORS - Requête depuis navigateur web (PROD)

```bash
# Simuler une requête avec Origin (navigateur)
curl -X POST https://votre-api.com/auth/request-code \
  -H "Content-Type: application/json" \
  -H "Origin: https://evil.com" \
  -d '{"phone": "+33600000000"}'
```

**Résultat attendu:**
- **En DEV:** Requête acceptée
- **En PROD:** Requête rejetée (CORS error)

**✓ Vérifications:**
- [ ] Header `Access-Control-Allow-Origin` absent en réponse
- [ ] Navigateur bloque la réponse

---

### ❌ Injection SQL (Prisma protège)

```bash
# Essayer une injection SQL dans le téléphone
curl -X POST http://localhost:3000/auth/request-code \
  -H "Content-Type: application/json" \
  -d '{"phone": "+33600000000; DROP TABLE Users;--"}'
```

**Résultat attendu:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Format invalide (+XXXXXXXXXXX)"
  }
}
```

**Statut:** `400 Bad Request`

**✓ Vérifications:**
- [ ] Validation Zod rejette avant DB
- [ ] Prisma utilise parameterized queries (pas d'injection possible)

---

### ❌ JWT Forgery (signature invalide)

```bash
# Modifier manuellement un JWT et essayer de l'utiliser
curl -X POST http://localhost:3000/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake_payload.fake_signature"}'
```

**Résultat attendu:**
```json
{
  "success": false,
  "error": {
    "code": "TOKEN_INVALID",
    "message": "Token invalide"
  }
}
```

**Statut:** `401 Unauthorized`

---

## 📊 Résumé des tests

### Par route

| Route | Cas testés | Statuts attendus |
|-------|------------|------------------|
| `GET /` | 1 | 200 |
| `POST /auth/request-code` | 6 | 200, 400, 429 |
| `POST /auth/verify-code` | 7 | 200, 201, 400, 401, 404 |
| `POST /auth/refresh-token` | 6 | 200, 401, 400 |
| `POST /auth/logout` | 3 | 200, 400, 500 |
| `GET /test/*` | 3 | 200, 404 |

**Total:** 26 cas de test

---

## 🛠️ Outils recommandés

### Script de test automatisé

Créer `test-api.sh`:
```bash
#!/bin/bash
API_URL="http://localhost:3000"

echo "🧪 Testing Auth Lambda API..."

# Test 1: Health check
echo "\n1️⃣ GET /"
curl -s $API_URL/ | jq

# Test 2: Request code (compte test)
echo "\n2️⃣ POST /auth/request-code"
curl -s -X POST $API_URL/auth/request-code \
  -H "Content-Type: application/json" \
  -d '{"phone": "+33600000000"}' | jq

# Test 3: Verify code
echo "\n3️⃣ POST /auth/verify-code"
TOKENS=$(curl -s -X POST $API_URL/auth/verify-code \
  -H "Content-Type: application/json" \
  -d '{"phone": "+33600000000", "code": "1234"}')
echo $TOKENS | jq

# Test 4: Refresh token
REFRESH_TOKEN=$(echo $TOKENS | jq -r '.data.refreshToken')
echo "\n4️⃣ POST /auth/refresh-token"
curl -s -X POST $API_URL/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}" | jq

# Test 5: Logout
echo "\n5️⃣ POST /auth/logout"
curl -s -X POST $API_URL/auth/logout \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}" | jq
```

**Utilisation:**
```bash
chmod +x test-api.sh
./test-api.sh
```

---

## ✅ Checklist finale

### Avant de déployer en production

- [ ] Tous les cas nominaux passent
- [ ] Toutes les validations rejettent les données invalides
- [ ] Rate limiting fonctionne correctement
- [ ] JWT rotation fonctionne (refresh)
- [ ] Token révoqués ne peuvent pas être réutilisés
- [ ] CORS rejette les requêtes avec Origin en PROD
- [ ] Routes `/test/*` désactivées en PROD
- [ ] Secrets validés au démarrage (env.ts)
- [ ] Base de données accessible depuis Lambda
- [ ] SMS envoyés correctement (TopMessage)
- [ ] CloudWatch logs actifs et lisibles

---

**Bon test ! 🚀**
