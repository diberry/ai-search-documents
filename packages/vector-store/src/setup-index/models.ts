import type {
  SimpleField,
  ComplexField,
  SearchSuggester,
  GeographyPoint 
} from "@azure/search-documents";
export type Address = {
  StreetAddress: string;
  City: string;
  StateProvince: string;
  PostalCode: string;
};

export type Hotel = {
  "@search.action": "mergeOrUpload" | "upload" | "merge" | "delete";
  HotelId: string;
  HotelName: string;
  HotelNameVector: number[];
  Description: string;
  DescriptionVector: number[];
  Category: string;
  Tags: string[];
};

// Define the file-level object type
export type HotelData = {
  value: Hotel[];
};

export type HotelIndex = {
  name: string;
  fields: SimpleField[] | ComplexField[];
  vectorSearch: any;
  semantic: any;
  suggesters: SearchSuggester[];
};