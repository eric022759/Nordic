export type Status = "confirmed" | "pending" | "optional";

export type ActivityPeriod = "morning" | "afternoon" | "evening" | "allDay";

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

export interface Trip {
  title: string;
  subtitle?: string;
  productCode?: string;
  travelAgencyName: string;
  startDate: string;
  endDate: string;
  countries: string[];
  sourceUrls: string[];
  status: Status;
  lastReviewedAt: string;
}

export interface Activity {
  name: string;
  description?: string;
  period?: ActivityPeriod;
  destinationId?: string;
  mapsQuery?: string;
  mapsCoordinates?: GeoCoordinates;
  mapsUrl?: string;
  mapsLinks?: readonly MapLink[];
  status: Status;
  sourceReference: string;
}

export interface Transport {
  type: string;
  description?: string;
  route?: string;
  distance?: string;
  operator?: string;
  referenceSchedule?: string;
  notes?: string;
  status: Status;
  sourceReference: string;
}

export interface MapLink {
  label: string;
  url: string;
}

export interface Accommodation {
  name?: string;
  cityOrRegion: string;
  notes?: string;
  mapsUrl?: string;
  status: Status;
  sourceReference: string;
}

export interface MealInfo {
  breakfast?: string;
  lunch?: string;
  dinner?: string;
  sourceReference: string;
  status?: Status;
  lastReviewedAt?: string;
}

export interface DayItinerary {
  day: number;
  date: string;
  title: string;
  summary: string;
  startLocation?: string;
  endLocation?: string;
  activities: Activity[];
  transport?: Transport[];
  meals?: MealInfo;
  accommodation?: Accommodation;
  weatherLocationIds: string[];
  status: Status;
  sourceReference: string;
  lastReviewedAt: string;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  cityOrRegion: string;
  latitude: number;
  longitude: number;
  timezone: string;
  mapsQuery: string;
  mapsUrl: string;
  relatedDays: number[];
  introduction: string;
  highlights: string[];
  foodAndDrink: string[];
  cultureAndEtiquette: string[];
  clothingAdvice: string[];
  sourceReference: string;
  status: Status;
  lastReviewedAt: string;
}

export interface CultureGuide {
  id: string;
  country: string;
  localName: string;
  summary: string;
  foodAndDrink: string[];
  etiquette: string[];
  clothingAdvice: string[];
  optionalExperiences: string[];
  sourceReference: string;
  status: Status;
  lastReviewedAt: string;
}
