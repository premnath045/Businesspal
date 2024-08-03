// config.ts file
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { JsonOutputParser, StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";


// Initialize the Gemini model
const model = new ChatGoogleGenerativeAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || "",
  modelName: "gemini-1.5-flash",
  temperature: 0.5,
});

const jsonStructure = {
  "businessProfile": {
    "overview": {
      "history": "",
      "mission": "",
      "coreValues": []
    },
    "productsServices": [
      {
        "name": "",
        "description": "",
        "uniqueSellingProposition": "",
        "revenueShare": "",
      }
    ],
    "organizationalStructure": {
      "description": "",
      "keyLeadership": [
        {
          "name": "",
          "position": ""
        }
      ]
    },
    "financialHealth": {
      "summary": "",
      "keyMetrics": [
        {
          "metric": "",
          "value": ""
        }
      ]
    }
  },
  "regionalAnalysis": {
    "industryTrends": [
      {
        "trend": "",
        "impact": ""
      }
    ],
    "competitors": [
      {
        "name": "",
        "strengths": [],
        "weaknesses": []
      }
    ],
    "swotAnalysis": {
      "strengths": [],
      "weaknesses": [],
      "opportunities": [],
      "threats": []
    },
    "marketPosition": {
      "marketShare": "",
      "positioning": ""
    }
  },
  "opportunityAnalysis": {
    "growthAreas": [
      {
        "area": "",
        "potential": ""
      }
    ],
    "productServiceExpansions": [
      {
        "idea": "",
        "rationale": ""
      }
    ],
    "potentialPartnerships": [
      {
        "partner": "",
        "benefit": ""
      }
    ],
    "technologicalOpportunities": [
      {
        "technology": "",
        "application": ""
      }
    ]
  },
  "customerBaseAnalysis": {
    "demographics": [
      {
        "factor": "",
        "description": ""
      }
    ],
    "psychographics": [
      {
        "factor": "",
        "description": ""
      }
    ],
    "customerRetention": {
      "retentionRate": "",
      "loyaltyPrograms": []
    },
    "underservedSegments": [
      {
        "segment": "",
        "opportunity": ""
      }
    ],
    "customerFeedback": {
      "satisfactionLevel": "",
      "keyInsights": []
    }
  },
  "marketTrendAnalysis": {
    "emergingTrends": [
      {
        "trend": "",
        "impact": ""
      }
    ],
    "businessModelImpact": "",
    "futureMarketShifts": [
      {
        "shift": "",
        "potentialImpact": ""
      }
    ],
    "recommendedStrategies": [
      {
        "strategy": "",
        "rationale": ""
      }
    ]
  },
  "recommendations": [
    {
      "area": "",
      "recommendation": "",
      "expectedImpact": ""
    }
  ],
  "sources": [
    {
      "title": "",
      "url": ""
    }
  ]
};

