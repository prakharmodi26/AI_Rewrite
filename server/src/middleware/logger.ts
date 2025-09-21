/**
 * logger.ts
 * Request logger using morgan and structured error logger.
 * Never logs bodies or secrets.
 */
import morgan from 'morgan';
import type { Request } from 'express';

morgan.token('id', (req: Request & { id?: string }) => req.id ?? '-');
morgan.token('latency', (req: Request & { _startTime?: number }) => {
	const start = (req as any)._startTime as number | undefined;
	if (!start) return '-';
	const ms = Date.now() - start;
	return `${ms} ms`;
});

export const logger = morgan('[:id] :method :url :status :latency');

export function logError(req: Partial<Request> & { id?: string; _startTime?: number } | undefined, err: unknown, context: Record<string, unknown> = {}) {
	try {
		const id = req?.id ?? '-';
		const method = (req as any)?.method ?? '-';
		const url = (req as any)?.originalUrl ?? (req as any)?.url ?? '-';
		const latency = req?._startTime ? (Date.now() - (req as any)._startTime!) : undefined;
		const headers = (req as any)?.headers ?? {};
		const safeHeaders: Record<string, string | undefined> = {
			'x-ts': headers['x-ts'] as string | undefined,
			'x-nonce': headers['x-nonce'] as string | undefined,
			'x-install-id': headers['x-install-id'] as string | undefined,
			'x-forwarded-for': headers['x-forwarded-for'] as string | undefined
		};

		const e = err as any;
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
	} catch (logErr) {
		console.error('[error] Failed to serialize error', (logErr as any)?.message);
	}
}
