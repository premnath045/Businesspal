import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const generateLoaderInfo = async (businessName: string, businessDomain: string, businessLocation: string, businessDescription: string) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Generate 10 short, interesting facts or insights about ${businessName}, a company in the ${businessDomain} sector located in ${businessLocation}. Use this description as context: "${businessDescription}"

  Your response should be a JSON array of strings, each containing a short, one-line fact or insight. Do not include any additional formatting or explanation.

  Example format:
  [
    "Fact 1 line 1\\nFact 1 line 2",
    "Fact 2 line 1\\nFact 2 line 2",
    ...
  ]`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let responseText = response.text();

    // Remove any markdown formatting if present
    responseText = responseText.replace(/```json\s?/, '').replace(/```\s?$/, '');

    // Parse the JSON array
    const facts = JSON.parse(responseText);

    // Validate that we have an array of strings
    if (!Array.isArray(facts) || facts.length === 0 || typeof facts[0] !== 'string') {
      throw new Error("Generated content does not match the required format");
    }

    return facts;
  } catch (error) {
    console.error("Error in generateLoaderInfo:", error);
    throw new Error("Failed to generate loader information. Please try again.");
  }
};