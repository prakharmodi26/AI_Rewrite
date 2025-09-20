#!/usr/bin/env node
/**
 * send_transform.js (ESM)
 * Dev helper: construct a /transform request, compute HMAC signature, send request, print result.
 * Usage examples:
 *   node send_transform.js --text "Your paragraph here"
 *   node send_transform.js --file body.json
 *   node send_transform.js --text-file paragraph.txt
 * Options:
 *   --url <url>        override endpoint (default http://localhost:8080/transform)
 *   --text "..."      pass the input paragraph directly
 *   --file <path>      pass a JSON file containing the full request body
 *   --text-file <path> read plain text file and wrap into body {task,tone,input}
 */
import 'dotenv/config';
import fs from 'node:fs';
import { createHmac, randomUUID, randomBytes } from 'node:crypto';
const { argv } = process;

function parseArgs() {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--url') { args.url = argv[++i]; }
    else if (a === '--text') { args.text = argv[++i]; }
    else if (a === '--file') { args.file = argv[++i]; }
    else if (a === '--text-file') { args.textFile = argv[++i]; }
    else if (a === '--help' || a === '-h') { args.help = true; }
  }
  return args;
}

function loadEnvSecret() {
  if (process.env.HMAC_SECRET) return process.env.HMAC_SECRET;
  console.error('HMAC_SECRET not found in environment (load it via .env or export it)');
  process.exit(2);
}

async function main() {
  const args = parseArgs();
  if (args.help) {
    console.log('Usage: node send_transform.js --text "..." | --file body.json | --text-file file.txt');
    process.exit(0);
  }

  const url = args.url || process.env.TRANSFORM_URL || 'http://localhost:8080/transform';
  let bodyStr = null;

  if (args.file) {
    // read JSON file; preserve exact content but remove leading/trailing whitespace
    bodyStr = fs.readFileSync(args.file, 'utf8').trim();
    // If file contains pretty JSON, collapse to single-line to match signature expectations
    try {
      const obj = JSON.parse(bodyStr);
      bodyStr = JSON.stringify(obj);
    } catch (e) {
      // if not valid JSON, use raw
    }
  } else if (args.textFile) {
    const txt = fs.readFileSync(args.textFile, 'utf8').trim();
    const obj = { task: 'rewrite', tone: 'clear', input: txt, redact: false };
    bodyStr = JSON.stringify(obj);
  } else if (args.text) {
    const obj = { task: 'rewrite', tone: 'clear', input: args.text, redact: false };
    bodyStr = JSON.stringify(obj);
  } else {
    // default interactive sample
    const sample = 'Please improve this paragraph for clarity and concision.';
    const obj = { task: 'rewrite', tone: 'concise', input: sample, redact: false };
    bodyStr = JSON.stringify(obj);
  }

  const ts = Date.now().toString();
  const nonce = (randomUUID && randomUUID()) || randomBytes(16).toString('hex');

  const secret = loadEnvSecret();
  const data = `${bodyStr}.${ts}.${nonce}`;
  const sig = createHmac('sha256', secret).update(data).digest('hex');

  console.log('POST', url);
  console.log('x-ts:', ts);
  console.log('x-nonce:', nonce);
  console.log('x-signature:', sig);
  console.log('body:', bodyStr);

  // send request
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-ts': ts,
        'x-nonce': nonce,
        'x-signature': sig
      },
      body: bodyStr
    });

    const text = await res.text();
    let parsed = null;
    try { parsed = JSON.parse(text); } catch (e) { parsed = text; }
    console.log('HTTP', res.status);
    console.log('RESPONSE:', JSON.stringify(parsed, null, 2));
  } catch (err) {
    console.error('Request failed:', err);
  }
}

main();
