const express = require("express");
const bodyParser = require("body-parser");
const { askGPT } = require("./gpt").default;

const app = express();
const port = 3000;

app.use(bodyParser.json());

const sessions = {}; // basic in-memory history store

app.post("/ask", async (req, res) => {
  const { sessionId, question } = req.body;
  if (!sessionId || !question) return res.status(400).send("Missing data");

  if (!sessions[sessionId]) sessions[sessionId] = [];

  try {
    const answer = await askGPT(sessions[sessionId], question);
    res.json({ answer });
  } catch (err) {
    console.error(err);
    res.status(500).send("GPT error");
  }
});


app.listen(port, () => {
  console.log(`MathGPT server running at http://localhost:${port}`);
});
