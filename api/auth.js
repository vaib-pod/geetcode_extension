// api/auth.js
export default async function handler(req, res) {
  // 1. Enable CORS so your Chrome Extension can talk to this server safely
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle Chrome's invisible preflight requests
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'No authorization code provided.' });

  try {
    // 2. Secretly combine the temporary code with your private Client Secret
    const githubRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: code
      })
    });

    const data = await githubRes.json();
    
    if (data.error) {
      return res.status(400).json({ error: data.error_description });
    }

    // 3. Send the permanent access token back to the extension!
    return res.status(200).json({ access_token: data.access_token });
    
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}