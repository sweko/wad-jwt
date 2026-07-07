import * as crypto from 'crypto';
import { VerificationResult } from './user';

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

function getKey(): string {
  return process.env.JWT_SECRET || 'we-love-developers';
}

export async function generateJwt<T>(payload: T): Promise<string> {
  const secretKey = getKey();
  const algorithm = 'sha256';

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

export function verifyJwt<T>(token: string): VerificationResult<T> {
  const [headerB64, payloadB64, signatureB64] = token.split('.');
  const secretKey = getKey();

  if (!headerB64 || !payloadB64 || !signatureB64) {
    return { status: 'failed' };
  }

  const headerStr = Buffer.from(headerB64, 'base64').toString();
  const header = JSON.parse(headerStr);
  let verified = false;
  if (header.alg in verifications) {
      verified = verifications[header.alg](token, secretKey);
  }
  if (!verified) {
    return { status: 'failed' };
  }

  return { 
    status: 'success', 
    payload: JSON.parse(Buffer.from(payloadB64, 'base64').toString()) 
  };
}