const now = (new Date().getTime() / 1000) | 0;
const inFiveMinutes = now + 5 * 60;

export const payload = {
    // Registered Claims
    iss: 'should-be-an-url',
    sub: 'UserID-123',
    aud: 'audience',
    exp: inFiveMinutes,
    iat: now,
    // Private Claims
    admin: false,
    username: 'johndoe',
    name: 'John Doe',
    email: 'john.doe@example.com',
};

export const sensitivePayload = {
    // Registered Claims
    iss: 'should-be-an-url',
    sub: 'UserID-123',
    aud: 'audience',
    exp: inFiveMinutes,
    iat: now,
    // Private Claims
    admin: false,
    username: 'johndoe',
    name: 'John Doe',
    email: 'john.doe@example.com',
    // Sensitive data
    password: 'my-password',
    creditCard: '1234 5678 9012 3456',
    ssn: '65 220790 M 001',
    phone: '+49 151 12345678',
    address: 'Musterstraße 1, 12345 Musterstadt, Germany',
    dob: '1970-01-01',
    // Embarrassing data
    embarrassing: 'My favorite show is Bauer sucht Frau',
};