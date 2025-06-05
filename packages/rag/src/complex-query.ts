// This is a RAG (Retrieval Augmented Generation) implementation that:
// 1. Takes a user query about hotels
// 2. Searches a hotel database using Azure AI Search
// 3. Formats the search results for the LLM
// 4. Sends the query and formatted results to Azure OpenAI
// 5. Returns a grounded response based only on the retrieved information

import { SearchClient, AzureKeyCredential, SearchDocumentsResult } from "@azure/search-documents";
import CreateChatCompletionResponse, { AzureOpenAI } from "openai";

function getClients(): { openaiClient: AzureOpenAI; searchClient: SearchClient<{ HotelName: string; Description: string; Tags: string[] | string; Address: string; Rooms: string }>; modelName: string }  {

    const AZURE_SEARCH_ENDPOINT = process.env.AZURE_SEARCH_ENDPOINT!;
    const AZURE_SEARCH_API_KEY = process.env.AZURE_SEARCH_API_KEY!;
    const AZURE_SEARCH_INDEX_NAME = process.env.AZURE_SEARCH_INDEX_NAME!;

    const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT!;
    const AZURE_OPENAI_API_KEY = process.env.AZURE_OPENAI_API_KEY!;
    const AZURE_OPENAI_VERSION = process.env.AZURE_OPENAI_VERSION!;
    const AZURE_OPENAI_DEPLOYMENT_MODEL = process.env.AZURE_DEPLOYMENT_MODEL!;

    if (
        !AZURE_OPENAI_ENDPOINT ||
        !AZURE_SEARCH_ENDPOINT ||
        !AZURE_SEARCH_INDEX_NAME ||
        !AZURE_OPENAI_DEPLOYMENT_MODEL ||
        !AZURE_SEARCH_API_KEY ||
        !AZURE_OPENAI_VERSION ||
        !AZURE_OPENAI_API_KEY
    ) {
        throw new Error("Missing required environment variables.");
    }

    const openaiClient = new AzureOpenAI({
        apiKey: AZURE_OPENAI_API_KEY,
        endpoint: AZURE_OPENAI_ENDPOINT,
        apiVersion: AZURE_OPENAI_VERSION
    });

    const searchClient = new SearchClient<{ HotelName: string; Description: string; Tags: string[] | string; Address: string; Rooms: string }>(
        AZURE_SEARCH_ENDPOINT,
        "hotels-sample-index",
        new AzureKeyCredential(AZURE_SEARCH_API_KEY)
    );


    return { openaiClient, searchClient, modelName: AZURE_OPENAI_DEPLOYMENT_MODEL };
}

async function queryAISearchForSources(
    searchClient: SearchClient<{ HotelName: string; Description: string; Tags: string[] | string; Address: string; Rooms: string }>,
    query: string
): Promise<SearchDocumentsResult<{ HotelName: string; Description: string; Tags: string[] | string; Address: string; Rooms: string }>> {
    console.log(`Searching for: "${query}"\n`);

    const selectedFields: readonly ["HotelName", "Description", "Address", "Rooms", "Tags"] = ["HotelName", "Description", "Address", "Rooms", "Tags"];
    const searchResults = await searchClient.search(query, {
        top: 5,
        select: selectedFields,
        queryType: "semantic",
        semanticSearchOptions: {},
    });

    return searchResults;
}
async function queryOpenAIForResponse(
    openaiClient: AzureOpenAI, 
    query: string, 
    sourcesFormatted: string, 
    modelName: string
): Promise<CreateChatCompletionResponse> {

    const GROUNDED_PROMPT = `
 You are a friendly assistant that recommends hotels based on activities and amenities.
 Answer the query using only the sources provided below in a friendly and concise bulleted manner.
 Answer ONLY with the facts listed in the list of sources below.
 If there isn't enough information below, say you don't know.
 Do not generate answers that don't use the sources below.

Query: {query}
Sources: {sources}
`;

    return openaiClient.chat.completions.create({
        model: modelName,
        messages: [
            {
                role: "user",
                content: GROUNDED_PROMPT.replace("{query}", query).replace("{sources}", sourcesFormatted),
            }
        ],
        temperature: 0.7,
        max_tokens: 800,
    });
}

async function main(): Promise<void> {

    const { openaiClient, searchClient, modelName } = getClients();

    const query = `
    Can you recommend a few hotels that offer complimentary breakfast? 
    Tell me their description, address, tags, and the rate for one room that sleeps 4 people.
    `;

    const sourcesResult = await queryAISearchForSources(searchClient, query);
    let sourcesFormatted = "";

    for await (const result of sourcesResult.results) {
        // Explicitly typing result to ensure compatibility
        sourcesFormatted += JSON.stringify(result.document) + "\n";
    }

    const response = await queryOpenAIForResponse(openaiClient, query, sourcesFormatted.trim(), modelName);

    // Print the response from the chat model
    console.log(response.choices[0].message.content);
}

main().catch((error) => {
    console.error("An error occurred:", error);
    process.exit(1);
});