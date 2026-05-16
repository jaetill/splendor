# Deploy

Splendor auto-deploys to GitHub Pages on every push to `main` via `.github/workflows/deploy.yml`.

## Manual / forced deploy

```sh
git checkout main
git pull --ff-only
git commit --allow-empty -m "chore: force deploy"
git push origin main
```

## Rollback

```sh
git revert <bad-sha>
git push origin main
```

Or use the GitHub Pages "Deployments" tab to re-deploy a prior successful build.

## Future work

- Phase 5 (Sentry) deferred per ADR-0001 - splendor has no server-side errors, so frontend-only Sentry is the question. Defer until first user-reported bug.
- Source maps not uploaded anywhere - acceptable for a learning project.