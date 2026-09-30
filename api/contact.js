const inbox = 'achillespasuncion@gmail.com';

function json(body, status = 200) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

export default {
  async fetch(request) {
    if (request.method === 'GET') return json({ enabled: Boolean(process.env.RESEND_API_KEY) });
    if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

    const origin = request.headers.get('origin');
    if (origin && new URL(origin).host !== new URL(request.url).host) {
      return json({ error: 'Invalid origin' }, 403);
    }

    const key = process.env.RESEND_API_KEY;
    if (!key) return json({ error: 'Contact form unavailable' }, 503);

    let body;
    try {
      const raw = await request.text();
      if (raw.length > 8000) return json({ error: 'Message too long' }, 413);
      body = JSON.parse(raw);
    } catch {
      return json({ error: 'Invalid request' }, 400);
    }

    if (body._honey) return json({ ok: true });
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    if (!name || name.length > 100 || !/^\S+@\S+\.\S+$/.test(email) || email.length > 254 || message.length < 10 || message.length > 3000) {
      return json({ error: 'Please check the form fields' }, 400);
    }

    try {
      const delivery = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Achilles Portfolio <onboarding@resend.dev>',
          to: [inbox],
          reply_to: email,
          subject: 'New portfolio message',
          text: `From: ${name}\nEmail: ${email}\n\n${message}`,
        }),
        signal: AbortSignal.timeout(10000),
      });
      if (!delivery.ok) return json({ error: 'Delivery failed' }, 502);
      return json({ ok: true });
    } catch {
      return json({ error: 'Delivery failed' }, 502);
    }
  },
};
