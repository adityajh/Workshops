export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    if (!webhookUrl) {
      throw new Error('N8N_WEBHOOK_URL is not configured');
    }

    // Add a server-side IST timestamp and forward everything to n8n
    const payload = {
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      ...req.body,
    };

    const n8nRes = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!n8nRes.ok) {
      const text = await n8nRes.text();
      throw new Error(`n8n responded with ${n8nRes.status}: ${text}`);
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('[submit] Error:', err.message);
    return res.status(500).json({ error: 'Failed to save. Please try again.' });
  }
}
