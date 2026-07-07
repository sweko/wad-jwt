import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { VerificationResult } from './user';

// Every key we're willing to sign with lives in this folder, named by its "kid".
// Multiple keys per kid is the whole point of a real JWKS-style setup: different
// tenants, different rotation generations, whatever. The default one used at
// login time is the one below.
const KEYS_DIR = path.join(__dirname, '..', '..', 'keys');
const DEFAULT_KID = 'hs256-primary.key';

function toBase64(input: string | Buffer): string {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input, 'utf8');
  return buf.toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function hmac(data: string, secret: string, algorithm: string): Buffer {
  return crypto.createHmac(algorithm, secret)
    .update(data)
    .digest();
}

// Looks up the key file for a given kid. The kid is used to build a file path
// with no validation at all - whatever string shows up in the token header is
// trusted as a filename (or a relative path) under KEYS_DIR.
function loadKey(kid: string): string {
  const keyPath = path.join(KEYS_DIR, kid);
  return fs.readFileSync(keyPath, 'utf-8').trim();
}

export async function generateJwt<T>(payload: T): Promise<string> {
  const algorithm = 'sha256';
  const secretKey = loadKey(DEFAULT_KID);

  const header = {
    alg: 'HS256',
    typ: 'JWT',
    kid: DEFAULT_KID
  };

  const headerEnc = toBase64(JSON.stringify(header));
  const payloadEnc = toBase64(JSON.stringify(payload));
  const signature = toBase64(hmac(`${headerEnc}.${payloadEnc}`, secretKey, algorithm));

  return `${headerEnc}.${payloadEnc}.${signature}`;
}

export function verifyJwt<T>(token: string): VerificationResult<T> {
  const [headerB64, payloadB64, signatureB64] = token.split('.');

  if (!headerB64 || !payloadB64 || !signatureB64) {
    return { status: 'failed' };
  }

  const headerStr = Buffer.from(headerB64, 'base64').toString();
  const header = JSON.parse(headerStr);

  if (header.alg !== 'HS256' || !header.kid) {
    return { status: 'failed' };
  }

  let secretKey: string;
  try {
    // header.kid is attacker-controlled input, and it flows straight into a
    // filesystem read with no allowlist and no path sanitization.
    secretKey = loadKey(header.kid);
  } catch {
    return { status: 'failed' };
  }

  const algorithm = 'sha256';
  const signature = toBase64(hmac(`${headerB64}.${payloadB64}`, secretKey, algorithm));

  if (signature !== signatureB64) {
    return { status: 'failed' };
  }

  return {
    status: 'success',
    payload: JSON.parse(Buffer.from(payloadB64, 'base64').toString())
  };
}
