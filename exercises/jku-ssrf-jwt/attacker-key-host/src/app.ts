import express from 'express';
import * as path from 'path';
import forgeRoutes from './routes/api';
import { getJkuUrl } from './sign';

const app = express();
const port = process.env.PORT || 3006;
// Serves both the forge UI (paste a token, edit its payload, sign a new one)
// and the same keys/public folder that could otherwise be published as a
// static site on its own. Deploying this as a real service (rather than a
// static site) is a deliberate choice - it's what makes /api/forge usable
// remotely, at the cost of the private key living on this instance and the
// signing endpoint being reachable by anyone with the URL.
const UI_DIR = path.join(__dirname, '..', 'src', 'public');
const KEYS_PUBLIC_DIR = path.join(__dirname, '..', 'keys', 'public');

app.use(express.json());
app.use('/api', forgeRoutes);
app.use(express.static(UI_DIR));
app.use(express.static(KEYS_PUBLIC_DIR));

app.listen(port, () => {
  console.log(`Attacker key host listening on port ${port}`);
  console.log(`Forge UI: http://localhost:${port}`);
  console.log(`jku URL to use in a forged token: ${getJkuUrl()}`);
});
