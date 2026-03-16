# Next Steps

## ✅ Done
- Architecture Hono complète (handlers/services/repositories)
- 4 routes auth: request-code, verify-code, refresh-token, logout
- Validation Zod + JWT + SMS service

## 🔄 À faire

### Tests
- [ ] Tester les 4 routes en local (`npm run dev`)
- [ ] Valider les erreurs et rate limiting

### Déploiement
- [ ] Configurer `serverless.yml`
- [ ] Déployer sur AWS
- [ ] Migrer progressivement depuis api-lambda

### Améliorations futures
- [ ] Migrer rate limiting vers Redis (actuellement en mémoire)
- [ ] Logs structurés + métriques

## Commandes

```bash
npm run dev              # Développement local
npm run build            # Build TypeScript
npm run prisma:generate  # Générer client Prisma
npm run deploy           # Déployer sur AWS
```
