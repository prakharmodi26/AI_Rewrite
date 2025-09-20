/**
 * env.ts
 * Loads and validates environment variables for server configuration.
 */
import 'dotenv/config';
function required(name, value) {
    if (!value || !value.trim()) {
        throw new Error(`Missing required env var: ${name}`);
    }
    return value;
}
const PORT = parseInt(process.env.PORT || '8080', 10);
const GEMINI_API_KEY = required('GEMINI_API_KEY', process.env.GEMINI_API_KEY);
const HMAC_SECRET = required('HMAC_SECRET', process.env.HMAC_SECRET);
const ALLOWED_ORIGINS = required('ALLOWED_ORIGINS', process.env.ALLOWED_ORIGINS)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
export const env = {
    PORT,
    GEMINI_API_KEY,
    HMAC_SECRET,
    ALLOWED_ORIGINS
};
