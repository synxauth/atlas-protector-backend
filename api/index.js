import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const buildId = req.query.build_id;
  let payload;

  if (req.method === 'POST') {
    try {
      payload = req.body.payload;
    } catch {
      return res.status(400).json({ error: 'Invalid JSON payload' });
    }
  }

  if (!buildId || !/^[a-zA-Z0-9]+$/.test(buildId)) {
    return res.status(400).json({ error: 'Invalid or missing build_id' });
  }

  // Warning: Vercel functions have ephemeral storage
  const filePath = path.join('/tmp', `${buildId}.txt`);

  try {
    if (payload !== undefined) {
      // Save payload temporarily
      fs.writeFileSync(filePath, payload);
      return res.status(200).json({ success: 'Payload saved (temporary storage)' });
    } else {
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'No payload found' });
      }
      const data = fs.readFileSync(filePath, 'utf-8');
      return res.status(200).send(data);
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
