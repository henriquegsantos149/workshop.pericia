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
  addField(fieldValues, '866', education || occupation); // [WK][PÓS][ALPA] UTM Possui Graduação
  addField(fieldValues, '867', education_area);          // [WK][PÓS][ALPA] UTM Área de Formação
  addField(fieldValues, '869', utm_source);              // [WK][PÓS][ALPA] UTM Source
  addField(fieldValues, '870', utm_medium);              // [WK][PÓS][ALPA] UTM Medium
  addField(fieldValues, '868', utm_campaign);            // [WK][PÓS][ALPA] UTM Campaign
  addField(fieldValues, '871', utm_content);             // [WK][PÓS][ALPA] UTM Content
  addField(fieldValues, '864', utm_term);                // [WK][PÓS][ALPA] UTM Term
  
  // [WK][PÓS][ALPA] UTM Data de Inscrição (ID: 865)
  const currentDateTime = new Date().toISOString();
  addField(fieldValues, '865', currentDateTime);

  const contactPayload = {
    contact: {
      email,
      firstName: name,
      phone: phone || whatsapp,
      fieldValues
    }
  };

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
