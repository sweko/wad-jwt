import * as crypto from 'crypto';
import { VerificationResult } from './user';

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

  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const headerEnc = toBase64(JSON.stringify(header));
  const payloadEnc = toBase64(JSON.stringify(payload));
  const signature = toBase64(hmac(`${headerEnc}.${payloadEnc}`, secretKey, algorithm));

  return `${headerEnc}.${payloadEnc}.${signature}`;
}

export function verifyJwt<T>(token: string): VerificationResult<T> {
  const [header, payload, signature] = token.split('.');
  if (!header || !payload || !signature) {
    return { status: 'failed' };
  }

  return {
    status: 'success', 
    payload: JSON.parse(Buffer.from(payload, 'base64').toString()) 
  };
}