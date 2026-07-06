function now(): number {
  return (new Date().getTime() / 1000) | 0;
}

export function defaultPayload() {
  const iat = now();
  return {
    iss: 'should-be-an-url',
    sub: 'UserID-123',
    aud: 'audience',
    exp: iat + 5 * 60,
    iat,
    admin: false,
    username: 'johndoe',
    name: 'John Doe',
    email: 'john.doe@example.com',
  };
}

export function sensitivePayload() {
  return {
    ...defaultPayload(),
    password: 'my-password',
    creditCard: '1234 5678 9012 3456',
    ssn: '65 220790 M 001',
    phone: '+49 151 12345678',
    address: 'Musterstraße 1, 12345 Musterstadt, Germany',
    dob: '1970-01-01',
    embarrassing: 'My favorite show is Bauer sucht Frau',
  };
}
