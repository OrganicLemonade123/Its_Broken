import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';

const app = express();
app.use(cors());
app.use(express.json());

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [{ role: 'user', content: message }]
  });

  res.json({ reply: response.content[0].text });
});

app.listen(3001, () => console.log('Proxy running on port 3001'));