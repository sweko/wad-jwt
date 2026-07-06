import { payload, sensitivePayload } from "./data";
import { encodeSignedHmac } from "./jwt-signed-sym";

const signed = encodeSignedHmac(payload);
console.log('Signed JWT:');
console.log(signed);
console.log(`JWT length: ${signed.length}`);

const signedSensitive = encodeSignedHmac(sensitivePayload);
console.log('Signed JWT with sensitive data:');
console.log(signedSensitive);
console.log(`JWT length: ${signedSensitive.length}`);