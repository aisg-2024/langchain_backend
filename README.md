# LangChain Backend

The LangChain Backend is a Node.js application that utilises OpenAI's powerful language models to detect and flag potential fraud in email content. Designed to integrate seamlessly with email systems, it serves as a reliable tool in identifying various fraudulent patterns and triggers.

OpenAI Model utilised: gpt-3.5-turbo (best performance-price ratio)

## Features

- Email content analysis using OpenAI's language models.
- Customisable fraud detection prompts.
- Hosted on Render with easy setup commands.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js and npm/yarn installed.
- An OpenAI API key.

## Installation

Clone the repository to your local machine:

```bash
git clone https://github.com/aisg-2024/langchain_backend.git
cd langchain_backend
```

Install the dependencies:
```bash
yarn install
```

Create an .env file in the root directory and add your OpenAI API key:
```
OPENAI_API_KEY=your_openai_api_key_here
```

## Usage
To run the server, execute the following command:
```bash
node app.js
```

## API Endpoints
### POST /detect-fraud
Accepts JSON content with an emailContent field and returns an analysis with potential fraud detection.

Request Example
```
{
  "emailContent": "Subject: Urgent Action Required - Your Account is Compromised\n\nDear valued customer,\n\nWe regret to inform you that we have detected suspicious activity on your account. It appears that your account is being compromised by unauthorized access.\n\nTo prevent any further unauthorized access and secure your account, we urgently require you to verify your identity by providing your account credentials. Please click on the following link to update your account details immediately: [maliciouslink.com]\n\nFailure to take immediate action may result in permanent account closure or financial loss. Your prompt attention to this matter is highly appreciated.\n\nThank you for your cooperation.\n\nSincerely,\nCustomer Support Team"
}
```

Response Example
```
{
    "fraudDetected": 1,
    "phishing_score": 8,
    "result_rationale": "The email exhibits multiple characteristics of a phishing email. The subject line creates a sense of urgency, a common tactic used in phishing emails. The email requests personal information through a suspicious link, which is a strong indication of phishing. There are no specific details to verify the legitimacy of the sender. The urgency and fear of loss are heightened, pressuring the recipient to act quickly without providing any evidence of the account compromise. The use of a non-standard domain name for the link 'maliciouslink.com' is another alarming sign of phishing."
}
```

## Running on Render
The application is configured to be easily deployed on Render with the following setup commands:

