import { sb, cors, requireAdmin, sendTelegram } from './_helpers.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const db = sb();

  if (req.method === 'POST') {
    const { customer_name, phone, city, address, items, total, notes } = req.body;

    const { data, error } = await db
      .from('orders')
      .insert([{ customer_name, phone, city, address, items, total, notes, status: 'pending' }])
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });

    const itemsList = items.map(i => `• ${i.name} × ${i.qty} = ${(i.price * i.qty).toFixed(2)} ₪`).join('\n');
    await sendTelegram(
      `🌸 <b>طلب جديد #${data.id}</b>\n\n` +
      `👤 <b>${customer_name}</b>\n` +
      `📞 ${phone}\n` +
      `📍 ${city} — ${address}\n\n` +
      `📦 المنتجات:\n${itemsList}\n\n` +
      `💰 <b>المجموع: ${total} ₪</b>` +
      (notes ? `\n\n📝 ${notes}` : '')
    );

    return res.status(201).json(data);
  }

  if (!await requireAdmin(req, res, db)) return;

  if (req.method === 'GET') {
    const { status } = req.query;
    let query = db.from('orders').select('*').order('created_at', { ascending: false });
    if (status && status !== 'all') query = query.eq('status', status);
    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'PUT') {
    const { id } = req.query;
    const { status } = req.body;
    const { data, error } = await db.from('orders').update({ status }).eq('id', id).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    const { error } = await db.from('orders').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
