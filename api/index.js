export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const body = await readBody(req);
      const { build_id, payload } = JSON.parse(body);

      if (!build_id || typeof build_id !== 'string') {
        return res.status(400).json({ error: 'Invalid or missing build_id' });
      }

      if (!payload) {
        return res.status(400).json({ error: 'Missing payload' });
      }

      // TEMP STORAGE (not persistent!)
      globalThis._payloads = globalThis._payloads || {};
      globalThis._payloads[build_id] = payload;

      return res.status(200).json({ success: 'Payload saved (temporary storage)' });

    } catch (err) {
      return res.status(400).json({ error: 'Invalid JSON payload' });
    }
  }

  if (req.method === 'GET') {
    const build_id = req.query.build_id;
    if (!build_id) {
      return res.status(400).json({ error: 'Missing build_id' });
    }

    const payload = globalThis._payloads?.[build_id];
    if (!payload) {
      return res.status(404).json({ error: 'No payload found' });
    }

    return res.status(200).json({ payload });
  }

  res.status(405).json({ error: 'Method not allowed' });
}

// Read raw body (works on Vercel without bodyParser)
function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => data += chunk);
    req.on('end', () => resolve(data));
    req.on('error', err => reject(err));
  });
}