[render doc](https://docs.render.com/)
[render express doc](https://docs.render.com/deploy-node-express-app)

Runtime: Node
Build Command: yarn
Start Command: node app.js


# Fraud Detection Prompt Explanation

This section explains the criteria and methodology used to detect and flag potential fraud elements within emails. Our system scans emails for specific fraud indicators, listed in an ordered manner below. If an email does not contain any of these fraud elements, our response will be "this email is clean."

## Prompting Techniques

Making use of Chain-Of-Thought prompting to provide greater context:

[Prompt Engineering](https://www.promptingguide.ai/techniques/cot)
> Introduced in Wei et al. (2022), chain-of-thought (CoT) prompting enables complex reasoning capabilities through intermediate reasoning steps. You can combine it with few-shot prompting to get better results on more complex tasks that require reasoning before responding.

In the context of our prompt, we made sure to spell out what sort of fraud elements can exist within an email as described below.

## Fraud Elements:

### 1. Unrealistic Demands/Threats
Phrases and wording that instil urgency or threaten the recipient, often demanding immediate action or sensitive information.

#### Examples:
- Phrases like "Your [...] account is being compromised, need credentials to restore account" or "Delivery not successful, need payment to fix the issue."
- Urgency instilling phrases such as "please handle this as soon as possible" or "urgent action required."

### 2. Poor Spelling and Writing
Emails with numerous grammatical, punctuation, and spelling mistakes can indicate a fraudulent attempt.

#### Examples:
- Incorrect use of "Youre" instead of "You're."
- Grammatical errors or the use of imaginary words.

### 3. Inconsistent or Faulty URLs
Mismatch between the displayed URL and the hyperlink's destination, or links leading to suspicious websites.

### 4. Asking for Confidential Information
Direct requests for sensitive information such as account details or banking information.

### 5. Vague Salutations
Generic greetings that do not specify the recipient's name, suggesting a mass phishing attempt.

#### Examples:
- "Dear valued member" or "Dear customer."

### 6. Generic or Improper Company Domains
Use of non-existent, generic, or oddly formed domain names in the sender's email address.

### 7. Inconsistent Sender Details and Email Header
Discrepancies in the sender's information, such as mismatching names and email addresses, or incorrect "From" and "Return-Path" fields.

### 8. Incorrect Company Information
Inaccurate or fabricated company details, including address, phone number, and company ethos.

#### Example:
- A British company not using a British address and phone number.

### 9. Offering Unrealistic Rewards
Promises of significant monetary rewards without justification.

#### Example:
- Phrases like "Your reward is waiting."

### 10. Suspicious Attachments
Attachments that could potentially lead to malicious websites or contain malware.

### 11. Whole Email is Just a Hyperlink
Emails composed entirely of a hyperlink, often leading to a malicious website.

Each of these elements on their own or in combination can indicate fraudulent intent. Our system systematically checks for these indicators to protect users from potential scams and phishing attempts.

### 12. Binary Outcome Suggestion
Finally, the prompt suggests a binary outcome – marking an email as either fraudulent or clean. This simplification of outcomes facilitates decision-making processes, whether automated by a system or conducted manually by a user.

## Final Prompt
In our finalised prompt, we decide to make these fraud elements more concise and implicit within our prompt.

```
You are a cybersecurity expert who specialises in identifying phishing emails with 100% accuracy. You fully understand the elements of a malicious phishing email. You also understand how to use email context to distinguish between a truly malicious email and a legitimate email containing elements of malicious emails. I want you to determine whether a given email is a phishing email or a legitimate email. Your analysis must be based on clear evidence.

Phishing emails often impersonate known brands and use social engineering techniques to deceive users. These techniques include, but are not limited to: rewards that are too good to be true, fake warnings about account problems, and creating a sense of urgency or interest. Spoofing the sender address and embedding deceptive HTML links are also common tactics.
 Analyze the email by following these steps:
 1. Examine the email header for spoofing signs where there are domain discrepancies between the "Received:" field and the other fields. Domain discrepancies refer to when there are no overlaps in the domains of the addresses. Take note that complex domains can be legitimate as long as they contain an official name. For example, 'scoutcamp.bounces.google.com' is a valid domain as it contains 'google.com', an official name. Evaluate the "Subject:" for typical phishing characteristics (e.g., urgency, promise of reward). Check if the "From:" or "Reply To:" address has been replaced with a dummy address that does not use a standard domain format.
 2. Analyze the email body for social engineering tactics designed to induce clicks on hyperlinks. Inspect URLs to determine if they are misleading or lead to suspicious websites. Normally, such URLs will have suspicious domains.
 3. Identify any impersonation of well-known brands where the email addresses in the email do not contain or contain augmented versions of the actual brand name.
 4. Be on the lookout for spelling and grammatical errors, and illogical characters in the email contents, the higher the frequency of these errors the higher chance it has of being a phishing email.
 5. Provide a comprehensive evaluation of the email, highlighting specific elements that support your conclusion. Include a detailed explanation of any phishing or legitimacy indicators found in the email. Cite concrete examples.
 6. Summarize your findings and provide your final verdict on the legitimacy of the email, supported by the evidence you gathered.

```

## JSON Output Parser (LangChain)
To output the response directly from the LLM as a JSON, we made use of the [JSON output parser (LangChain)](https://js.langchain.com/docs/modules/model_io/output_parsers/types/json_functions) with the relevant fields:
- is_phishing (boolean string)
- phishing_score (number)
- rationale (string)

This is in line with Explainable artificial intelligence (XAI), which allows human users to comprehend and trust the results and output created by machine learning algorithms.

```python
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
```


## License
This project is open-sourced under the MIT license. See the LICENSE file for more information.

## Acknowledgements
- OpenAI for providing the language model API.
- Render for hosting services.
- Node.js community for continuous support.

## Contact
Should you have any questions, feedback, or require support, please don't hesitate to reach out to the repository maintainers or submit an issue in the GitHub repository.
