/**
 * redact.ts
 * PII masking helpers: emails, phones, URLs, IPv4s. Restores via deterministic placeholders.
 */
const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const PHONE_RE = /\+?\d[\d\s().-]{7,}\d/g;
const URL_RE = /https?:\/\/[^\s)]+/gi;
const IPV4_RE = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
export function maskPII(text) {
    const map = { emails: [], phones: [], urls: [], ips: [] };
    let out = text;
    out = out.replace(EMAIL_RE, (m) => {
        map.emails.push(m);
        return `[[EMAIL_${map.emails.length - 1}]]`;
    });
    out = out.replace(PHONE_RE, (m) => {
        map.phones.push(m);
        return `[[PHONE_${map.phones.length - 1}]]`;
    });
    out = out.replace(URL_RE, (m) => {
        map.urls.push(m);
        return `[[URL_${map.urls.length - 1}]]`;
    });
    out = out.replace(IPV4_RE, (m) => {
        map.ips.push(m);
        return `[[IP_${map.ips.length - 1}]]`;
    });
    return { masked: out, map };
}
export function unmaskPII(text, map) {
    let out = text;
    map.emails.forEach((orig, i) => { out = out.replaceAll(`[[EMAIL_${i}]]`, orig); });
    map.phones.forEach((orig, i) => { out = out.replaceAll(`[[PHONE_${i}]]`, orig); });
    map.urls.forEach((orig, i) => { out = out.replaceAll(`[[URL_${i}]]`, orig); });
    map.ips.forEach((orig, i) => { out = out.replaceAll(`[[IP_${i}]]`, orig); });
    return out;
}
