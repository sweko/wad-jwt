import * as crypto from 'crypto';
import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import * as path from 'path';
import { URL } from 'url';
import { VerificationResult } from './user';

const KEYS_DIR = path.join(__dirname, '..', '..', 'keys');
const SERVER_KID = 'server-key-1';
const OWN_JKU = `http://localhost:${process.env.PORT || 3005}/.well-known/jwks.json`;

function toBase64(str: string): string {
  return Buffer.from(str).toString('base64url');
}

function loadServerPrivateKey(): string {
  return fs.readFileSync(path.join(KEYS_DIR, 'rsa-private.pem'), 'utf-8');
}

function loadServerPublicKey(): string {
  return fs.readFileSync(path.join(KEYS_DIR, 'rsa-public.pem'), 'utf-8');
}

function sign(data: string, privateKeyPem: string): string {
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(data);
  signer.end();
  return signer.sign(privateKeyPem).toString('base64url');
}

function verifySignature(data: string, signatureB64Url: string, publicKey: crypto.KeyLike): boolean {
  const verifier = crypto.createVerify('RSA-SHA256');
  verifier.update(data);
  verifier.end();
  const signature = Buffer.from(signatureB64Url, 'base64url');
  return verifier.verify(publicKey, signature);
}

// Fetches and parses JSON from any URL, HTTP or HTTPS. No allowlist of hosts,
// no check that the URL points anywhere the server is actually supposed to
// trust - it fetches whatever it's told to fetch.
function fetchJson(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch (err) {
      return reject(err);
    }

    const client = parsed.protocol === 'https:' ? https : http;
    const req = client.get(parsed, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(err);
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(3000, () => req.destroy(new Error('jku fetch timed out')));
  });
}

// This is the server's own, legitimate JWK Set - what a well-behaved client
// fetching OWN_JKU would see. Exported separately from the route so the
// signing/serving logic for our own key lives in one place.
export function getOwnJwks(): { keys: Record<string, unknown>[] } {
  const publicKey = crypto.createPublicKey(loadServerPublicKey());
  const jwk = publicKey.export({ format: 'jwk' });
  return { keys: [{ ...jwk, kid: SERVER_KID, use: 'sig', alg: 'RS256' }] };
}

export async function generateJwt<T>(payload: T): Promise<string> {
  const header = { alg: 'RS256', typ: 'JWT', kid: SERVER_KID, jku: OWN_JKU };

  const headerEnc = toBase64(JSON.stringify(header));
  const payloadEnc = toBase64(JSON.stringify(payload));
  const signature = sign(`${headerEnc}.${payloadEnc}`, loadServerPrivateKey());

  return `${headerEnc}.${payloadEnc}.${signature}`;
}

export async function verifyJwt<T>(token: string): Promise<VerificationResult<T>> {
  const [headerB64, payloadB64, signatureB64] = token.split('.');

  if (!headerB64 || !payloadB64 || !signatureB64) {
    return { status: 'failed' };
  }

  const header = JSON.parse(Buffer.from(headerB64, 'base64url').toString());

  if (header.alg !== 'RS256' || !header.jku || !header.kid) {
    return { status: 'failed' };
  }

  let jwkSet: { keys?: Record<string, unknown>[] };
  try {
    // header.jku is attacker-controlled input. We fetch whatever URL it names
    // and trust whatever key set comes back - there's no check that this URL
    // belongs to a host we actually issue tokens from.
    jwkSet = await fetchJson(header.jku);
  } catch {
    return { status: 'failed' };
  }

  const jwk = jwkSet.keys?.find((k) => k.kid === header.kid);
  if (!jwk) {
    return { status: 'failed' };
  }

  let publicKey: crypto.KeyObject;
  try {
    publicKey = crypto.createPublicKey({ key: jwk as any, format: 'jwk' });
  } catch {
    return { status: 'failed' };
  }

  const verified = verifySignature(`${headerB64}.${payloadB64}`, signatureB64, publicKey);
  if (!verified) {
    return { status: 'failed' };
  }

  return {
    status: 'success',
    payload: JSON.parse(Buffer.from(payloadB64, 'base64url').toString())
  };
}
