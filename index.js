const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const fs = require('fs');
const { ChatOpenAI } = require("@langchain/openai");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { StringOutputParser } = require("@langchain/core/output_parsers");

const fraudDetectionPrompt = require('./fraudDetectionPrompt');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

// Endpoint to handle fraud detection
app.post('/detect-fraud', async (req, res) => {
  const { emailContent } = req.body;
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  const chatModel = new ChatOpenAI({
    openAIApiKey: OPENAI_API_KEY,
  });

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", "You are a world class technical documentation writer." + fraudDetectionPrompt],
    ["user", emailContent],
  ]);

  const outputParser = new StringOutputParser();

  const llmChain = prompt.pipe(chatModel).pipe(outputParser);

  try {
    const response = await llmChain.invoke();
    console.log("Response from language model:", response);

    let fraudDetected = 0; // Initialize variable to store fraud detection result

    // Review response, set fraudDetected to 1 if keyword "fraud" is found
    if (response.toLowerCase().includes("fraud")) {
        console.log("Potential fraud detected.");
        fraudDetected = 1;
    } else {
        console.log("No fraud detected.");
        fraudDetected = 0;
    }

    res.json({ fraudDetected });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Testing
app.get('/', (req, res) => {
  res.send('Hello, World!');
});
