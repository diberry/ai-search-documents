import { SearchIndex } from "@azure/search-documents";

export const HOTEL_INDEX_DEFINITION: SearchIndex = {
    "name": "hotels-vector-quickstart",
    "fields": [
        {
            "name": "HotelId", 
            "type": "Edm.String",
            "searchable": false, 
            "filterable": true, 
            "hidden": false, 
            "sortable": false, 
            "facetable": false,
            "key": true
        },
        {
            "name": "HotelName", 
            "type": "Edm.String",
            "searchable": true, 
            "filterable": false, 
            "hidden": false, 
            "sortable": true, 
            "facetable": false
        },
        {
            "name": "HotelNameVector",
            "type": "Collection(Edm.Single)",
            "searchable": true,
            "hidden": false,
            "vectorSearchDimensions": 1536,
            "vectorSearchProfileName": "my-vector-profile"
        },
        {
            "name": "Description", 
            "type": "Edm.String",
            "searchable": true, 
            "filterable": false, 
            "hidden": false, 
            "sortable": false, 
            "facetable": false
        },
        {
            "name": "DescriptionVector",
            "type": "Collection(Edm.Single)",
            "searchable": true,
            "hidden": false,
            "vectorSearchDimensions": 1536,
            "vectorSearchProfileName": "my-vector-profile"
        },
                {
            "name": "Description_fr", 
            "type": "Edm.String",
            "searchable": true, 
            "filterable": false, 
            "hidden": false, 
            "sortable": false, 
            "facetable": false,
            "analyzerName": "en.microsoft"
        },
        {
            "name": "Description_frvector",
            "type": "Collection(Edm.Single)",
            "searchable": true,
            "hidden": false,
            "vectorSearchDimensions": 1536,
            "vectorSearchProfileName": "my-vector-profile"
        },
        {
            "name": "Category", 
            "type": "Edm.String",
            "searchable": true, 
            "filterable": true, 
            "hidden": false, 
            "sortable": true, 
            "facetable": true
        },
        {
            "name": "Tags",
            "type": "Collection(Edm.String)",
            "searchable": true,
            "filterable": true,
            "hidden": false,
            "sortable": false,
            "facetable": true
        },
                {
            "name": "ParkingIncluded",
            "type": "Edm.Boolean",
            "searchable": false,
            "filterable": true,
            "hidden": false,
            "sortable": true,
            "facetable": true
        },
        {
            "name": "LastRenovationDate",
            "type": "Edm.DateTimeOffset",
            "searchable": false,
            "filterable": true,
            "hidden": false,
            "sortable": true,
            "facetable": true
        },
        {
            "name": "Rating",
            "type": "Edm.Double",
            "searchable": false,
            "filterable": true,
            "hidden": false,
            "sortable": true,
            "facetable": true
        },
        {
            "name": "Address", 
            "type": "Edm.ComplexType",
            "fields": [
                {
                    "name": "StreetAddress", "type": "Edm.String",
                    "searchable": true, "filterable": false, "hidden": false, "sortable": false, "facetable": false
                },
                {
                    "name": "City", "type": "Edm.String",
                    "searchable": true, "filterable": true, "hidden": false, "sortable": true, "facetable": true
                },
                {
                    "name": "StateProvince", "type": "Edm.String",
                    "searchable": true, "filterable": true, "hidden": false, "sortable": true, "facetable": true
                },
                {
                    "name": "PostalCode", "type": "Edm.String",
                    "searchable": true, "filterable": true, "hidden": false, "sortable": true, "facetable": true
                },
                {
                    "name": "Country", "type": "Edm.String",
                    "searchable": true, "filterable": true, "hidden": false, "sortable": true, "facetable": true
                }
            ]
        },
        {
            "name": "Location",
            "type": "Edm.GeographyPoint",
            "searchable": false, 
            "filterable": true, 
            "hidden": false, 
            "sortable": true, 
            "facetable": false
        }
    ],
    "vectorSearch": {
        "algorithms": [
            {
                "name": "my-hnsw-vector-config-1",
                "kind": "hnsw",
                "parameters": 
                {
                    "m": 4,
                    "efConstruction": 400,
                    "efSearch": 500,
                    "metric": "cosine"
                }
            },
            {
                "name": "my-hnsw-vector-config-2",
                "kind": "hnsw",
                "parameters": 
                {
                    "m": 4,
                    "metric": "euclidean"
                }
            },
            {
                "name": "my-eknn-vector-config",
                "kind": "exhaustiveKnn",
                "parameters": 
                {
                    "metric": "cosine"
                }
            }
        ],
        "profiles": [      
            {
                "name": "my-vector-profile",
                "algorithmConfigurationName": "my-hnsw-vector-config-1"
            }
      ]
    },
    "semanticSearch": {
        "configurations": [
            {
                "name": "my-semantic-config",
                "prioritizedFields": {
                    "titleField": {
                        "name": "HotelName"
                    },
                    "contentFields": [
                        { "name": "Description" }
                    ],
                    "keywordsFields": [
                        { "name": "Category" }
                    ]
                }
            }
        ]
    }
};