/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const fs = require('fs');
const { ChatOpenAI } = require("@langchain/openai");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const fraudDetectionPrompt = require('./fraudDetectionPrompt');
const functions = require("firebase-functions")

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

// Endpoint to handle fraud detection
app.post('/detect-fraud', async (req, res) => {
  const { emailContent } = req.body;
  const OPENAI_API_KEY = functions.config().openai.api_key;

  const chatModel = new ChatOpenAI({
    openAIApiKey: OPENAI_API_KEY,
  });

  // Update the prompt creation in the '/detect-fraud' endpoint
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

    res.json({ response: response, fraudDetected });

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

exports.api = functions.https.onRequest(app)
