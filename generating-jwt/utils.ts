export function toBase64(str: string) {
    return Buffer.from(str).toString('base64')
                        // make it URL safe
                          .replace(/=/g, '')
                          .replace(/\+/g, '-')
                          .replace(/\//g, '_');
}