export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error('No API key found');
      return res.status(200).json({ content: [{ type: 'text', text: 'Server error: API key not configured.' }] });
    }
    console.log('Calling Anthropic with key prefix:', apiKey.slice(0, 12));
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    console.log('Anthropic status:', response.status, 'content blocks:', data.content?.length, 'error:', data.error?.message);
    if (data.error) {
      return res.status(200).json({ content: [{ type: 'text', text: `API Error: ${data.error.message}` }] });
    }
    res.status(200).json(data);
  } catch (e) {
    console.error('Handler error:', e.message);
    res.status(200).json({ content: [{ type: 'text', text: `Server Error: ${e.message}` }] });
  }
}
