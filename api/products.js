import { sb, cors, requireAdmin } from './_helpers.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const db = sb();

  if (req.method === 'GET') {
    const { category, available } = req.query;
    let query = db
      .from('products')
      .select('*, categories(name)')
      .order('created_at', { ascending: false });
    if (category)        query = query.eq('category_id', category);
    if (available === 'true') query = query.eq('is_available', true);
    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (!await requireAdmin(req, res, db)) return;

  if (req.method === 'POST') {
    const { name, description, price, image_url, category_id, stock, is_available, badge, discount } = req.body;
    const { data, error } = await db
      .from('products')
      .insert([{ name, description, price, image_url, category_id: category_id || null, stock: stock || 0, is_available: is_available !== false, badge: badge || null, discount: discount || null }])
      .select('*, categories(name)')
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }

  if (req.method === 'PUT') {
    const { id } = req.query;
    const updates = req.body;
    if (updates.category_id === '') updates.category_id = null;
    const { data, error } = await db
      .from('products')
      .update(updates)
      .eq('id', id)
      .select('*, categories(name)')
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    const { error } = await db.from('products').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
