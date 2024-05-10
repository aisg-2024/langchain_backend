const { ChatOpenAI } = require("@langchain/openai");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { JsonOutputFunctionsParser } = require("langchain/output_parsers");
const fraudDetectionPrompt = require('../prompts/fraudDetectionPrompt');
const researchPromptSplitJSON = require('../prompts/researchPromptSplitJSON');

// Instantiate the parser
const parser = new JsonOutputFunctionsParser();

// Define the function schema
const extractionFunctionSchema = {
  name: "extractor",
  description: "Extracts fields from the input.",
  parameters: {
    type: "object",
    properties: {
      is_phishing: {
        type: "string",
        enum: ["true", "false"],
        description: "a boolean value indicating whether the email is phishing (true) or legitimate (false).",
      },
      phishing_score: {
        type: "number",
        description: "phishing risk confidence score as an integer on a scale from 0 to 10,  0 to 5 means legitimate, 6 to 10 means phishing",
      },
      rationale: {
        type: "string",
        description: "detailed rationales for the determination, up to 500 words.",
      },
    },
    required: ["is_phishing", "phishing_score", "rationale"],
  },
};

/**
 * Detects potential fraud in email content using OpenAI's language model.
 *
 * @param {string} emailContent - The content of the email to analyze.
 * @returns {Promise<{fraudDetected: number, phishing_score: number, result_rationale: string}|null>} -
 *   An object containing the detection result, including a flag indicating potential fraud,
 *   phishing score, and result rationale. Returns null in case of error.
 */
async function detectFraudInEmail(emailContent) {

    // Initialize the OpenAI model with the API key
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Ensure your environment variable is configured

    const chatModel = new ChatOpenAI({
      openAIApiKey: OPENAI_API_KEY,
      model: 'gpt-3.5-turbo'
    });
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", researchPromptSplitJSON],
      ["user", emailContent]
    ]);

    const model_params = chatModel.bind({
      functions: [extractionFunctionSchema],
      function_call: { name: "extractor" },
    })

    const runnable = prompt.pipe(model_params).pipe(parser);

    try {
      const result = await runnable.invoke();
      const phishing_score = result.phishing_score;
      const result_rationale = result.rationale;
      const is_phishing = result.is_phishing === "true"; // Convert to boolean
      const fraudDetected = is_phishing ? 1 : 0;
      return {fraudDetected, phishing_score, result_rationale};
    } catch (error) {
      console.error("Error processing email:", error);
      return null;
    }
}

module.exports = { detectFraudInEmail };
