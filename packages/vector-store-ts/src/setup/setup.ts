import {
  SearchIndexClient,
  SimpleField,
  ComplexField,
  SearchSuggester,
  SearchClient,
  SearchDocumentsResult,
  AzureKeyCredential,
  odata,
  SearchFieldArray,
  SearchIndex,
} from "@azure/search-documents";
import type { Hotel } from "./models.js";
import "dotenv/config";


// Import data
import { HOTEL_INDEX_DEFINITION } from "./hotel-index.js";
import { HOTELS } from "./hotel-data.js";

// Get endpoint and apiKey from .env file
const endpoint: string = process.env.SEARCH_API_ENDPOINT!!;


function printSearchIndex(searchIndex: SearchIndex) {
  const { name, etag, defaultScoringProfile } = searchIndex;
  console.log(
    `Search Index name: ${name}, etag: ${etag}, defaultScoringProfile: ${defaultScoringProfile}`,
  );
}
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Get Incoming Data

async function createIndex(
  searchIndexClient: SearchIndexClient,
  indexName: string,
  searchIndex: SearchIndex,
) {
  console.log(`Running Azure AI Search JavaScript quickstart...`);

  // Delete the index if it already exists
  indexName
    ? await searchIndexClient.deleteIndex(indexName)
    : console.log("Index doesn't exist.");

  console.log("Creating index...");
  const newIndex: SearchIndex = await searchIndexClient.createIndex(searchIndex);

  // Print the new index
  printSearchIndex(newIndex);
}
async function loadData(
  searchClient: any,
  hotels: any,
) {
  console.log("Uploading documents...");

  let indexDocumentsResult = await searchClient.mergeOrUploadDocuments(hotels);

    console.log(JSON.stringify(indexDocumentsResult));

  console.log(
    `Index operations succeeded: ${JSON.stringify(indexDocumentsResult.results[0].succeeded)}`,
  );
}


async function main(indexName: string, indexDef: SearchIndex, hotels: Hotel[]) {
  // Create a new SearchIndexClient
  const indexClient = new SearchIndexClient(
    endpoint,
    new AzureKeyCredential(apiKey),
  );

  // Create the index
  await createIndex(indexClient, indexName, indexDef);

  const searchClient = indexClient.getSearchClient(indexName);
  //const searchClient = new SearchClient(endpoint, indexName, new AzureKeyCredential(apiKey));


  // Load with data
  console.log("Loading data...", indexName);
  await loadData(searchClient, hotels);

  wait(10000);


}

main("hotel-index", HOTEL_INDEX_DEFINITION, HOTELS).catch((err) => {
  console.error("The sample encountered an error:", err);
});
