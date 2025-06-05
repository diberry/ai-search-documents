import { DefaultAzureCredential, getBearerTokenProvider } from "@azure/identity";
import { SearchClient, AzureKeyCredential } from "@azure/search-documents";
import { AzureOpenAI } from "openai";

const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT!;
const AZURE_SEARCH_ENDPOINT = process.env.AZURE_SEARCH_ENDPOINT!;
const AZURE_DEPLOYMENT_MODEL = process.env.AZURE_DEPLOYMENT_MODEL!;
const AZURE_SEARCH_API_KEY = process.env.AZURE_SEARCH_API_KEY!;
const AZURE_OPENAI_API_KEY = process.env.AZURE_OPENAI_API_KEY!;
const AZURE_OPENAI_VERSION = process.env.AZURE_OPENAI_VERSION!;

if (
  !AZURE_OPENAI_ENDPOINT ||
  !AZURE_SEARCH_ENDPOINT ||
  !AZURE_DEPLOYMENT_MODEL ||
  !AZURE_SEARCH_API_KEY ||
  !AZURE_OPENAI_VERSION ||
  !AZURE_OPENAI_API_KEY
) {
  throw new Error("Missing required environment variables.");
}

// Set up Azure credentials
// const credential = new DefaultAzureCredential();
// const tokenProvider = getBearerTokenProvider(credential, "https://cognitiveservices.azure.com/.default");

// Set up OpenAI client (Azure OpenAI)
const openaiClient = new AzureOpenAI({
  apiKey: AZURE_OPENAI_API_KEY,
  endpoint: AZURE_OPENAI_ENDPOINT,
  apiVersion: AZURE_OPENAI_VERSION
});

// Set up Azure Search client
const searchClient = new SearchClient(
  AZURE_SEARCH_ENDPOINT,
  "hotels-sample-index",
  new AzureKeyCredential(AZURE_SEARCH_API_KEY)
);

// Prompt template for RAG (Retrieval Augmented Generation)
const GROUNDED_PROMPT = `

 You are a friendly assistant that recommends hotels based on activities and amenities.
 Answer the query using only the sources provided below in a friendly and concise bulleted manner.
 Answer ONLY with the facts listed in the list of sources below.
 If there isn't enough information below, say you don't know.
 Do not generate answers that don't use the sources below.

Query: {query}
Sources: {sources}

`;

// Get the user's query from command line arguments or use default
const query = process.argv[2] || "Can you recommend a few hotels with complimentary breakfast?";

async function main() {
  console.log(`Searching for: "${query}"\n`);
  // Search for relevant hotels using standard keyword search
  // For hybrid search or vector search, we would need additional configuration
  const searchResults = await searchClient.search(query, {
    top: 5,
    select: ["Description", "HotelName", "Tags"]
  });

  const sources: string[] = [];
  for await (const result of searchResults.results) {
    const doc = result.document as any;
    sources.push(
      `Hotel: ${doc.HotelName}\n` + 
      `Description: ${doc.Description}\n` + 
      `Tags: ${Array.isArray(doc.Tags) ? doc.Tags.join(', ') : doc.Tags}\n`
    );
  }
  const sourcesFormatted = sources.join("\n---\n");

  // Send the search results and the query to the LLM to generate a response based on the prompt.
  const response = await openaiClient.chat.completions.create({
    model: AZURE_DEPLOYMENT_MODEL,
    messages: [
      {
        role: "user",
        content: GROUNDED_PROMPT.replace("{query}", query).replace("{sources}", sourcesFormatted),
      }
    ],
    temperature: 0.7,
    max_tokens: 800,
  });

  // Print the response from the chat model
  console.log(response.choices[0].message.content);
}

main().catch((error) => {
  console.error("An error occurred:", error);
  process.exit(1);
});