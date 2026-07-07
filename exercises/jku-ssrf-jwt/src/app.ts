import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import apiRoutes from './routes/api';
import { getOwnJwks } from './utils/jwt';

const app = express();
const port = process.env.PORT || 3005;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); 

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// The server's own, legitimate JWK Set. A well-behaved token points its jku
// header here. Nothing stops a token from pointing somewhere else instead.
app.get('/.well-known/jwks.json', (req, res) => {
  res.json(getOwnJwks());
});

// API routes
app.use('/api', apiRoutes);

// Public routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
