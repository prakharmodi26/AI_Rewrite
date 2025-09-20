/**
 * errors.ts
 * Typed errors and mapping to HTTP responses without leaking details.
 */
export class BadRequestError extends Error {
}
export class UnauthorizedError extends Error {
}
export class ConflictError extends Error {
}
export class TooManyRequestsError extends Error {
}
export class UpstreamError extends Error {
    status;
    constructor(msg, status) {
        super(msg);
        this.status = status;
    }
}
export function toHttp(err) {
    if (err instanceof BadRequestError)
        return { status: 400, body: { error: 'Bad Request' } };
    if (err instanceof UnauthorizedError)
        return { status: 401, body: { error: 'Unauthorized' } };
    if (err instanceof ConflictError)
        return { status: 409, body: { error: 'Conflict' } };
    if (err instanceof TooManyRequestsError)
        return { status: 429, body: { error: 'Too Many Requests' } };
    if (err instanceof UpstreamError)
        return { status: 502, body: { error: 'Upstream Error' } };
    return { status: 500, body: { error: 'Internal Server Error' } };
}
