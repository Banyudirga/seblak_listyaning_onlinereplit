# Debug Session: admin-login-fetch [OPEN]

## Symptom
- Browser shows `Failed to load resource: net::ERR_FAILED` for `https://seblaklistyaningonlinereplit-production.up.railway.app/api/admin/login`
- Service worker reports `TypeError: Failed to fetch` from `service-worker.js`

## Actual
- Login from a Vercel preview URL fails before receiving a normal HTTP response.

## Expected
- Admin login should succeed from the intended frontend domain and set the admin session cookie.

## Hypotheses
1. `CORS_ORIGIN` only allows the production Vercel domain, while the failing request comes from a Vercel preview domain.
2. The service worker intercepts cross-origin requests and turns the blocked fetch into a visible network error.
3. The login request is reaching Railway, but the browser rejects the response because credentialed CORS headers do not match the current origin.
4. A stale service worker cache/controller from an older deployment is affecting the preview deployment behavior.

## Evidence So Far
- Error message references preview origin: `https://seblak-listyaning-onlinereplit-d4rnmy515.vercel.app/admin/login`
- Live production admin routes were previously validated from the production Vercel domain.
- `client/public/service-worker.js` wraps all fetches and does not handle network failures gracefully.

## Current Status
- Investigating with instrumentation-first workflow.
- No business-logic fix applied yet.