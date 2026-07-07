import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

// Generates a fresh RSA keypair that belongs entirely to "the attacker" -
// nothing here is stolen, guessed, or borrowed from the target app. That's
// the whole point of the jku SSRF: the attacker doesn't need any of the
// target's secrets, just a place to host their own key and a token that
// points there.

const KEYS_DIR = path.join(__dirname, '..', 'keys');
// Only this subfolder gets published/served. The JWKS lands at the exact
// relative path it needs to be reachable at (.well-known/jwks.json), so this
// folder can be handed to any static host as-is - no server-side routing
// needed. The private key lives one level up, outside the publish root, so
// deploying "public" statically can never accidentally expose it.
const PUBLIC_DIR = path.join(KEYS_DIR, 'public');
const KID = 'attacker-key-1';

function main() {
  fs.mkdirSync(path.join(PUBLIC_DIR, '.well-known'), { recursive: true });

  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });

  fs.writeFileSync(path.join(KEYS_DIR, 'private-key.pem'), privateKey);

  const publicKeyObj = crypto.createPublicKey(publicKey);
  const jwk = publicKeyObj.export({ format: 'jwk' });
  const jwks = { keys: [{ ...jwk, kid: KID, use: 'sig', alg: 'RS256' }] };

  fs.writeFileSync(path.join(PUBLIC_DIR, '.well-known', 'jwks.json'), JSON.stringify(jwks, null, 2));

  console.log('Generated a fresh RSA keypair.');
  console.log('  Private key:   keys/private-key.pem                    (yours - never published)');
  console.log('  Public JWK set: keys/public/.well-known/jwks.json      (this is the whole "site")');
  console.log(`  kid: ${KID}`);
  console.log('');
  console.log('Next: `npm run dev` to serve keys/public locally, then `npm run forge` to build a token.');
}

main();
