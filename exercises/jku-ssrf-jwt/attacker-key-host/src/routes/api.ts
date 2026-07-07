import express from 'express';
import { forgeToken, getJkuUrl } from '../sign';

const router = express.Router();

router.post('/forge', (req, res) => {
  const { payload } = req.body as { payload: unknown };

  if (!payload || typeof payload !== 'object') {
    return res.status(400).json({ error: 'payload must be a JSON object' });
  }

  try {
    const result = forgeToken(payload, getJkuUrl());
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to forge token' });
  }
});

export default router;
