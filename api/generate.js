// api/generate.js — Vercel Serverless Function (with detailed error reporting)
// Your ANTHROPIC_API_KEY stays safely here on the server.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt } = req.body || {};

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Prompt is required" });
  }

  if (prompt.length > 6000) {
    return res.status(400).json({ error: "Prompt too long" });
  }

  // Clear message if the key is missing entirely
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({
      error: "NO KEY: ANTHROPIC_API_KEY is not set in Vercel. Go to Settings → Environment Variables, add it, then Redeploy.",
    });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1500,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();

    // If Anthropic rejects the request, send the REAL reason back to the screen
    if (!response.ok) {
      const reason =
        (data && data.error && data.error.message) ||
        JSON.stringify(data).slice(0, 300);
      return res.status(response.status).json({
        error: `ANTHROPIC ERROR (${response.status}): ${reason}`,
      });
    }

    const text = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    return res.status(200).json({ text });
  } catch (err) {
    return res.status(500).json({ error: "SERVER ERROR: " + (err.message || String(err)) });
  }
}