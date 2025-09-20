const PER_IP_RATE = 60; // req/min
const PER_INSTALL_RATE = 120; // req/min for x-install-id
const WINDOW_MS = 60_000;
const ipBuckets = new Map();
const installBuckets = new Map();
function refill(bucket, rate, now) {
    const elapsed = now - bucket.lastRefill;
    if (elapsed <= 0)
        return;
    const add = (rate * elapsed) / WINDOW_MS;
    bucket.tokens = Math.min(rate, bucket.tokens + add);
    bucket.lastRefill = now;
}
export function rateLimit(req, res, next) {
    const now = Date.now();
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const installId = req.header('x-install-id');
    // IP bucket
    let ipBucket = ipBuckets.get(ip);
    if (!ipBucket) {
        ipBucket = { tokens: PER_IP_RATE, lastRefill: now };
        ipBuckets.set(ip, ipBucket);
    }
    refill(ipBucket, PER_IP_RATE, now);
    if (ipBucket.tokens < 1) {
        return res.status(429).json({ error: 'Too Many Requests' });
    }
    // Install bucket (if present)
    if (installId) {
        let instBucket = installBuckets.get(installId);
        if (!instBucket) {
            instBucket = { tokens: PER_INSTALL_RATE, lastRefill: now };
            installBuckets.set(installId, instBucket);
        }
        refill(instBucket, PER_INSTALL_RATE, now);
        if (instBucket.tokens < 1) {
            return res.status(429).json({ error: 'Too Many Requests' });
        }
        instBucket.tokens -= 1;
    }
    ipBucket.tokens -= 1;
    next();
}
