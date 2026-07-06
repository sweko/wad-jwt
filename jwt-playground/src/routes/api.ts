import express from 'express';
import { Algorithm, decodeToken, generateToken, getServerInfo, verifyToken } from '../lib/jwt';
import { defaultPayload, sensitivePayload } from '../lib/data';

const router = express.Router();

router.get('/payloads', (req, res) => {
  res.json({
    default: defaultPayload(),
    sensitive: sensitivePayload(),
  });
});

router.get('/server-info', (req, res) => {
  res.json(getServerInfo());
});

router.post('/generate', (req, res) => {
  const { payload, algorithm } = req.body as { payload: unknown; algorithm: Algorithm };

  if (!payload || typeof payload !== 'object') {
    return res.status(400).json({ error: 'payload must be a JSON object' });
  }
  if (!['none', 'HS256', 'RS256'].includes(algorithm)) {
    return res.status(400).json({ error: 'algorithm must be one of none, HS256, RS256' });
  }

  const token = generateToken(payload, algorithm);
  res.json({ token });
});

router.post('/inspect', (req, res) => {
  const { token } = req.body as { token: string };

  if (!token || typeof token !== 'string') {
    return res.status(400).json({ error: 'token must be a string' });
  }

  let decoded = null;
  let decodeError: string | null = null;
  try {
    decoded = decodeToken(token);
  } catch (error) {
    decodeError = error instanceof Error ? error.message : 'Failed to decode token';
  }

  let verification = null;
  try {
    verification = verifyToken(token);
  } catch {
    verification = { none: 'n/a' as const, hs256: false, rs256: false };
  }

  res.json({ decoded, decodeError, verification });
});

export default router;
