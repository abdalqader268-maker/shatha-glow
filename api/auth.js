import { sb, cors } from './_helpers.js';
import crypto from 'crypto';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const db = sb();
  const { password } = req.body;

  const { data } = await db.from('settings').select('value').eq('key', 'admin_password').single();
  if (!data || data.value !== password)
    return res.status(401).json({ error: 'كلمة المرور غلط' });

  const token = crypto.randomBytes(32).toString('hex');
  await db.from('settings').upsert({ key: 'admin_token', value: token });
  return res.status(200).json({ token });
}
