export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server is missing the API key configuration.' });
  }

  try {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || 'Gemini API Request Failed');
    }
    
    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return res.status(200).json({ text: data.candidates[0].content.parts[0].text });
    }
    
    throw new Error('Unexpected API response format');
  } catch (error) {
    console.error('Serverless Function Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
