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

/*
const HOTELS = [
  {
    HotelId: "1",
    HotelName: "Hotel Paradise",
    HotelNameVector: [0.1, 0.2, 0.3],
    Description: "A luxurious hotel with stunning views.",
    DescriptionVector: [0.4, 0.5, 0.6],
    Category: "Luxury",
    Tags: ["spa", "pool"],
    Description_fr: "Un hôtel luxueux avec des vues magnifiques.",
    Description_frVector: [0.7, 0.8, 0.9],
    ParkingIncluded: true,
    LastRenovationDate: "2020-01-01",
    Rating: 4.5,
    Address: {
      Street: "123 Paradise Road",
      City: "Dreamland",
      State: "DL",
      Country: "Wonderland",
      PostalCode: "12345",
    },
    Location: {
      Latitude: 12.345,
      Longitude: 67.890,
    },
  },
  // Additional hotel objects...
];

export { HOTELS };
*/

// Define the file-level object type
export type HotelData = {
  value: Hotel[];
};
