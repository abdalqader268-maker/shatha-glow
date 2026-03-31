import { sb, cors, requireAdmin } from './_helpers.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const db = sb();

  // POST — تسجيل زيارة
  if (req.method === 'POST') {
    const { newVisitor } = req.body || {};

    // زيادة الزيارات atomically
    await db.rpc('increment_setting', { setting_key: 'visit_count' });

    // زيادة الزوار الفريدين إذا كان شخص جديد
    if (newVisitor) {
      await db.rpc('increment_setting', { setting_key: 'visitor_count' });
    }

    return res.status(200).json({ ok: true });
  }

  // GET — إرجاع العددين (للأدمن فقط)
  if (req.method === 'GET') {
    if (!await requireAdmin(req, res, db)) return;
    const { data: rows } = await db.from('settings').select('key,value').in('key', ['visit_count', 'visitor_count']);
    const map = {};
    (rows || []).forEach(r => map[r.key] = parseInt(r.value || '0', 10));
    return res.status(200).json({
      visits:   map['visit_count']   || 0,
      visitors: map['visitor_count'] || 0,
    });
  }

  res.status(405).end();
}
