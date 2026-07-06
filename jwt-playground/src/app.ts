import express from 'express';
import path from 'path';
import apiRoutes from './routes/api';

const app = express();
const port = process.env.PORT || 3000;

// Static assets aren't compiled by tsc, so serve them straight from src/public -
// this resolves correctly whether __dirname is src/ (ts-node) or dist/ (compiled build),
// since both sit one level below the project root.
const publicDir = path.join(__dirname, '..', 'src', 'public');

app.use(express.json());

app.use(express.static(publicDir));

app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.listen(port, () => {
  console.log(`JWT Playground running on port ${port}`);
});
