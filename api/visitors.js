import { sb, cors, requireAdmin } from './_helpers.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const db = sb();

  // POST — تسجيل زيارة (newVisitor: true إذا كان شخص جديد)
  if (req.method === 'POST') {
    const { newVisitor } = req.body || {};

    const keys = ['visit_count'];
    if (newVisitor) keys.push('visitor_count');

    const { data: rows } = await db.from('settings').select('key,value').in('key', keys);
    const map = {};
    (rows || []).forEach(r => map[r.key] = parseInt(r.value || '0', 10));

    const upserts = [
      { key: 'visit_count',   value: String((map['visit_count']   || 0) + 1) },
    ];
    if (newVisitor) {
      upserts.push({ key: 'visitor_count', value: String((map['visitor_count'] || 0) + 1) });
    }

    await db.from('settings').upsert(upserts);
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
