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
  "response": "Detailed response from OpenAI model...",
  "fraudDetected": 1
}
```

## Running on Render
The application is configured to be easily deployed on Render with the following setup commands:

[render doc](https://docs.render.com/)
[render express doc](https://docs.render.com/deploy-node-express-app)

Runtime: Node
Build Command: yarn
Start Command: node app.js

## Testing
A simple endpoint to ensure the server is running can be accessed via:

```
GET /
```
Which will return a 'Hello, World!' message.

<br>

# Fraud Detection Prompt Explanation

This section explains the criteria and methodology used to detect and flag potential fraud elements within emails. Our system scans emails for specific fraud indicators, listed in an ordered manner below. If an email does not contain any of these fraud elements, our response will be "this email is clean."

## Prompting Techniques

Making use of few-shot prompting to provide greater context:

[Prompt Engineering](https://www.promptingguide.ai/techniques/fewshot)
> While large-language models demonstrate remarkable zero-shot capabilities, they still fall short on more complex tasks when using the zero-shot setting. Few-shot prompting can be used as a technique to enable in-context learning where we provide demonstrations in the prompt to steer the model to better performance. The demonstrations serve as conditioning for subsequent examples where we would like the model to generate a response. According to Touvron et al. 2023 few shot properties first appeared when models were scaled to a sufficient size (Kaplan et al., 2020).

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

## License
This project is open-sourced under the MIT license. See the LICENSE file for more information.

## Acknowledgements
- OpenAI for providing the language model API.
- Render for hosting services.
- Node.js community for continuous support.

## Contact
Should you have any questions, feedback, or require support, please don't hesitate to reach out to the repository maintainers or submit an issue in the GitHub repository.
