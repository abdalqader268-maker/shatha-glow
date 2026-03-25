import { sb, cors, requireAdmin } from './_helpers.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const db = sb();

  if (req.method === 'GET') {
    const { data, error } = await db.from('categories').select('*').order('name');
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (!await requireAdmin(req, res, db)) return;

  if (req.method === 'POST') {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'الاسم مطلوب' });
    const { data, error } = await db.from('categories').insert([{ name: name.trim() }]).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    const { error } = await db.from('categories').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
