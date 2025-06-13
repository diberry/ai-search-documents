
// async function searchAllReturnAllFields(
//   searchClient: SearchClient<Hotel>,
//   searchText: string,
// ) {
//   console.log("Query #1 - return everything:");

//   // Search Options
//   // Without `select` property, all fields are returned
//   const searchOptions = { includeTotalCount: true };

//   // Search
//   const { count, results } = await searchClient.search(
//     searchText,
//     searchOptions,
//   );

//   // Show results
//   for await (const result of results) {
//     console.log(`${JSON.stringify(result.document)}`);
//   }

//   // Show results count
//   console.log(`Result count: ${count}`);
// }
// async function searchAllSelectReturnedFields(
//   searchClient: SearchClient<Hotel>,
//   searchText: string,
// ) {
//   console.log("Query #2 - search everything:");

//   // Search Options
//   // Narrow down the fields to return
//   const selectFields: SearchFieldArray<Hotel> = [
//     "HotelId",
//     "HotelName",
//     "Rating",
//   ];
//   const searchOptions = { includeTotalCount: true, select: selectFields };

//   // Search
//   const { count, results }: SearchDocumentsResult<Hotel> =
//     await searchClient.search(searchText, searchOptions);

//   // Show results
//   for await (const result of results) {
//     console.log(`${JSON.stringify(result.document)}`);
//   }

//   // Show results count
//   console.log(`Result count: ${count}`);
// }
// async function searchWithFilterOrderByAndSelect(
//   searchClient: SearchClient<Hotel>,
//   searchText: string,
//   filterText: string,
// ) {
//   console.log("Query #3 - Search with filter, orderBy, and select:");

//   // Search Options
//   // Narrow down the fields to return
//   const searchOptions = {
//     filter: odata`Address/StateProvince eq ${filterText}`,
//     orderBy: ["Rating desc"],
//     select: ["HotelId", "HotelName", "Rating"] as const, // Select only these fields
//   };
//   type SelectedHotelFields = Pick<Hotel, "HotelId" | "HotelName" | "Rating">;

//   // Search
//   const { count, results }: SearchDocumentsResult<SelectedHotelFields> =
//     await searchClient.search(searchText, searchOptions);

//   // Show results
//   for await (const result of results) {
//     console.log(`${JSON.stringify(result.document)}`);
//   }

//   // Show results count
//   console.log(`Result count: ${count}`);
// }
// async function searchWithLimitedSearchFields(
//   searchClient: SearchClient<Hotel>,
//   searchText: string,
// ) {
//   console.log("Query #4 - Limit searchFields:");

//   // Search Options
//   const searchOptions = {
//     select: ["HotelId", "HotelName", "Rating"] as const, // Select only these fields
//     searchFields: ["HotelName"] as const,
//   };
//   type SelectedHotelFields = Pick<Hotel, "HotelId" | "HotelName" | "Rating">;

//   // Search
//   const { count, results }: SearchDocumentsResult<SelectedHotelFields> =
//     await searchClient.search(searchText, searchOptions);

//   // Show results
//   for await (const result of results) {
//     console.log(`${JSON.stringify(result.document)}`);
//   }

//   // Show results count
//   console.log(`Result count: ${count}`);
// }
// async function searchWithFacets(
//   searchClient: SearchClient<Hotel>,
//   searchText: string,
// ) {
//   console.log("Query #5 - Use facets:");

//   // Search Options
//   const searchOptions = {
//     facets: ["Category"], //For aggregation queries
//     select: ["HotelId", "HotelName", "Rating"] as const, // Select only these fields
//     searchFields: ["HotelName"] as const,
//   };
//   type SelectedHotelFields = Pick<Hotel, "HotelName">;

//   // Search
//   const { count, results }: SearchDocumentsResult<SelectedHotelFields> =
//     await searchClient.search(searchText, searchOptions);

//   // Show results
//   for await (const result of results) {
//     console.log(`${JSON.stringify(result.document)}`);
//   }

//   // Show results count
//   console.log(`Result count: ${count}`);
// }
// async function lookupDocumentById(
//   searchClient: SearchClient<Hotel>,
//   key: string,
// ) {
//   console.log("Query #6 - Lookup document:");

//   // Get document by ID
//   // Full document returned, destructured into id and name
//   const { HotelId: id, HotelName: name }: Hotel =
//     await searchClient.getDocument(key);

//   // Show results
//   console.log(`HotelId: ${id}, HotelName: ${name}`);
// }