import type {
  SimpleField,
  ComplexField,
  SearchSuggester
} from "@azure/search-documents";
export type Address = {
  StreetAddress: string;
  City: string;
  StateProvince: string | null;
  PostalCode: string;
  Country: string;
};

export type Location = {
  type: "Point";
  coordinates: [number, number];
  crs?: {
    type: string;
    properties: {
      name: string;
    };
  };
};

export type Hotel = {
  "@search.action"?: "mergeOrUpload" | "upload" | "merge" | "delete";
  HotelId: string;
  HotelName: string;
  Description: string;
  DescriptionVector: number[];
  Category: string;
  Tags: string[];
  ParkingIncluded: boolean;
  LastRenovationDate?: string;
  Rating?: number;
  Address: Address;
  Location: Location;
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