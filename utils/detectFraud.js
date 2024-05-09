const { ChatOpenAI } = require("@langchain/openai");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { StringOutputParser } = require("@langchain/core/output_parsers");
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
      brand_impersonation: {
        type: "string",
        description: "brand name associated with the email, if applicable.",
      },
      rationale: {
        type: "string",
        description: "detailed rationales for the determination, up to 500 words.",
      },
      brief_rationale: {
        type: "string",
        description: "brief reason for the determination.",
      }
    },
    required: ["is_phishing", "phishing_score", "brand_impersonation", "rationale", "brief_rationale"],
  },
};

/**
 * Detects fraud in email content using OpenAI's language model.
 * @param {string} emailContent - The content of the email to analyze.
 * @returns {Promise<{response: string, fraudDetected: number}>} - An object containing the model's response and a flag indicating potential fraud.
 */
async function detectFraudInEmail(emailContent) {

    // // Prepare the prompt with the system and user messages
    // const prompt = ChatPromptTemplate.fromMessages([
    //     ["system", fraudDetectionPrompt],
    //     ["user", emailContent],
    // ]);

    // // Initialize the output parser
    // const outputParser = new StringOutputParser();

    // // Create a processing chain from prompt to model invocation to parsing
    // const llmChain = prompt.pipe(chatModel).pipe(outputParser);

    // try {
    //     // Invoke the chain to get the response from the language model
    //     const response = await llmChain.invoke();
    //     console.log("Response from language model:", response);

    //     // Determine if the response suggests fraud
    //     let fraudDetected = response.toLowerCase().includes("fraud") ? 1 : 0;

    //     return { response, fraudDetected };
    // } catch (error) {
    //     console.error("Error in detecting fraud:", error);
    //     throw error; // Rethrow the error to be handled by the caller
    // }

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
    // const llmChain = prompt.pipe(chatModel).pipe(outputParser);

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
