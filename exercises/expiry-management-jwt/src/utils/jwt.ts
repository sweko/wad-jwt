import * as crypto from 'crypto';
import { VerificationResult } from './verifications';

function toBase64(str: string): string {
  return Buffer.from(str).toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function hmac(data: string, secret: string, algorithm: string): string {
  return crypto.createHmac(algorithm, secret)
    .update(data)
    .digest('base64');
}

export async function generateJwt<T>(payload: T): Promise<string> {
  const secretKey = process.env.JWT_SECRET || 'we-love-what-the-stack';
  const algorithm = 'sha256';

  const now = Date.now() / 1000 | 0;
  // add issued at time
  payload = { ...payload, iat: now };
  // add expiration time
  payload = { ...payload, exp: now + 60 * 5 };

  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const headerEnc = toBase64(JSON.stringify(header));
  const payloadEnc = toBase64(JSON.stringify(payload));
  const signature = toBase64(hmac(`${headerEnc}.${payloadEnc}`, secretKey, algorithm));

  return `${headerEnc}.${payloadEnc}.${signature}`;
}

const verifications: Record<string, (token: string, keys: any) => boolean> = {
  "none": () => true,
  "HS256": (token: string, secret: string) => {
      const algorithm = 'sha256';
      const [headerB64, payloadB64, signatureB64] = token.split('.');
      const signature = toBase64(hmac(`${headerB64}.${payloadB64}`, secret, algorithm));
      return signature === signatureB64;
  }
}

const allowedAlgorithms = ['HS256'];

export function verifyJwt<T>(token: string): VerificationResult<T> {
  const [headerB64, payloadB64, signatureB64] = token.split('.');
  const secretKey = process.env.JWT_SECRET || 'we-love-what-the-stack';

  if (!headerB64 || !payloadB64 || !signatureB64) {
    return { status: 'failed', reason: 'missing' };
  }

  const headerStr = Buffer.from(headerB64, 'base64').toString();
  const header = JSON.parse(headerStr);
  if (!allowedAlgorithms.includes(header.alg)) {
    return { status: 'failed', reason: 'invalid' };
  }

  const payloadStr = Buffer.from(payloadB64, 'base64').toString();
  const payload = JSON.parse(payloadStr);

  if (payload.exp < Date.now() / 1000) {
    // the token is expired
    return { 
      status: 'failed', 
      reason: 'expired',
      payload: payload,
    };
  }

  let verified = false;
  if (header.alg in verifications) {
      verified = verifications[header.alg](token, secretKey);
  }
  if (!verified) {
    return { status: 'failed', reason: 'invalid' };
  }

  return { 
    status: 'success', 
    payload: JSON.parse(Buffer.from(payloadB64, 'base64').toString()),
  };
}
