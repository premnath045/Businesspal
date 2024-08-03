import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";

// Initialize the Gemini model
const model = new ChatGoogleGenerativeAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || "",
  modelName: "gemini-1.5-flash",
  temperature: 0.7,
});

// Create a prompt template
const promptTemplate = new PromptTemplate({
  template: `Generate 10 short, interesting facts or insights about {businessName}, a company in the {businessDomain} sector located in {businessLocation}. Use this description as context: "{businessDescription}"

  Your response should be a JSON array of strings, each containing a short, one-line fact or insight. Do not include any additional formatting or explanation.

  Example format:
  [
    "Fact 1 line 1\\nFact 1 line 2",
    "Fact 2 line 1\\nFact 2 line 2",
    ...
  ]`,
  inputVariables: ["businessName", "businessDomain", "businessLocation", "businessDescription"],
});

// Create a JSON output parser
const outputParser = new JsonOutputParser();

// Create the RunnableSequence
const generateLoaderInfoSequence = RunnableSequence.from([
  {
    formattedPrompt: async (input: any) => promptTemplate.format(input),
  },
  {
    llmResponse: async (input: any) => model.invoke(input.formattedPrompt),
  },
  {
    parsedOutput: async (input: any) => {
      let responseText = input.llmResponse.content;
      // Remove any markdown formatting if present
      responseText = responseText.replace(/```json\s?/, '').replace(/```\s?$/, '');
      return outputParser.parse(responseText);
    },
  },
  async (input: any) => {
    const facts = input.parsedOutput;
    // Validate that we have an array of strings
    if (!Array.isArray(facts) || facts.length === 0 || typeof facts[0] !== 'string') {
      throw new Error("Generated content does not match the required format");
    }
    return facts;
  },
]);

export const generateLoaderInfo = async (
  businessName: string,
  businessDomain: string,
  businessLocation: string,
  businessDescription: string
) => {
  try {
    const facts = await generateLoaderInfoSequence.invoke({
      businessName,
      businessDomain,
      businessLocation,
      businessDescription,
    });

    return facts;
  } catch (error) {
    console.error("Error in generateLoaderInfo:", error);
    throw new Error("Failed to generate loader information. Please try again.");
  }
};