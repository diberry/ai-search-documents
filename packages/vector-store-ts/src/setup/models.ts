import type {
  SimpleField,
  ComplexField,
  SearchSuggester,
  GeographyPoint
} from "@azure/search-documents";
export type Address = {
  StreetAddress: string;
  City: string;
  StateProvince: string | null;
  PostalCode: string;
  Country: string;
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
  Description_fr: string;
  Description_frVector: number[];
  ParkingIncluded: boolean;
  LastRenovationDate: string;
  Rating: number;
  Address: Address;
  Location: {
    type: string;
    coordinates: number[]
    crs?: CRS;
  };
};
export type CRS = {
  type: string;
  properties: {
    name: string;
  };
};
