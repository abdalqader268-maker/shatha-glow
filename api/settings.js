import { sb, cors, requireAdmin } from './_helpers.js';
import crypto from 'crypto';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const db = sb();

  const PRIVATE_KEYS = ['admin_token', 'admin_password'];

  if (req.method === 'GET') {
    const isAdmin = await requireAdmin(req, res, db, true);
    const { data, error } = await db.from('settings').select('*');
    if (error) return res.status(500).json({ error: error.message });
    const filtered = isAdmin
      ? data.filter(s => s.key !== 'admin_token')
      : data.filter(s => !PRIVATE_KEYS.includes(s.key));
    return res.status(200).json(filtered);
  }

  if (!await requireAdmin(req, res, db)) return;

  if (req.method === 'PUT') {
    const { key, value } = req.body;
    if (key === 'admin_password') {
      const newToken = crypto.randomBytes(32).toString('hex');
      await db.from('settings').upsert({ key: 'admin_token', value: newToken });
    }
    const { data, error } = await db.from('settings').upsert({ key, value }).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  res.status(405).json({ error: 'Method not allowed' });
}
