export interface TripFormData {
  startLocation: string;
  endLocation: string;
  startDate: string;
  startTime: string;
  endDate: string;
  checkInTime: string;
  interests?: string;
}

export interface TripItinerary {
  totalDays: number;
  totalDistance: number;
  totalDrivingTime: string;
  totalAttractions: number;
  days: TripDay[];
}

export interface TripDay {
  dayNumber: number;
  date: string;
  route: {
    from: string;
    to: string;
    distance: number;
    drivingTime: string;
    departureTime: string;
    arrivalTime: string;
    fromCoordinates?: {
      lat: number;
      lng: number;
      formattedAddress: string;
    };
    toCoordinates?: {
      lat: number;
      lng: number;
      formattedAddress: string;
    };
  };
  attractions: Attraction[];
  overnightLocation: string;
  overnightCoordinates?: {
    lat: number;
    lng: number;
    formattedAddress: string;
  };
}

export interface Attraction {
  name: string;
  description: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Trip {
  id: string;
  startLocation: string;
  endLocation: string;
  startDate: string;
  startTime: string;
  endDate: string;
  checkInTime: string;
  interests?: string;
  itinerary?: TripItinerary;
  status: "pending" | "completed" | "failed";
  createdAt: string;
}
