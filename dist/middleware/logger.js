/**
 * logger.ts
 * Request logger using morgan and structured error logger.
 * Never logs bodies or secrets.
 */
import morgan from 'morgan';
morgan.token('id', (req) => req.id ?? '-');
morgan.token('latency', (req) => {
    const start = req._startTime;
    if (!start)
        return '-';
    const ms = Date.now() - start;
    return `${ms} ms`;
});
export const logger = morgan('[:id] :method :url :status :latency');
export function logError(req, err, context = {}) {
    try {
        const id = req?.id ?? '-';
        const method = req?.method ?? '-';
        const url = req?.originalUrl ?? req?.url ?? '-';
        const latency = req?._startTime ? (Date.now() - req._startTime) : undefined;
        const headers = req?.headers ?? {};
        const safeHeaders = {
            'x-ts': headers['x-ts'],
            'x-nonce': headers['x-nonce'],
            'x-install-id': headers['x-install-id'],
            'x-forwarded-for': headers['x-forwarded-for']
        };
        const e = err;
        const detail = {
            id,
            method,
            url,
            latency_ms: latency,
            error: {
                name: e?.name ?? 'Error',
                message: e?.message ?? String(e),
                status: e?.status ?? e?.response?.status,
                code: e?.code,
                cause: e?.cause?.message || undefined,
                stack: e?.stack
            },
            headers: safeHeaders,
            ...context
        };
        // Use a consistent single-line JSON for easy grep in terminals
        console.error('[error]', JSON.stringify(detail));
    }
    catch (logErr) {
        console.error('[error] Failed to serialize error', logErr?.message);
    }
}
