import { toBase64 } from "./utils";

export function encodeUnsigned<Payload>(payload: Payload) {
    const header = {
        alg: 'none',
        typ: 'JWT'
    };
    const headerEnc = toBase64(JSON.stringify(header));
    const payloadEnc = toBase64(JSON.stringify(payload));
    return `${headerEnc}.${payloadEnc}`;
}

export function decodeUnsigned(jwt: string) {
    const [headerB64, payloadB64] = jwt.split('.');
    // These supports parsing the URL safe variant of Base64 as well.
    const headerStr = Buffer.from(headerB64, 'base64').toString();
    const payloadStr = Buffer.from(payloadB64, 'base64').toString();
    return {
        header: JSON.parse(headerStr),
        payload: JSON.parse(payloadStr)
    };
}




