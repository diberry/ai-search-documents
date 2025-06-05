# Set up the query for generating responses
 from azure.identity import DefaultAzureCredential
 from azure.identity import get_bearer_token_provider
 from azure.search.documents import SearchClient
 from openai import AzureOpenAI

 credential = DefaultAzureCredential()
 token_provider = get_bearer_token_provider(credential, "https://cognitiveservices.azure.com/.default")
 openai_client = AzureOpenAI(
     api_version="2024-06-01",
     azure_endpoint=AZURE_OPENAI_ACCOUNT,
     azure_ad_token_provider=token_provider
 )

 search_client = SearchClient(
     endpoint=AZURE_SEARCH_SERVICE,
     index_name="hotels-sample-index",
     credential=credential
 )

 # This prompt provides instructions to the model
 GROUNDED_PROMPT="""
 You are a friendly assistant that recommends hotels based on activities and amenities.
 Answer the query using only the sources provided below in a friendly and concise bulleted manner.
 Answer ONLY with the facts listed in the list of sources below.
 If there isn't enough information below, say you don't know.
 Do not generate answers that don't use the sources below.
 Query: {query}
 Sources:\n{sources}
 """

 # Query is the question being asked. It's sent to the search engine and the chat model
 query="Can you recommend a few hotels with complimentary breakfast?"

 # Search results are created by the search client
 # Search results are composed of the top 5 results and the fields selected from the search index
 # Search results include the top 5 matches to your query
 search_results = search_client.search(
     search_text=query,
     top=5,
     select="Description,HotelName,Tags"
 )
 sources_formatted = "\n".join([f'{document["HotelName"]}:{document["Description"]}:{document["Tags"]}' for document in search_results])

 # Send the search results and the query to the LLM to generate a response based on the prompt.
 response = openai_client.chat.completions.create(
     messages=[
         {
             "role": "user",
             "content": GROUNDED_PROMPT.format(query=query, sources=sources_formatted)
         }
     ],
     model=AZURE_DEPLOYMENT_MODEL
 )

 # Here is the response from the chat model.
 print(response.choices[0].message.content)