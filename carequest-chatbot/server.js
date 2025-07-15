import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/llm', async (req, res) => {
  const prompt = req.body.prompt;
  console.log("▶️ Prompt received:", prompt);

  try {
    // Step 1: Initiate prediction
    const startResponse = await fetch('https://api.replicate.com/v1/models/meta/meta-llama-3.1-405b-instruct/predictions', {
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

    // Step 2: Poll for result
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

      await new Promise(resolve => setTimeout(resolve, 1500)); // wait 1.5s
    }

    let reply = Array.isArray(output) ? output.join('').replace(/\s+,/g, ',').replace(/,\s+/g, ', ') : output;
    res.json({ output: reply ?? "❌ Timed out or no response." });


  } catch (err) {
    console.error("❌ Error in /api/llm:", err);
    res.status(500).json({ error: "Backend error." });
  }
});

app.listen(3000, () => {
  console.log('✅ Server running on http://localhost:3000');
});
