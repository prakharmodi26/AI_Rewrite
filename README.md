# AI Rewrite API (Server Only)

Secure, minimal Node + TypeScript + Express API for text rewrite/summarize using Google Gemini. Built for a future Chrome extension client.

## Endpoints
- POST `/transform` – rewrite/summarize via Gemini
- POST `/oss/transform` – placeholder (501 Not Implemented)
- GET `/healthz` – health check `{ ok: true }`

## Quickstart

```bash
npm install
cp .env.example .env
# set GEMINI_API_KEY and HMAC_SECRET in .env
npm run dev
```

## HMAC request signing
Client must send headers:
- `x-ts`: epoch ms
- `x-nonce`: uuid v4
- `x-signature`: hex HMAC-SHA256 over `body + "." + x-ts + "." + x-nonce`

Node example to compute signature:
```js
import crypto from 'crypto';
const secret = process.env.HMAC_SECRET;
const body = JSON.stringify({ task: 'rewrite', tone: 'concise', input: 'Hello world' });
const ts = Date.now().toString();
const nonce = '123e4567-e89b-12d3-a456-426614174000';
const sig = crypto.createHmac('sha256', secret).update(`${body}.${ts}.${nonce}`).digest('hex');
```

Example curl:
```bash
TS=$(date +%s%3N)
NONCE=123e4567-e89b-12d3-a456-426614174000
BODY='{"task":"rewrite","tone":"concise","input":"Please improve this paragraph for clarity."}'
SIG=$(node -e "const c=require('crypto');console.log(c.createHmac('sha256', process.env.HMAC_SECRET).update(process.env.BODY+'.'+process.env.TS+'.'+process.env.NONCE).digest('hex'))" TS=$TS NONCE=$NONCE BODY="$BODY" HMAC_SECRET=$(grep HMAC_SECRET .env|cut -d= -f2))

curl -sS http://localhost:8080/transform \
  -H 'content-type: application/json' \
  -H "x-ts: $TS" \
  -H "x-nonce: $NONCE" \
  -H "x-signature: $SIG" \
  -d "$BODY" | jq
```

## Deploy (Cloud Run sketch)
- Build: `npm run build`
- Containerize with a minimal Node image
- Set env: `PORT`, `GEMINI_API_KEY`, `HMAC_SECRET`, `ALLOWED_ORIGINS`
- Restrict ingress, disable unauth if behind your infra, confirm CORS

## Structure
```
server/
  src/
    index.ts
    routes/{transform.ts,oss.ts,health.ts}
    services/gemini.ts
    middleware/{requestId.ts,logger.ts,rateLimit.ts,hmacAuth.ts}
    utils/{validators.ts,redact.ts,prompts.ts,errors.ts,time.ts}
    config/{env.ts,cors.ts,safety.ts}
```

No request payloads or model text are logged. API key lives only in env on server.
