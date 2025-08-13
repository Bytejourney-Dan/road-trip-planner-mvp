export interface GeocodeResult {
  lat: number;
  lng: number;
  formattedAddress: string;
}

export interface PlaceDetails {
  placeId: string;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  formattedAddress: string;
  rating?: number;
  userRatingsTotal?: number;
  photos?: string[];
  types?: string[];
  website?: string;
  phoneNumber?: string;
}

export async function geocodeLocation(location: string): Promise<GeocodeResult> {
  const apiKey = process.env.GOOGLE_MAPS_SERVER_API_KEY;
  
  if (!apiKey) {
    throw new Error("Google Maps Server API key is not configured");
  }
  
  try {
    // Use Places API Text Search since you have that enabled
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(location)}&key=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`Places API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status === 'REQUEST_DENIED') {
      throw new Error(`Google Maps API request denied. Please check your API key permissions and billing.`);
    }
    
    if (data.status === 'INVALID_REQUEST') {
      throw new Error(`Invalid Places API request for location: ${location}`);
    }
    
    if (data.status !== 'OK' || !data.results?.length) {
      throw new Error(`Failed to find location: ${location}. Status: ${data.status}`);
    }
    
    const result = data.results[0];
    return {
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng,
      formattedAddress: result.formatted_address,
    };
  } catch (error) {
    console.error("Places API error:", error);
    throw new Error(`Failed to geocode location: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getPlaceDetails(query: string, nearLocation?: string): Promise<PlaceDetails | null> {
  const apiKey = process.env.GOOGLE_MAPS_SERVER_API_KEY;
  
  if (!apiKey) {
    throw new Error("Google Maps Server API key is not configured");
  }
  
  try {
    // Enhance query with location context
    const searchQuery = nearLocation ? `${query}, ${nearLocation}` : query;
    
    // Use Places API Text Search to find the place
    const searchResponse = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${apiKey}`
    );
    
    if (!searchResponse.ok) {
      throw new Error(`Places API search error: ${searchResponse.status}`);
    }
    
    const searchData = await searchResponse.json();
    
    if (searchData.status !== 'OK' || !searchData.results?.length) {
      console.warn(`No place found for query: ${searchQuery}`);
      return null;
    }
    
    const place = searchData.results[0];
    
    // Get detailed information using Place Details API
    const detailsResponse = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,geometry,formatted_address,rating,user_ratings_total,photos,types,website,formatted_phone_number&key=${apiKey}`
    );
    
    if (!detailsResponse.ok) {
      throw new Error(`Places API details error: ${detailsResponse.status}`);
    }
    
    const detailsData = await detailsResponse.json();
    
    if (detailsData.status !== 'OK' || !detailsData.result) {
      console.warn(`No details found for place_id: ${place.place_id}`);
      return null;
    }
    
    const details = detailsData.result;
    
    return {
      placeId: place.place_id,
      name: details.name,
      coordinates: {
        lat: details.geometry.location.lat,
        lng: details.geometry.location.lng
      },
      formattedAddress: details.formatted_address,
      rating: details.rating,
      userRatingsTotal: details.user_ratings_total,
      photos: details.photos?.slice(0, 3).map((photo: any) => 
        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${apiKey}`
      ),
      types: details.types,
      website: details.website,
      phoneNumber: details.formatted_phone_number
    };
  } catch (error) {
    console.error("Places API error:", error);
    return null;
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
      days: await Promise.all(itinerary.days.map(async (day: any) => {
        // Use Places API to get detailed attraction information
        const geocodedAttractions = await Promise.all(
          (day.attractions || []).map(async (attraction: any) => {
            try {
              // Use Places API to get detailed information
              const placeDetails = await getPlaceDetails(attraction.name, day.overnightLocation);
              
              if (placeDetails) {
                return {
                  ...attraction,
                  coordinates: placeDetails.coordinates,
                  placeDetails: {
                    placeId: placeDetails.placeId,
                    formattedAddress: placeDetails.formattedAddress,
                    rating: placeDetails.rating,
                    userRatingsTotal: placeDetails.userRatingsTotal,
                    photos: placeDetails.photos,
                    types: placeDetails.types,
                    website: placeDetails.website,
                    phoneNumber: placeDetails.phoneNumber
                  }
                };
              } else {
                // Fallback to basic geocoding
                const attractionQuery = `${attraction.name}, ${day.overnightLocation}`;
                const attractionCoords = await geocodeLocation(attractionQuery);
                
                return {
                  ...attraction,
                  coordinates: {
                    lat: attractionCoords.lat,
                    lng: attractionCoords.lng
                  }
                };
              }
            } catch (error) {
              console.warn(`Failed to get place details for ${attraction.name}:`, error);
              // Fallback: place near overnight location with small offset
              const overnightCoords = geocodedLocations.get(day.overnightLocation);
              return {
                ...attraction,
                coordinates: overnightCoords ? {
                  lat: overnightCoords.lat + (Math.random() - 0.5) * 0.01,
                  lng: overnightCoords.lng + (Math.random() - 0.5) * 0.01
                } : null
              };
            }
          })
        );

        return {
          ...day,
          route: {
            ...day.route,
            fromCoordinates: geocodedLocations.get(day.route.from),
            toCoordinates: geocodedLocations.get(day.route.to),
          },
          overnightCoordinates: geocodedLocations.get(day.overnightLocation),
          attractions: geocodedAttractions
        };
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