const promptTemplate = new PromptTemplate({
  template: `As an expert business researcher, conduct a comprehensive analysis of the company {businessName}, operating in the {businessDomain} sector and located in {businessLocation}. Use the following brief description as a starting point: "{businessDescription}"

  Your task is to generate a detailed, actionable report that will empower this small business with meaningful insights. Include proper citations for all your findings. The report should cover the following areas:

  1. Business Profile:
  - Provide an overview of {businessName}, including its history, mission, and core values
  - Analyze the company's current products/services and their unique selling propositions
  - Evaluate the company's organizational structure and key leadership
  - Assess the company's financial health and performance (if public information is available)
  - key products and services of this company what percentage in numbers does this product contribute to the overall company revenue share. add this under productsServices JSON object[only percentage value]

  2. Regional Business Trends and Competitor Analysis:
  - Identify key trends in the {businessDomain} sector specific to {businessLocation}
  - List and analyze main competitors in the region
  - Conduct a SWOT (Strengths, Weaknesses, Opportunities, Threats) analysis comparing {businessName} to its competitors
  - Evaluate market share and positioning of {businessName} relative to competitors

  3. Opportunity Analysis:
  - Identify potential growth areas or new market segments for {businessName}
  - Suggest possible product/service expansions or innovations based on market gaps
  - Analyze potential partnerships or collaborations that could benefit the company
  - Evaluate opportunities for technological advancements or digital transformation

  4. Customer Base Analysis:
  - Define the current customer demographics and psychographics
  - Analyze customer retention rates and loyalty programs (if applicable)
  - Identify underserved customer segments that {businessName} could target
  - Evaluate customer feedback and satisfaction levels

  5. Market and Customer Trend Analysis:
  - Identify emerging trends in customer preferences and behaviors in the {businessDomain} sector
  - Analyze how these trends might impact {businessName}'s business model
  - Predict future market shifts that could affect the company
  - Suggest strategies to adapt to or capitalize on these trends

  For each section, provide actionable recommendations that {businessName} can implement to improve their business performance and competitive position. Ensure that all insights are tailored to the specific context of a small business operating in {businessLocation}.

  Your report should be comprehensive yet concise, focusing on the most impactful insights and recommendations. Use data-driven analysis wherever possible, and clearly cite all sources of information.

  IMPORTANT: Your response must be a valid JSON object that strictly adheres to the following structure:

  {jsonStructure}

  Follow these guidelines when filling out the JSON structure:
  1. Replace all empty strings ("") with relevant content.
  2. For array fields, provide at least one item, and add more as needed.
  3. Ensure all fields in the structure are populated with appropriate content.
  4. Do not add any new fields or alter the structure in any way.
  5. Make sure your response can be parsed by JavaScript's JSON.parse() function.

  Your analysis should be comprehensive yet concise, focusing on the most impactful insights and recommendations. Use data-driven analysis wherever possible, and clearly cite all sources of information in the 'sources' array.`,
  inputVariables: ["businessName", "businessDomain", "businessLocation", "businessDescription", "jsonStructure"],
});

const outputParser = new JsonOutputParser();


// Creating the RunnableSequence
export const generateContentSequence = RunnableSequence.from([
  {
    formattedPrompt: async (input: any) => 
      promptTemplate.format({
        ...input,
        jsonStructure: JSON.stringify(jsonStructure, null, 2),
      }),
  },
  {
    llmResponse: async (input: any) => model.invoke(input.formattedPrompt),
  },
  {
    parsedOutput: async (input: any) => outputParser.parse(input.llmResponse.content),
  },
  async (input: any) => {
    if (!validateJsonStructure(input.parsedOutput, jsonStructure)) {
      throw new Error("Generated content does not match the required structure");
    }
    return input.parsedOutput;
  },
]);


// Helper function to validate the JSON structure
function validateJsonStructure(generated: any, template: any): boolean {
  for (const key in template) {
    if (!(key in generated)) {
      return false;
    }
    if (typeof template[key] === 'object' && template[key] !== null) {
      if (Array.isArray(template[key])) {
        if (!Array.isArray(generated[key]) || generated[key].length === 0) {
          return false;
        }
      } else if (!validateJsonStructure(generated[key], template[key])) {
        return false;
      }
    }
  }
  return true;
}


export const generateContent = async (
  businessName: string,
  businessDomain: string,
  businessLocation: string,
  businessDescription: string,
  progressCallback: (progress: number) => Promise<void>
) => {

  const maxRetries = 3;
  let retries = 0;

  // Loop until the content is generated or the maximum number of retries is reached
  while (retries < maxRetries) {
    try {
      const result = await generateContentSequence.invoke({
        businessName,
        businessDomain,
        businessLocation,
        businessDescription,
      });

      // Simulate progress updates
      const totalSteps = Object.keys(result).length;
      let completedSteps = 0;

      for (const key in result) {
        await new Promise(resolve => setTimeout(resolve, 500));
        completedSteps++;
        await progressCallback(completedSteps / totalSteps);
      }

      return result;
    } catch (error: any) {
      retries++;
      console.error(`Attempt ${retries} failed:`, error);

      if (retries >= maxRetries) {
        if (error.message.includes("RECITATION")) {
          throw new Error("The AI model couldn't generate a unique response. Please try rephrasing your request.");
        } else {
          throw new Error(`Failed to generate content after ${maxRetries} attempts. Please try again later.`);
        }
      }

      // Wait before retrying (you might want to implement exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * retries));
    }
  }

  throw new Error("Unexpected error in generate content function");
};



export default (businessName: string, businessDomain: string, businessLocation: string, businessDescription: string) => 
  generateContent(businessName, businessDomain, businessLocation, businessDescription, () => Promise.resolve());