import { sb, cors, requireAdmin } from './_helpers.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const db = sb();
  if (!await requireAdmin(req, res, db)) return;

  const { base64, filename, mime } = req.body;
  if (!base64 || !filename) return res.status(400).json({ error: 'Missing file data' });

  const buffer = Buffer.from(base64, 'base64');
  const ext = filename.split('.').pop().toLowerCase();
  const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await db.storage
    .from('products')
    .upload(name, buffer, { contentType: mime || 'image/jpeg', upsert: false });

  if (error) return res.status(500).json({ error: error.message });

  const { data } = db.storage.from('products').getPublicUrl(name);
  return res.status(200).json({ url: data.publicUrl });
}
