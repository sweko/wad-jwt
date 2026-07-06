// import { payload, sensitivePayload } from "./data";
import { generateKeyPair, signJWT, verifyJWT } from "./jwt-signed-asym";
import { payload, sensitivePayload } from "./data";

const { publicKey, privateKey } = generateKeyPair();

const signed = signJWT(payload, privateKey);
console.log('Signed JWT:');
console.log(signed);

const signedSensitive = signJWT(sensitivePayload, privateKey);
console.log('Signed JWT with sensitive data:');
console.log(signedSensitive);

const verification = verifyJWT(signed, publicKey);
console.log('Verification result:');
console.log(verification);

const verification2 = verifyJWT(signedSensitive, publicKey);
console.log(verification2);