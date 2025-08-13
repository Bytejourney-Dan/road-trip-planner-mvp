export interface GeocodeResult {
  lat: number;
  lng: number;
  formattedAddress: string;
}

export async function geocodeLocation(location: string): Promise<GeocodeResult> {
  const apiKey = process.env.GOOGLE_MAPS_SERVER_API_KEY;
  
  if (!apiKey) {
    throw new Error("Google Maps Server API key is not configured");
  }
  
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status === 'REQUEST_DENIED') {
      throw new Error(`Google Maps API request denied. Please check your API key permissions and billing.`);
    }
    
    if (data.status === 'INVALID_REQUEST') {
      throw new Error(`Invalid geocoding request for location: ${location}`);
    }
    
    if (data.status !== 'OK' || !data.results?.length) {
      throw new Error(`Failed to geocode location: ${location}. Status: ${data.status}`);
    }
    
    const result = data.results[0];
    return {
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng,
      formattedAddress: result.formatted_address,
    };
  } catch (error) {
    console.error("Geocoding error:", error);
    throw new Error(`Failed to geocode location: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function geocodeItinerary(itinerary: any) {
  try {
    // Geocode all unique locations mentioned in the itinerary
    const locationsToGeocode = new Set<string>();
    
    // Add start and end locations from each day
    itinerary.days.forEach((day: any) => {
      locationsToGeocode.add(day.route.from);
      locationsToGeocode.add(day.route.to);
      locationsToGeocode.add(day.overnightLocation);
    });
    
    const geocodedLocations = new Map<string, GeocodeResult>();
    let geocodingErrors = 0;
    
    // Geocode each unique location
    for (const location of Array.from(locationsToGeocode)) {
      try {
        const result = await geocodeLocation(location);
        geocodedLocations.set(location, result);
      } catch (error) {
        console.warn(`Failed to geocode ${location}:`, error);
        geocodingErrors++;
        // Continue with other locations if one fails
      }
    }
    
    // If all geocoding failed, add a note to the itinerary
    const hasCoordinates = geocodedLocations.size > 0;
    
    // Add coordinates to the itinerary
    const enhancedItinerary = {
      ...itinerary,
      geocodingStatus: hasCoordinates ? 'partial' : 'failed',
      geocodingNote: hasCoordinates 
        ? `${geocodingErrors} locations could not be geocoded due to API restrictions`
        : 'Map display unavailable - Google Maps API configuration required',
      days: itinerary.days.map((day: any) => ({
        ...day,
        route: {
          ...day.route,
          fromCoordinates: geocodedLocations.get(day.route.from),
          toCoordinates: geocodedLocations.get(day.route.to),
        },
        overnightCoordinates: geocodedLocations.get(day.overnightLocation),
      }))
    };
    
    return enhancedItinerary;
  } catch (error) {
    console.error("Error geocoding itinerary:", error);
    // Return original itinerary with error note if geocoding completely fails
    return {
      ...itinerary,
      geocodingStatus: 'failed',
      geocodingNote: 'Map display unavailable - Google Maps API configuration required'
    };
  }
}
