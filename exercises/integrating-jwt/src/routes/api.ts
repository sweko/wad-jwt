import express from 'express';
import { generateJwt, verifyJwt } from '../utils/jwt';
import { Login, User } from '../utils/user';
import { authenticate, users } from '../utils/db';
import { omit } from '../utils/utils';

const router = express.Router();

router.get('/hello', (req, res) => {
  res.json({ message: 'Hello from the API!' });
});

router.get('/me', (req, res) => {
  if (!req.cookies.jwt) {
    console.error('No user cookie found');
    return res.status(401).json({ error: 'Unauthorized' });
  }
  console.log(`Found user cookie (it should be a JWT): ${req.cookies.jwt}`);
  const verification = verifyJwt<User>(req.cookies.jwt);
  if (verification.status === 'failed') {
    return res.status(403).json({ error: 'Verification failed' });
  }

  res.send(verification.payload);
});

router.get('/secret', (req, res) => {
  if (!req.cookies.jwt) {
    console.error('No user cookie found');
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const verification = verifyJwt<User>(req.cookies.jwt);
  if (verification.status === 'failed') {
    return res.status(403).json({ error: 'Verification failed' });
  }

  const userData = users.find((user) => user.id === verification.payload.id);

  res.send( { secret: userData?.secret });
});

router.post('/login', async (req, res) => {
  const payload = req.body as Login;
  try {
    // locate user in "db"
    const user = authenticate(payload);
    if (!user) {
      return res.status(403).json({ error: 'No such user' });
    }

    const token = await generateJwt(omit(user, "secret"));
    res.header('Set-Cookie', `jwt=${token}; HttpOnly`);
    res.sendStatus(204);
  } catch (error) {
    res.status(400).json({ error: 'Failed to generate JWT' });
  }
});

export default router;