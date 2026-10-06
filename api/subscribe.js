const FIELD_IDS = {
  utm_content: '918', utm_term: '919', education: '921',
  education_area: '922', utm_campaign: '923', utm_source: '924', utm_medium: '925'
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });
  const body = req.body || {};
  if (typeof body.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return res.status(400).json({ message: 'Invalid email' });
  }
  const key = process.env.ACTIVE_API_KEY;
  if (!key) return res.status(500).json({ message: 'Server configuration error' });
  const base = (process.env.ACTIVE_URL || 'https://ambientalpro.api-us1.com').replace(/\/+$/, '').replace(/\/api\/3$/, '') + '/api/3';
  const fieldValues = Object.entries(FIELD_IDS)
    .filter(([name]) => typeof body[name] === 'string' && body[name].trim())
    .map(([name, field]) => ({ field, value: body[name].trim() }));
  const dateParts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
  }).formatToParts(new Date()).map(({ type, value }) => [type, value]));
  const registrationDate = `${dateParts.year}-${dateParts.month}-${dateParts.day} ${dateParts.hour}:${dateParts.minute}:${dateParts.second}`;
  fieldValues.push({ field: '920', value: registrationDate });
  const [firstName = '', ...lastNames] = String(body.name || '').trim().split(/\s+/);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  const post = async (path, payload) => {
    const response = await fetch(base + path, {
      method: 'POST', headers: { 'Api-Token': key, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload), signal: controller.signal
    });
    if (!response.ok) throw new Error('ActiveCampaign request failed: ' + response.status);
    return response.json();
  };
  try {
    const result = await post('/contact/sync', { contact: {
      email: body.email.trim(), firstName, lastName: lastNames.join(' '),
      phone: String(body.phone || '').replace(/\D/g, ''), fieldValues
    } });
    await post('/contactTags', { contactTag: { contact: result.contact.id, tag: '489' } });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('ActiveCampaign enrollment failed:', error.message);
    return res.status(502).json({ message: 'Unable to process enrollment' });
  } finally {
    clearTimeout(timeout);
  }
}
