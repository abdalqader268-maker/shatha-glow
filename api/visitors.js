import { sb, cors, requireAdmin } from './_helpers.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const db = sb();

  // POST — تسجيل زيارة جديدة
  if (req.method === 'POST') {
    const { data } = await db.from('settings').select('value').eq('key', 'visitor_count').single();
    const current = parseInt(data?.value || '0', 10);
    await db.from('settings').upsert({ key: 'visitor_count', value: String(current + 1) });
    return res.status(200).json({ ok: true });
  }

  // GET — إرجاع العدد (للأدمن فقط)
  if (req.method === 'GET') {
    if (!await requireAdmin(req, res, db)) return;
    const { data } = await db.from('settings').select('value').eq('key', 'visitor_count').single();
    return res.status(200).json({ count: parseInt(data?.value || '0', 10) });
  }

  res.status(405).end();
}
