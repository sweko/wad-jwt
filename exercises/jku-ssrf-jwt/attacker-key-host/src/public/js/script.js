const sourceToken = document.getElementById('source-token');
const decodeButton = document.getElementById('decode-button');
const sourceHeader = document.getElementById('source-header');

const payloadJson = document.getElementById('payload-json');
const forgeButton = document.getElementById('forge-button');
const forgedToken = document.getElementById('forged-token');
const forgedHeader = document.getElementById('forged-header');

// Decoding never needs a key, so it happens entirely client-side - no
// server round-trip, works even before a keypair has been generated.
function base64UrlDecode(str) {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (str.length % 4)) % 4);
  return decodeURIComponent(
    atob(padded)
      .split('')
      .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('')
  );
}

decodeButton.addEventListener('click', () => {
  const token = sourceToken.value.trim();
  if (!token) return;

  const parts = token.split('.');
  if (parts.length < 2) {
    sourceHeader.value = 'Not a JWT - expected at least header.payload';
    return;
  }

  try {
    const header = JSON.parse(base64UrlDecode(parts[0]));
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    sourceHeader.value = JSON.stringify(header, null, 2);
    payloadJson.value = JSON.stringify(payload, null, 2);
  } catch (error) {
    sourceHeader.value = `Could not decode: ${error.message}`;
  }
});

// Signing does need the private key, so this goes through the server -
// the key never leaves the machine this is running on.
forgeButton.addEventListener('click', async () => {
  let payload;
  try {
    payload = JSON.parse(payloadJson.value);
  } catch (error) {
    forgedToken.value = `Invalid JSON in payload: ${error.message}`;
    return;
  }

  const res = await fetch('/api/forge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ payload }),
  });
  const data = await res.json();

  if (!res.ok) {
    forgedToken.value = `Error: ${data.error}`;
    forgedHeader.textContent = '-';
    return;
  }

  forgedToken.value = data.token;
  forgedHeader.textContent = JSON.stringify(data.header, null, 2);
});
