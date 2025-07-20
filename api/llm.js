import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const prompt = req.body.prompt;
  console.log("▶️ Prompt received:", prompt);

  try {
    const startResponse = await fetch('https://api.replicate.com/v1/models/openai/gpt-4o/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: { prompt },
        stream: false
      })
    });

    const prediction = await startResponse.json();
    const getUrl = prediction?.urls?.get;

    let output = null;
    for (let i = 0; i < 20; i++) {
      const pollResponse = await fetch(getUrl, {
        headers: { 'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}` }
      });
      const pollResult = await pollResponse.json();

      if (pollResult.status === 'succeeded') {
        output = pollResult.output;
        break;
      } else if (pollResult.status === 'failed') {
        throw new Error("Prediction failed.");
      }

      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    let reply = Array.isArray(output)
      ? output.join('').replace(/\s+,/g, ',').replace(/,\s+/g, ', ')
      : output;

    res.status(200).json({ output: reply ?? "❌ Timed out or no response." });

  } catch (err) {
    console.error("❌ Error in /api/llm:", err);
    res.status(500).json({ error: "Backend error." });
  }
}
