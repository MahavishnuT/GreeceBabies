export interface Destination {
  id: string;
  name: string;
  description: string;
  votes: string[]; // list of voter names
  addedBy: string;
  createdAt: string;
}

export interface Hotel {
  id: string;
  destination: string;
  name: string;
  pricePerNight: string;
  rating: string;
  link: string;
  notes: string;
  addedBy: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  destination: string;
  name: string;
  description: string;
  estimatedCost: string;
  addedBy: string;
  createdAt: string;
}

export interface TripNote {
  id: string;
  content: string;
  author: string;
  createdAt: string;
}

export interface TripInfo {
  startDate: string;
  endDate: string;
  budget: string;
  participants: string[];
}

export type TabId = 'destinations' | 'hotels' | 'activities' | 'planning';
