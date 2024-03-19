// Import required modules and libraries
const express = require('express');
const bodyParser = require('body-parser');
const cors = require("cors");
const { detectFraudInEmail } = require('./utils/detectFraud');
require('dotenv').config()

// Initialize Express application
const app = express();
const PORT = 3000; // Port number for the server to listen on

// Middleware setup
app.use(cors({ origin: true })); // Enable all CORS requests
app.use(bodyParser.json()); // Use bodyParser to parse JSON request bodies

// Endpoint to detect fraud
app.post('/detect-fraud', async (req, res, next) => {
  try {
    const { emailContent } = req.body;
    const result = await detectFraudInEmail(emailContent);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// Testing endpoint to ensure the server is running
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
