// GeminiLangChainLogic 
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";

export const runGeminiLangChain = async (): Promise<string> => {
  try {
    // Initialize the Gemini model
    const model = new ChatGoogleGenerativeAI({
      apiKey: import.meta.env.VITE_GEMINI_API_KEY || "",
      modelName: "gemini-pro",
      temperature: 0.9,
    });

    // Create a prompt template
    const prompt = PromptTemplate.fromTemplate<{ businessName: string }>(
      // "What is a good name for a company that makes {product}?"

      `Generate 10 short, interesting facts or insights about {businessName}
        Your response should be a JSON array of strings, each containing a short, one-line fact or insight. Do not include any additional formatting or explanation.
        Example format:
        [
          "Fact 1 line 1\\nFact 1 line 2",
          "Fact 2 line 1\\nFact 2 line 2",
          ...
        ]`
    );


    // Create a chain using RunnableSequence
    const chain = RunnableSequence.from([
      prompt,
      model,
      new StringOutputParser(),
    ]);

    // Run the chain
    const response = await chain.invoke({ businessName: "openAI" });
    
    return response;
  } catch (error) {
    console.error("Error running GeminiLangChain:", error);
    return "An error occurred";
  }
};