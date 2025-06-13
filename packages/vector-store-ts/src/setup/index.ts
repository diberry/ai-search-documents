import {
  SearchIndexClient,
  SearchClient,
  SearchIndex,
} from "@azure/search-documents";
import type { Hotel } from "./models.js";
import "dotenv/config";
import { DefaultAzureCredential} from "@azure/identity";

// Import data
import { HOTEL_INDEX_DEFINITION } from "./hotel-index.js";
import { HOTELS } from "./hotel-data.js";

const azureSearchEndpoint = process.env.AZURE_SEARCH_ENDPOINT!;

const azureSearchIndexName = process.env.AZURE_SEARCH_INDEX_NAME!;


function getClients(): { searchClient: SearchClient<Hotel>, searchIndexClient: SearchIndexClient } {

    const credential = new DefaultAzureCredential();
    
    const searchClient = new SearchClient<Hotel>(
        azureSearchEndpoint,
        azureSearchIndexName,
        credential
    );

    // Create SearchIndexClient with the same endpoint and credential
    const searchIndexClient = new SearchIndexClient(
        azureSearchEndpoint, 
        credential
    );

    return { searchClient, searchIndexClient };
}


function printSearchIndex(searchIndex: SearchIndex) {
  const { name, etag, defaultScoringProfile } = searchIndex;
  console.log(
    `Search Index name: ${name}, etag: ${etag}, defaultScoringProfile: ${defaultScoringProfile}`,
  );
}
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function pollIndexForDocuments(
  searchIndexClient: SearchIndexClient,
  indexName: string,
  expectedCount: number,
  maxAttempts: number = 30,
  pollIntervalMs: number = 5000
): Promise<void> {
  console.log(`Polling index '${indexName}' for ${expectedCount} documents...`);
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const indexStats = await searchIndexClient.getIndexStatistics(indexName);
      const documentCount = indexStats.documentCount;
      
      console.log(`Attempt ${attempt}/${maxAttempts}: Index contains ${documentCount} documents`);
      
      if (documentCount >= expectedCount) {
        console.log(`✅ Index now contains ${documentCount} documents. Polling complete.`);
        return;
      }
      
      if (attempt < maxAttempts) {
        console.log(`⏳ Waiting ${pollIntervalMs/1000} seconds before next check...`);
        await wait(pollIntervalMs);
      }
    } catch (error) {
      console.warn(`Warning: Error checking index statistics (attempt ${attempt}):`, error);
      if (attempt < maxAttempts) {
        await wait(pollIntervalMs);
      }
    }
  }
  
  console.warn(`⚠️ Polling completed after ${maxAttempts} attempts. Index may still be processing documents.`);
}

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
  searchClient: SearchClient<Hotel>,
  hotels: Hotel[],
) {
  console.log("Uploading documents...");

  let indexDocumentsResult = await searchClient.mergeOrUploadDocuments(hotels);

    console.log(JSON.stringify(indexDocumentsResult));

  console.log(
    `Index operations succeeded: ${JSON.stringify(indexDocumentsResult.results[0].succeeded)}`,
  );
}


async function main(indexDef: SearchIndex, hotels: Hotel[]) {
  // Create a new SearchIndexClient
  const { searchIndexClient, searchClient } = getClients();


  // Create the index
  await createIndex(searchIndexClient, azureSearchIndexName, indexDef);
  await wait(10000);

  // Load with data
  console.log("Loading data...", azureSearchIndexName);
  await loadData(searchClient, hotels);

  // Poll the index until all documents are indexed
  await pollIndexForDocuments(searchIndexClient, azureSearchIndexName, hotels.length);

  console.log("✅ Index setup and document loading completed successfully!");

}

main(HOTEL_INDEX_DEFINITION, HOTELS).catch((err) => {
  console.error("The sample encountered an error:", err);
});
