const MAX_BODY_LENGTH = 56000;
const limits = {
  name: 120,
  email: 254,
  service: 120,
  language: 80,
  date: 10,
  location: 200,
  message: 4000,
};

function reply(status, result) {
  return Response.json(result, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
}

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get('Origin');
  if (origin && origin !== new URL(request.url).origin) {
    return reply(403, { ok: false });
  }

  const contentType = request.headers.get('Content-Type') || '';
  if (!contentType.startsWith('application/x-www-form-urlencoded')) {
    return reply(415, { ok: false });
  }
  if (Number(request.headers.get('Content-Length')) > MAX_BODY_LENGTH) {
    return reply(413, { ok: false });
  }

  const body = await request.text();
  if (body.length > MAX_BODY_LENGTH) return reply(413, { ok: false });
  const form = new URLSearchParams(body);
  if (form.get('website')) return reply(400, { ok: false });

  const values = {};
  for (const [field, limit] of Object.entries(limits)) {
    const value = (form.get(field) || '').trim();
    if (value.length > limit) return reply(400, { ok: false });
    values[field] = value;
  }

  const { name, email, service, language, date, location, message } = values;
  if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return reply(400, { ok: false });
  }
  if (!env.RESEND_API_KEY || !env.ENQUIRY_FROM) {
    return reply(503, { ok: false });
  }

  const text = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Service: ${service}`,
    `Event language: ${language}`,
    `Event date: ${date || 'To be discussed'}`,
    `Location: ${location || 'To be discussed'}`,
    '',
    message,
  ].join('\n');

  try {
    const delivery = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.ENQUIRY_FROM,
        to: ['matt@mattbeadle.com'],
        reply_to: email,
        subject: 'New website enquiry',
        text,
      }),
    });
    if (delivery.ok) return reply(200, { ok: true });
  } catch {
    return reply(502, { ok: false });
  }
  return reply(502, { ok: false });
}
