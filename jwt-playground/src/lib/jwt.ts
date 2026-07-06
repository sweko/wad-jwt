import * as crypto from 'crypto';

export type Algorithm = 'none' | 'HS256' | 'RS256';

// Accepts either UTF-8 text (header/payload JSON) or raw bytes (a signature) -
// callers must not pre-base64-encode a Buffer before passing it in here.
function toBase64Url(input: string | Buffer): string {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input, 'utf8');
  return buf.toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function fromBase64Url(str: string): Buffer {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(padded, 'base64');
}

// Same secret as generating-jwt/jwt-signed-sym.ts, kept in memory for the life of this process.
const HMAC_SECRET = 'we-are-secret-developers'; // please, use a better secret key and keep it safe!

const { publicKey: RSA_PUBLIC_KEY, privateKey: RSA_PRIVATE_KEY } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

export function getServerInfo() {
  return {
    hmacSecret: HMAC_SECRET,
    rsaPublicKey: RSA_PUBLIC_KEY,
  };
}

function hmacSign(data: string): string {
  return toBase64Url(crypto.createHmac('sha256', HMAC_SECRET).update(data).digest());
}

export function generateToken(payload: unknown, algorithm: Algorithm): string {
  const headerEnc = toBase64Url(JSON.stringify({ alg: algorithm, typ: 'JWT' }));
  const payloadEnc = toBase64Url(JSON.stringify(payload));
  const signingInput = `${headerEnc}.${payloadEnc}`;

  if (algorithm === 'none') {
    return `${signingInput}.`;
  }

  if (algorithm === 'HS256') {
    return `${signingInput}.${hmacSign(signingInput)}`;
  }

  // RS256
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signingInput);
  const signature = sign.sign({ key: RSA_PRIVATE_KEY, padding: crypto.constants.RSA_PKCS1_PADDING });
  return `${signingInput}.${toBase64Url(signature)}`;
}

export interface DecodeResult {
  header: any;
  payload: any;
}

// Pure structural decode: works regardless of algorithm or signature validity.
// This is the core lesson - reading a JWT never requires a key.
export function decodeToken(token: string): DecodeResult {
  const parts = token.split('.');
  if (parts.length < 2) {
    throw new Error('Token must have at least a header and payload segment');
  }
  const [headerB64, payloadB64] = parts;
  const header = JSON.parse(fromBase64Url(headerB64).toString());
  const payload = JSON.parse(fromBase64Url(payloadB64).toString());
  return { header, payload };
}

export interface VerificationResult {
  none: 'n/a';
  hs256: boolean;
  rs256: boolean;
}

// Real cryptographic verification, independent of decodeToken - the two can disagree.
export function verifyToken(token: string): VerificationResult {
  const [headerB64, payloadB64, signatureB64 = ''] = token.split('.');
  const signingInput = `${headerB64}.${payloadB64}`;

  const hs256 = hmacSign(signingInput) === signatureB64;

  let rs256 = false;
  try {
    const verify = crypto.createVerify('RSA-SHA256');
    verify.update(signingInput);
    rs256 = verify.verify(
      { key: RSA_PUBLIC_KEY, padding: crypto.constants.RSA_PKCS1_PADDING },
      fromBase64Url(signatureB64)
    );
  } catch {
    rs256 = false;
  }

  return { none: 'n/a', hs256, rs256 };
}
