/**
 * transform.ts
 * POST /transform – validates input, optional PII masking, calls Gemini, returns transformed text only.
 */
import { Router } from 'express';
import { rateLimit } from '../middleware/rateLimit.js';
import { hmacAuth } from '../middleware/hmacAuth.js';
import { transformSchema } from '../utils/validators.js';
import { maskPII, unmaskPII } from '../utils/redact.js';
import { generateTransform } from '../services/gemini.js';
import { BadRequestError, toHttp } from '../utils/errors.js';
import { logError } from '../middleware/logger.js';
const router = Router();
router.post('/transform', rateLimit, hmacAuth, async (req, res) => {
    const started = Date.now();
    try {
        const parsed = transformSchema.safeParse(req.body);
        if (!parsed.success)
            throw new BadRequestError('Invalid body');
        let { task, tone, input, redact } = parsed.data;
        // Reject absurd/binary payloads: if raw body contains large HTML
        const raw = req.rawBody;
        // reject binary-ish payloads (control chars) and absurd HTML bodies
        if (raw && /[\x00-\x08\x0E-\x1F]/.test(raw)) {
            throw new BadRequestError('Binary payload rejected');
        }
        if (raw && /<html[\s>]/i.test(raw) && raw.length > 50_000) {
            throw new BadRequestError('HTML payload too large');
        }
        // Soft truncate > 10k
        if (input.length > 10_000) {
            input = input.slice(0, 10_000) + '\n[...trimmed]';
        }
        let map;
        if (redact) {
            const resu = maskPII(input);
            input = resu.masked;
            map = resu.map;
        }
        const { output, model, tokens } = await generateTransform({ task, tone, input });
        const finalOut = map ? unmaskPII(output, map) : output;
        const latency_ms = Date.now() - started;
        // success log: id, path, status, latency, model, token counts (if any)
        const id = req.id || '-';
        console.info(`[${id}] /transform 200 ${latency_ms}ms model=${model} tokens=${tokens ? `${tokens.in}/${tokens.out}` : 'n/a'}`);
        res.json({ output: finalOut, model, latency_ms });
    }
    catch (err) {
        const { status, body } = toHttp(err);
        logError(req, err, { route: '/transform' });
        res.status(status).json(body);
    }
});
export default router;
