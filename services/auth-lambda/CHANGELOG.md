# Changelog - Auth Lambda

## [2.1.0] - 2025-01-05

### ✨ Nouvelles fonctionnalités

#### Déblocage automatique des numéros bloqués
- **Problème résolu** : Les numéros bloqués après trop de tentatives restaient bloqués indéfiniment
- **Solution** : Déblocage automatique après un délai configurable (`OTP_BLOCK_DURATION_MINUTES`)
- **Défaut** : 1 minute en DEV (à passer à 15 minutes en PROD)

**Comportement avant** :
```
Tentative 1 → OK (Retries = 0)
Tentative 2 → OK (Retries = 1)
Tentative 3 → OK (Retries = 2)
Tentative 4 → ❌ BLOQUÉ INDÉFINIMENT
```

**Comportement après** :
```
Tentative 1 → OK (Retries = 0)
Tentative 2 → OK (Retries = 1)
Tentative 3 → OK (Retries = 2)
Tentative 4 → ❌ BLOQUÉ ("Réessayez dans X minute(s)")

[Attendre OTP_BLOCK_DURATION_MINUTES]

Tentative 5 → ✅ DÉBLOQUÉ automatiquement (Retries réinitialisé à 0)
```

**Fichiers modifiés** :
- [env.ts](src/config/env.ts) : Ajout de `OTP_BLOCK_DURATION_MINUTES`
- [createPhoneVerification.repo.ts](src/modules/repositories/createPhoneVerification.repo.ts) : Logique de déblocage
- [verifyPhoneCode.repo.ts](src/modules/repositories/verifyPhoneCode.repo.ts) : Validation du déblocage

**Messages d'erreur améliorés** :
- Avant : `"Numéro bloqué"`
- Après : `"Numéro bloqué. Réessayez dans 12 minute(s)"`

---

### 🔒 Améliorations de sécurité

#### Validation renforcée des secrets d'environnement
- Vérification que les variables ne sont pas vides (`.trim()`)
- En production : validation longueur minimale (32 caractères)
- Détection des valeurs par défaut dangereuses ("secret", "changeme", etc.)
- Variables de test interdites en production

**Fichier modifié** :
- [env.ts](src/config/env.ts) : Nouvelles fonctions `requireEnv()` et `optionalEnvWithProdCheck()`

#### CORS sécurisé pour applications mobiles natives
- En DEV : Accepte tout (`origin: "*"`)
- En PROD : Accepte uniquement les requêtes sans header `Origin` (apps mobiles)
- Rejette les requêtes depuis navigateurs web (protection CSRF)

**Fichier modifié** :
- [app.ts](src/app.ts) : Configuration CORS dynamique selon environnement

---

### 📚 Nouvelle documentation

#### Fichiers ajoutés
- [SECURITY.md](SECURITY.md) : Stratégie de sécurité complète
  - CORS pour mobile
  - Validation des secrets
  - Mesures actuelles et recommandations futures

- [RATE_LIMITING.md](RATE_LIMITING.md) : Documentation exhaustive du rate limiting
  - Règles de blocage/déblocage
  - Scénarios de test
  - Configuration par environnement
  - Limitations actuelles et solutions recommandées

- [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md) : 27 cas de test
  - Tous les endpoints avec exemples curl
  - Cas nominaux et erreurs
  - Tests de sécurité
  - Script de test automatisé

#### Fichiers mis à jour
- [ARCHITECTURE.md](ARCHITECTURE.md) : Mention du déblocage automatique
- [README.md](README.md) : Liens vers toute la documentation

---

## Configuration recommandée

### Développement
```typescript
OTP_BLOCK_DURATION_MINUTES: 1  // Test rapide du déblocage
```

### Production
```typescript
OTP_BLOCK_DURATION_MINUTES: 15 // Protection anti-bruteforce
```

---

## Migration depuis v2.0.0

### Variables d'environnement

**Aucune nouvelle variable obligatoire**

`OTP_BLOCK_DURATION_MINUTES` est optionnel et a une valeur par défaut de 1 minute (en DEV).

**Pour la production, ajouter dans `.env` ou SSM** :
```bash
OTP_BLOCK_DURATION_MINUTES=15
```

### Base de données

**Aucune migration nécessaire**

La table `PhoneVerifications` utilise déjà le champ `CreatedAt` pour calculer la date de déblocage.

### Compatibilité

✅ **Rétrocompatible** : Aucun breaking change

Les numéros actuellement bloqués seront automatiquement débloqués après le délai configuré.

---

## Tests recommandés après déploiement

1. **Tester le blocage** : Envoyer 4 requêtes OTP sur un même numéro
2. **Vérifier le message d'erreur** : Doit afficher "Réessayez dans X minute(s)"
3. **Tester le déblocage** : Attendre le délai et redemander un code
4. **Vérifier en DB** : `Retries` doit être réinitialisé à 0

Voir [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md) pour les tests complets.

---

## Auteur

Modifications réalisées par Claude Code lors de l'audit de sécurité du 2025-01-05.
