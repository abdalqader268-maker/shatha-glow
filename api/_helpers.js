import { createClient } from '@supabase/supabase-js';

export const sb = () =>
  createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export const cors = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
};

export const requireAdmin = async (req, res, db, soft = false) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) { if (!soft) res.status(401).json({ error: 'غير مصرح' }); return false; }
  const { data } = await db.from('settings').select('value').eq('key', 'admin_token').single();
  if (!data || data.value !== token) { if (!soft) res.status(401).json({ error: 'غير مصرح' }); return false; }
  return true;
};

export const sendTelegram = async (message) => {
  const token   = process.env.TELEGRAM_BOT_TOKEN;
  const chatId  = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' })
    });
  } catch (e) { console.error('Telegram error:', e); }
};
