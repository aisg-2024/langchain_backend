const { ChatOpenAI } = require("@langchain/openai");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const fraudDetectionPrompt = require('../prompts/fraudDetectionPrompt');

/**
 * Detects fraud in email content using OpenAI's language model.
 * @param {string} emailContent - The content of the email to analyze.
 * @returns {Promise<{response: string, fraudDetected: number}>} - An object containing the model's response and a flag indicating potential fraud.
 */
async function detectFraudInEmail(emailContent) {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Ensure your environment variable is configured

    // Initialize the OpenAI model with the API key
    const chatModel = new ChatOpenAI({
        openAIApiKey: OPENAI_API_KEY,
        model: 'gpt-3.5-turbo'
    });

    // Prepare the prompt with the system and user messages
    const prompt = ChatPromptTemplate.fromMessages([
        ["system", fraudDetectionPrompt],
        ["user", emailContent],
    ]);

    // Initialize the output parser
    const outputParser = new StringOutputParser();

    // Create a processing chain from prompt to model invocation to parsing
    const llmChain = prompt.pipe(chatModel).pipe(outputParser);

    try {
        // Invoke the chain to get the response from the language model
        const response = await llmChain.invoke();
        console.log("Response from language model:", response);

        // Determine if the response suggests fraud
        let fraudDetected = response.toLowerCase().includes("fraud") ? 1 : 0;

        return { response, fraudDetected };
    } catch (error) {
        console.error("Error in detecting fraud:", error);
        throw error; // Rethrow the error to be handled by the caller
    }
}

module.exports = { detectFraudInEmail };
