import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const {
    name,
    email,
    phone,
    whatsapp,
    education,
    occupation,
    education_area,
    eventId,
    fbp,
    fbc,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
    utm_term
  } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const API_KEY = process.env.ACTIVE_API_KEY;
  const API_URL = 'https://ambientalpro.api-us1.com/api/3';
  const META_CAPI_ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN;
  const META_PIXEL_ID = process.env.META_PIXEL_ID || '1373287802810243';

  if (!API_KEY) {
    console.error("ACTIVE_API_KEY is not defined in environment variables");
    return res.status(500).json({ message: 'Server configuration error' });
  }

  // Helper to add field values conditionally
  const addField = (fieldsArray, fieldId, value) => {
    if (value) {
      fieldsArray.push({ field: fieldId, value: value });
    }
  };

  const fieldValues = [];
  const source = utm_source || req.body.WKPSALPA_UTM_SOURCE || req.body.wkpsalpa_utm_source;
  const medium = utm_medium || req.body.WKPSALPA_UTM_MEDIUM || req.body.wkpsalpa_utm_medium;
  const campaign = utm_campaign || req.body.WKPSALPA_UTM_CAMPAIGN || req.body.wkpsalpa_utm_campaign;
  const content = utm_content || req.body.WKPSALPA_UTM_CONTENT || req.body.wkpsalpa_utm_content;
  const term = utm_term || req.body.WKPSALPA_UTM_TERM || req.body.wkpsalpa_utm_term;

  addField(fieldValues, '866', education || occupation); // [WK][PÓS][ALPA] UTM Possui Graduação
  addField(fieldValues, '867', education_area);          // [WK][PÓS][ALPA] UTM Área de Formação
  addField(fieldValues, '869', source);                  // [WK][PÓS][ALPA] UTM Source
  addField(fieldValues, '870', medium);                  // [WK][PÓS][ALPA] UTM Medium
  addField(fieldValues, '868', campaign);                // [WK][PÓS][ALPA] UTM Campaign
  addField(fieldValues, '871', content);                 // [WK][PÓS][ALPA] UTM Content
  addField(fieldValues, '864', term);                    // [WK][PÓS][ALPA] UTM Term
  
  // [WK][PÓS][ALPA] UTM Data de Inscrição (ID: 865)
  const currentDateTime = new Date().toISOString();
  addField(fieldValues, '865', currentDateTime);

  // Separate firstName and lastName to cleanly overwrite any legacy data in ActiveCampaign
  const nameParts = (name || '').trim().split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ');

  const rawPhone = (phone || whatsapp || '').toString();
  let cleanPhone = rawPhone.replace(/\D/g, '');
  if (cleanPhone.startsWith('55') && cleanPhone.length > 11) {
    cleanPhone = cleanPhone.substring(2);
  }

  const contactPayload = {
    contact: {
      email,
      firstName,
      lastName,
      phone: cleanPhone,
      fieldValues
    }
  };

  // META CONVERSIONS API LOGIC
  const hashData = (data) => {
    if (!data) return undefined;
    return crypto.createHash('sha256').update(data.trim().toLowerCase()).digest('hex');
  };

  const clientIp = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0];
  const clientUserAgent = req.headers['user-agent'] || '';

  const phoneForMeta = cleanPhone.length <= 11 ? '55' + cleanPhone : cleanPhone;
  const phoneHashes = [hashData(phoneForMeta), hashData(cleanPhone)].filter(Boolean);

  const metaEvents = [
    {
      event_name: 'Lead',
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      action_source: 'website',
      event_source_url: 'https://curso.ambientalpro.com.br/pericia-ambiental',
      user_data: {
        em: [hashData(email)],
        ph: phoneHashes,
        client_ip_address: clientIp,
        client_user_agent: clientUserAgent,
        fbp: fbp,
        fbc: fbc
      }
    }
  ];

  if (education === 'sim' || occupation === 'sim') {
    metaEvents.push({
      event_name: 'lead_qualificado',
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId ? eventId + '_q' : undefined,
      action_source: 'website',
      event_source_url: 'https://curso.ambientalpro.com.br/pericia-ambiental',
      user_data: {
        em: [hashData(email)],
        ph: phoneHashes,
        client_ip_address: clientIp,
        client_user_agent: clientUserAgent,
        fbp: fbp,
        fbc: fbc
      }
    });
  }

  // Fire Meta CAPI async (don't block AC)
  if (META_CAPI_ACCESS_TOKEN) {
    fetch(`https://graph.facebook.com/v19.0/${META_PIXEL_ID}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: metaEvents,
        access_token: META_CAPI_ACCESS_TOKEN
      })
    }).then(res => res.json()).then(data => {
      if (data.error) console.error("Meta CAPI Error Response:", data.error);
    }).catch(e => console.error("Meta CAPI Fetch Error:", e));
  } else {
    console.warn("META_CAPI_ACCESS_TOKEN not set. Meta CAPI events not sent.");
  }

  try {
    // 1. Create or sync the contact
    const contactResponse = await fetch(`${API_URL}/contact/sync`, {
      method: 'POST',
      headers: {
        'Api-Token': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(contactPayload)
    });

    if (!contactResponse.ok) {
      const errorText = await contactResponse.text();
      console.error('ActiveCampaign Sync Error:', errorText);
      return res.status(contactResponse.status).json({ message: 'Failed to sync contact', details: errorText });
    }

    const contactData = await contactResponse.json();
    const contactId = contactData.contact.id;

    // 2. Add the [WK][PÓS][ALPA] Lead tag (ID: 475)
    const tagPayload = {
      contactTag: {
        contact: contactId,
        tag: '475'
      }
    };

    const tagResponse = await fetch(`${API_URL}/contactTags`, {
      method: 'POST',
      headers: {
        'Api-Token': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(tagPayload)
    });

    if (!tagResponse.ok) {
      const errorText = await tagResponse.text();
      console.error('ActiveCampaign Tag Error:', errorText);
    }

    return res.status(200).json({ success: true, message: 'Contact processed successfully' });

  } catch (error) {
    console.error('ActiveCampaign Integration Error:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
