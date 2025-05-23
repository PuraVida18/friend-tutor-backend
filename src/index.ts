import { config } from 'dotenv';
import express from 'express';
import { GoogleGenAI } from '@google/genai';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

config();

interface ChatHistory {
  id: string;
  messages: {
    from: 'user' | 'ai';
    content: string;
  }[];
}
[];

const app = express();
const port = 3000;
const histories: ChatHistory[] = [];

app.use(cors()); // 2. Use the cors middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/ask', async (req, res) => {
  if (!req.body?.question || typeof req.body?.question !== 'string') {
    res.status(400).send();
    return;
  }
  if (!req.body.chatId) {
    req.body.chatId = uuidv4();
    histories.push({
      id: req.body.chatId,
      messages: [],
    });
  }

  const chat = histories.find(chat => chat.id === req.body?.chatId);
  if (!chat) {
    res.send(404);
    return;
  }
  chat.messages.push({ content: req.body.question, from: 'user' });

  const q = req.body?.question;
  const response = await askQuestion(q);
  chat!.messages.push({ content: req.body.question, from: 'ai' });
  res.json({ response, chatId: req.body.chatId });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function askQuestion(question: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: question,
  });
  console.log(response.text);
  return response.text;
}
