import {
    SearchIndexClient,
    SearchClient,
    SearchIndex,
    SearchOptions
} from "@azure/search-documents";
import type { Hotel } from "../setup/models.js";
import "dotenv/config";
import { DefaultAzureCredential } from "@azure/identity";

const azureSearchEndpoint = process.env.AZURE_SEARCH_ENDPOINT!;
const azureSearchIndexName = process.env.AZURE_SEARCH_INDEX_NAME!;

import SINGLE_VECTOR_QUERY_DATA from "./../queryVectors/singleVectoryQuery.json" with { type: "json" };


function getClients(): { searchClient: SearchClient<Hotel>, searchIndexClient: SearchIndexClient } {

    const credential = new DefaultAzureCredential();

    const searchClient = new SearchClient<Hotel>(
        azureSearchEndpoint,
        azureSearchIndexName,
        credential
    );

    const searchIndexClient = new SearchIndexClient(
        azureSearchEndpoint,
        credential
    );

    return { searchClient, searchIndexClient };
}

async function singleVectorQuery(
    searchClient: SearchClient<Hotel>,
): Promise<void> {


    // quintessential lodging near running trails, eateries, retail

    // BaseVectorQuery
    // BaseSearchRequestOptions

    const query: SearchOptions<Hotel> = {
        vectorSearchOptions: {
            queries: [
                {
                    kNearestNeighborsCount: 3,
                    fields: ["DescriptionVector"] as const,
                    kind: "vector" as const,
                    vector: SINGLE_VECTOR_QUERY_DATA.vector as number[],
                    exhaustive: true
                }
            ],
        },
        select: ["HotelId", "HotelName", "Description", "Category", "Tags"],
        includeTotalCount: true,
    }

    const searchResults = await searchClient.search("*", query);

    for await (const result of searchResults.results) {
        const name = `${result.document.HotelName}: ${result.document.Description}`;
        console.log(name);
    }
}
async function singleVectoryQueryWithFilter(
    searchClient: SearchClient<Hotel>,
): Promise<void> {

    // "quintessential lodging near running trails, eateries, retail"

    const query: SearchOptions<Hotel> = {
        vectorSearchOptions: {
            queries: [
                {
                    kNearestNeighborsCount: 7,
                    fields: ["DescriptionVector"] as const,
                    kind: "vector" as const,
                    vector: SINGLE_VECTOR_QUERY_DATA.vector as number[],
                    exhaustive: true
                }
            ],
            filterMode: "postFilter" // Set vectorFilterMode at the VectorSearchOptions level
        },
        select: ["HotelId", "HotelName", "Description", "Category", "Tags"],
        filter: "Tags/any(tag: tag eq 'free wifi')",
        includeTotalCount: true,
    }

    const searchResults = await searchClient.search("*", query);

    for await (const result of searchResults.results) {
        const name = `${result.document.HotelName}: ${result.document.Description}`;
        console.log(name);
    }
}
async function singleVectoryQueryWithGeoFilter(
    searchClient: SearchClient<Hotel>,
): Promise<void> {

    // "quintessential lodging near running trails, eateries, retail"

    const query: SearchOptions<Hotel> = {
        vectorSearchOptions: {
            queries: [
                {
                    kNearestNeighborsCount: 5,
                    fields: ["DescriptionVector"] as const,
                    kind: "vector" as const,
                    vector: SINGLE_VECTOR_QUERY_DATA.vector as number[],
                    exhaustive: true
                }
            ],
        },
        select: ["HotelId", "HotelName", "Description", "Category", "Tags"],
        facets: ["Address/StateProvince"],
        filter: "geo.distance(Location, geography'POINT(-77.03241 38.90166)') le 300",
        includeTotalCount: true,
        top: 5,
    }

    const searchResults = await searchClient.search("*", query);

    for await (const result of searchResults.results) {
        const name = `${result.document.HotelName}: ${result.document.Description}`;
        console.log(name);
    }
}
async function hybridQuery(
    searchClient: SearchClient<Hotel>,
): Promise<void> {


    // "quintessential lodging near running trails, eateries, retail"

    const query: SearchOptions<Hotel> = {
        vectorSearchOptions: {
            queries: [
                {
                    kNearestNeighborsCount: 5,
                    fields: ["DescriptionVector"] as const,
                    kind: "vector" as const,
                    vector: SINGLE_VECTOR_QUERY_DATA.vector as number[],
                    exhaustive: true
                }
            ],
        },
        select: ["HotelId", "HotelName", "Description", "Category", "Tags"],
        queryType: "semantic",
        semanticSearchOptions: { // SemanticSearchOptions type
            semanticQuery: "historic hotel walk to restaurants and shopping",
        },
        includeTotalCount: true,
        top: 5
    }

    const searchResults = await searchClient.search("*", query);

    for await (const result of searchResults.results) {
        const name = `${result.document.HotelName}: ${result.document.Description}`;
        console.log(name);
    }
}
async function hybridQueryWithSemanticeReranking(
    searchClient: SearchClient<Hotel>,
): Promise<void> {

    // "quintessential lodging near running trails, eateries, retail"

    const query: SearchOptions<Hotel> = {
        vectorSearchOptions: {
            queries: [
                {
                    kNearestNeighborsCount: 7,
                    fields: ["DescriptionVector"] as const,
                    kind: "vector" as const,
                    vector: SINGLE_VECTOR_QUERY_DATA.vector as number[],
                    exhaustive: true
                }
            ],
        },
        select: ["HotelId", "HotelName", "Description", "Category"],
        queryType: "semantic",
        semanticSearchOptions: { // SemanticSearchOptions type
            configurationName: "semantic-config",
            semanticQuery: "historic hotel walk to restaurants and shopping",
        },
        includeTotalCount: true,
        top: 7
    }

    const searchResults = await searchClient.search("*", query);

    for await (const result of searchResults.results) {
        const name = `${result.document.HotelName}: ${result.document.Description}`;
        console.log(name);
    }

}
async function main() {

    const { searchClient } = getClients();

    await singleVectorQuery(searchClient);

    console.log("-----------------------------");

    // how is vectorFilterMode from REST set? 
    await singleVectoryQueryWithFilter(searchClient);

}

main()
    .then(() => console.log("Done"))
    .catch((error) => console.error("Error:", error));