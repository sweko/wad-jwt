import * as crypto from 'crypto';
import { toBase64 } from './utils';

// Generate RSA key pair
export function generateKeyPair() {
    return crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem'
        }
    });
}

// Sign JWT with private key
export function signJWT<Payload>(payload: Payload, privateKey: string) {
    const header = {
        alg: 'RS256',
        typ: 'JWT'
    };

    const headerEnc = toBase64(JSON.stringify(header));
    const payloadEnc = toBase64(JSON.stringify(payload));
    const dataToSign = `${headerEnc}.${payloadEnc}`;

    const sign = crypto.createSign('RSA-SHA256');
    sign.update(dataToSign);
    const signature = sign.sign({
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_PADDING,
    });
    const signatureEnc = toBase64(signature as any as string);

    return `${dataToSign}.${signatureEnc}`;
}

// Verify JWT with public key
export function verifyJWT(token: string, publicKey: string): { header: any, payload: any } | null {
    const [headerEnc, payloadEnc, signatureEnc] = token.split('.');
    const dataToVerify = `${headerEnc}.${payloadEnc}`;

    try {
        const verify = crypto.createVerify('RSA-SHA256');
        verify.update(dataToVerify);
        const signature = Buffer.from(signatureEnc, 'base64');

        const isValid = verify.verify({
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_PADDING,
        }, signature);

        if (isValid) {
            const header = JSON.parse(Buffer.from(headerEnc, 'base64').toString());
            const payload = JSON.parse(Buffer.from(payloadEnc, 'base64').toString());
            return { header, payload };
        }
    } catch (error) {
        console.error('JWT verification failed:', error);
    }

    return null;
}