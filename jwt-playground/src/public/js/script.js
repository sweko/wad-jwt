const payloadSelect = document.getElementById('payload-select');
const payloadJson = document.getElementById('payload-json');
const algorithmSelect = document.getElementById('algorithm-select');
const generateButton = document.getElementById('generate-button');
const generatedToken = document.getElementById('generated-token');
const useTokenButton = document.getElementById('use-token-button');

const inspectToken = document.getElementById('inspect-token');
const inspectButton = document.getElementById('inspect-button');
const decodeOutput = document.getElementById('decode-output');

let samplePayloads = { default: {}, sensitive: {} };

function applyPayloadSelection() {
  const isCustom = payloadSelect.value === 'custom';
  payloadJson.readOnly = !isCustom;
  if (!isCustom) {
    payloadJson.value = JSON.stringify(samplePayloads[payloadSelect.value], null, 2);
  }
}

async function loadPayloads() {
  const res = await fetch('/api/payloads');
  samplePayloads = await res.json();
  applyPayloadSelection();
}

async function loadServerInfo() {
  const res = await fetch('/api/server-info');
  const info = await res.json();
  document.getElementById('server-secret').textContent = info.hmacSecret;
  document.getElementById('server-public-key').textContent = info.rsaPublicKey;
}

payloadSelect.addEventListener('change', applyPayloadSelection);

generateButton.addEventListener('click', async () => {
  let payload;
  try {
    payload = JSON.parse(payloadJson.value);
  } catch (error) {
    generatedToken.value = `Invalid JSON in payload: ${error.message}`;
    return;
  }

  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ payload, algorithm: algorithmSelect.value }),
  });
  const data = await res.json();
  generatedToken.value = data.token || `Error: ${data.error}`;
});

useTokenButton.addEventListener('click', () => {
  inspectToken.value = generatedToken.value;
});

function renderVerification(cellId, value) {
  const cell = document.getElementById(cellId);
  if (value === 'n/a') {
    cell.textContent = 'n/a (never verified)';
    cell.className = 'na';
  } else if (value === true) {
    cell.textContent = 'pass';
    cell.className = 'pass';
  } else {
    cell.textContent = 'fail';
    cell.className = 'fail';
  }
}

inspectButton.addEventListener('click', async () => {
  const token = inspectToken.value.trim();
  if (!token) return;

  const res = await fetch('/api/inspect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  const data = await res.json();

  decodeOutput.textContent = data.decoded
    ? JSON.stringify(data.decoded, null, 2)
    : `Could not decode: ${data.decodeError}`;

  if (data.verification) {
    renderVerification('verify-none', data.verification.none);
    renderVerification('verify-hs256', data.verification.hs256);
    renderVerification('verify-rs256', data.verification.rs256);
  }
});

loadPayloads();
loadServerInfo();
