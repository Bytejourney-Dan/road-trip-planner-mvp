import { useEffect, useRef, useState } from "react";
import { MapPin, Camera, Bed, ZoomIn, ZoomOut, Maximize, X, Navigation, Clock, CheckCircle, Plus, Trash2, RefreshCw } from "lucide-react";
import { TripItinerary } from "@/types/trip";
import { LoadingState } from "./loading-state";

declare global {
  interface Window {
    google: any;
  }
}

interface MapViewProps {
  itinerary?: TripItinerary;
  isLoading: boolean;
  onItineraryUpdate?: (updatedItinerary: TripItinerary) => void;
}

interface LocationInfo {
  type: 'start' | 'overnight' | 'end' | 'attraction' | 'map-click';
  name: string;
  dayNumber?: number;
  date?: string;
  description?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  attractions?: Array<{ name: string; description: string }>;
  placeDetails?: {
    placeId: string;
    formattedAddress: string;
    rating?: number;
    userRatingsTotal?: number;
    photos?: string[];
    types?: string[];
    website?: string;
    phoneNumber?: string;
  };
  route?: {
    from: string;
    to: string;
    distance: number;
    drivingTime: string;
    departureTime: string;
    arrivalTime: string;
  };
}

export function MapView({ itinerary, isLoading, onItineraryUpdate }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any | null>(null);
  const markersRef = useRef<any[]>([]);
  const polylinesRef = useRef<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationInfo | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [customAttractions, setCustomAttractions] = useState<Map<number, any[]>>(new Map());
  const [pendingChanges, setPendingChanges] = useState(false);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize Google Map
    const initMap = () => {
      if (!mapRef.current) return;

      console.log('Initializing Google Map...');
      googleMapRef.current = new window.google.maps.Map(mapRef.current, {
        zoom: 5,
        center: { lat: 39.8283, lng: -98.5795 }, // Center of USA for better initial view
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#e9e9e9" }, { lightness: 17 }]
          },
          {
            featureType: "landscape",
            elementType: "geometry",
            stylers: [{ color: "#f5f5f5" }, { lightness: 20 }]
          }
        ]
      });

      // Add click listener for adding new attractions in edit mode or showing location details
      googleMapRef.current.addListener('click', (e: any) => {
        if (isEditMode) {
          handleMapClick(e.latLng);
        } else {
          handleMapClickForLocationDetails(e.latLng);
        }
      });
    };

    // Load Google Maps script if not already loaded
    if (!window.google) {
      // Fetch API key from server
      fetch('/api/config/maps-key')
        .then(response => response.json())
        .then(config => {
          
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${config.apiKey}&libraries=places,geometry`;
          script.async = true;
          script.defer = true;
          script.onload = initMap;
          document.head.appendChild(script);
        })
        .catch(error => {
          console.error('Failed to fetch Google Maps API key:', error);
        });
    } else {
      initMap();
    }
  }, []);

  useEffect(() => {
    if (!googleMapRef.current || !itinerary) return;

    // Clear selected location when new itinerary loads
    setSelectedLocation(null);

    // Add a small delay to ensure the map is ready
    const timer = setTimeout(() => {
      // Clear existing markers and polylines
      markersRef.current.forEach(marker => marker.setMap(null));
      polylinesRef.current.forEach(polyline => polyline.setMap(null));
      markersRef.current = [];
      polylinesRef.current = [];

      updateMapWithItinerary();
    }, 50);

    return () => clearTimeout(timer);
  }, [itinerary]);

  // Handle map click to add new attraction
  const handleMapClick = async (latLng: any) => {
    if (!isEditMode || !itinerary) return;

    try {
      // Get place details from coordinates using reverse geocoding
      const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latLng.lat()},${latLng.lng()}&key=${await fetch('/api/config/maps-key').then(r => r.json()).then(d => d.apiKey)}`);
      const data = await response.json();
      
      let placeName = "Custom Location";
      if (data.results && data.results.length > 0) {
        placeName = data.results[0].formatted_address || data.results[0].name || "Custom Location";
      }

      // Find closest day to add the attraction to
      let closestDay = 1;
      let minDistance = Infinity;
      
      itinerary.days.forEach((day) => {
        if (day.overnightCoordinates) {
          const distance = Math.sqrt(
            Math.pow(latLng.lat() - day.overnightCoordinates.lat, 2) +
            Math.pow(latLng.lng() - day.overnightCoordinates.lng, 2)
          );
          if (distance < minDistance) {
            minDistance = distance;
            closestDay = day.dayNumber;
          }
        }
      });

      const newAttraction = {
        name: placeName,
        description: "Custom added location",
        coordinates: {
          lat: latLng.lat(),
          lng: latLng.lng()
        },
        isCustom: true
      };

      // Add to custom attractions for the closest day
      const dayAttractions = customAttractions.get(closestDay) || [];
      dayAttractions.push(newAttraction);
      setCustomAttractions(new Map(customAttractions.set(closestDay, dayAttractions)));
      setPendingChanges(true);

      // Update map immediately
      updateMapWithItinerary();
    } catch (error) {
      console.error("Error adding custom attraction:", error);
    }
  };

  // Handle map click to show location details with add to itinerary option
  const handleMapClickForLocationDetails = async (latLng: any) => {
    if (!itinerary) return;

    try {
      // Get place details from coordinates using reverse geocoding
      const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latLng.lat()},${latLng.lng()}&key=${await fetch('/api/config/maps-key').then(r => r.json()).then(d => d.apiKey)}`);
      const data = await response.json();
      
      let placeName = "Custom Location";
      if (data.results && data.results.length > 0) {
        placeName = data.results[0].formatted_address || data.results[0].name || "Custom Location";
      }

      setSelectedLocation({
        type: 'map-click',
        name: placeName,
        coordinates: {
          lat: latLng.lat(),
          lng: latLng.lng()
        }
      });

    } catch (error) {
      console.error("Error getting location details:", error);
    }
  };

  // Handle adding a location to a specific day
  const handleAddToItinerary = (dayNumber: number, location: any) => {
    if (!location.coordinates) return;

    const newAttraction = {
      name: location.name,
      description: "Added from map",
      coordinates: {
        lat: location.coordinates.lat,
        lng: location.coordinates.lng
      },
      isCustom: true
    };

    // Add to custom attractions for the selected day
    const dayAttractions = customAttractions.get(dayNumber) || [];
    dayAttractions.push(newAttraction);
    setCustomAttractions(new Map(customAttractions.set(dayNumber, dayAttractions)));
    setPendingChanges(true);
    setSelectedLocation(null);
  };

  // Remove attraction
  const removeAttraction = (dayNumber: number, attractionIndex: number, isCustom: boolean) => {
    if (isCustom) {
      const dayAttractions = customAttractions.get(dayNumber) || [];
      dayAttractions.splice(attractionIndex, 1);
      setCustomAttractions(new Map(customAttractions.set(dayNumber, dayAttractions)));
    } else {
      // For original attractions, we'll mark them as removed
      const dayAttractions = customAttractions.get(dayNumber) || [];
      const removedAttraction = { ...itinerary!.days[dayNumber - 1].attractions[attractionIndex], isRemoved: true };
      dayAttractions.push(removedAttraction);
      setCustomAttractions(new Map(customAttractions.set(dayNumber, dayAttractions)));
    }
    setPendingChanges(true);
    updateMapWithItinerary();
  };

  // Update itinerary with custom changes
  const updateItinerary = async () => {
    if (!itinerary || !onItineraryUpdate) return;

    const updatedItinerary = { ...itinerary };
    
    // Apply custom changes to each day
    updatedItinerary.days = itinerary.days.map((day) => {
      const customDayAttractions = customAttractions.get(day.dayNumber) || [];
      
      // Filter out removed attractions and add custom ones
      const originalAttractions = day.attractions.filter((_, index) => {
        return !customDayAttractions.some(custom => custom.isRemoved && custom.name === day.attractions[index].name);
      });
      
      const newCustomAttractions = customDayAttractions.filter(custom => !custom.isRemoved);
      
      return {
        ...day,
        attractions: [...originalAttractions, ...newCustomAttractions]
      };
    });

    // Recalculate totals
    updatedItinerary.totalAttractions = updatedItinerary.days.reduce((total, day) => total + day.attractions.length, 0);

    onItineraryUpdate(updatedItinerary);
    setPendingChanges(false);
    setIsEditMode(false);
  };

  const updateMapWithItinerary = () => {
    if (!googleMapRef.current || !itinerary) return;

    const bounds = new window.google.maps.LatLngBounds();
    const markers: any[] = [];

    // Create route polyline coordinates including attractions as waypoints
    const routeCoordinates: any[] = [];

    // Add start location to route coordinates first
    if (itinerary.days.length > 0 && itinerary.days[0].route?.fromCoordinates) {
      routeCoordinates.push(new window.google.maps.LatLng(
        itinerary.days[0].route.fromCoordinates.lat, 
        itinerary.days[0].route.fromCoordinates.lng
      ));
    }

    itinerary.days.forEach((day, index) => {
      // Get all attractions for this day (original + custom)
      const allDayAttractions = [...day.attractions];
      const customDayAttractions = customAttractions.get(day.dayNumber) || [];
      
      // Add custom attractions and filter out removed ones
      customDayAttractions.forEach((custom) => {
        if (!custom.isRemoved) {
          allDayAttractions.push(custom);
        }
      });

      // Filter out any attractions marked as removed
      const activeAttractions = allDayAttractions.filter((attraction) => {
        return !customDayAttractions.some(custom => 
          custom.isRemoved && custom.name === attraction.name
        );
      });

      // Don't add attractions to route coordinates - they are just markers, not waypoints
      // The route should only connect overnight stops as per user requirements

      // Add markers for overnight locations
      if (day.overnightCoordinates) {
        const marker = new window.google.maps.Marker({
          position: { lat: day.overnightCoordinates.lat, lng: day.overnightCoordinates.lng },
          map: googleMapRef.current,
          title: `Day ${day.dayNumber}: ${day.overnightLocation}`,
          icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
            scaledSize: new window.google.maps.Size(32, 32),
            anchor: new window.google.maps.Point(16, 32)
          }
        });

        // Add click handler for overnight location
        marker.addListener('click', () => {
          setSelectedLocation({
            type: 'overnight',
            name: day.overnightLocation,
            dayNumber: day.dayNumber,
            date: day.date,
            attractions: day.attractions,
            route: day.route
          });
        });

        markers.push(marker);
        markersRef.current.push(marker);
        bounds.extend(marker.getPosition()!);
        
        // Add overnight location to route coordinates (only overnight stops in route)
        routeCoordinates.push(new window.google.maps.LatLng(day.overnightCoordinates.lat, day.overnightCoordinates.lng));
      }

      // Add markers for route start/end if available (without A/B labels)
      if (index === 0 && day.route.fromCoordinates) {
        const startMarker = new window.google.maps.Marker({
          position: { lat: day.route.fromCoordinates.lat, lng: day.route.fromCoordinates.lng },
          map: googleMapRef.current,
          title: `Start: ${day.route.from}`,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10" fill="#10b981" stroke="#fff" stroke-width="2"/>
                <circle cx="12" cy="12" r="3" fill="#fff"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(24, 24),
            anchor: new window.google.maps.Point(12, 12)
          }
        });

        // Add click handler for start location
        startMarker.addListener('click', () => {
          setSelectedLocation({
            type: 'start',
            name: day.route.from,
            dayNumber: day.dayNumber,
            date: day.date,
            route: day.route
          });
        });

        markers.push(startMarker);
        markersRef.current.push(startMarker);
        bounds.extend(startMarker.getPosition()!);
      }

      if (index === itinerary.days.length - 1 && day.route.toCoordinates) {
        const endMarker = new window.google.maps.Marker({
          position: { lat: day.route.toCoordinates.lat, lng: day.route.toCoordinates.lng },
          map: googleMapRef.current,
          title: `End: ${day.route.to}`,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10" fill="#dc2626" stroke="#fff" stroke-width="2"/>
                <circle cx="12" cy="12" r="3" fill="#fff"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(24, 24),
            anchor: new window.google.maps.Point(12, 12)
          }
        });

        // Add click handler for end location
        endMarker.addListener('click', () => {
          setSelectedLocation({
            type: 'end',
            name: day.route.to,
            dayNumber: day.dayNumber,
            date: day.date
          });
        });

        markers.push(endMarker);
        markersRef.current.push(endMarker);
        bounds.extend(endMarker.getPosition()!);
      }

      // Add markers for attractions (including custom ones)
      if (activeAttractions && activeAttractions.length > 0) {
        activeAttractions.forEach((attraction, attractionIndex) => {
          // Use actual coordinates if available, otherwise fallback to near overnight location
          let attractionPosition;
          
          if (attraction.coordinates) {
            attractionPosition = {
              lat: attraction.coordinates.lat,
              lng: attraction.coordinates.lng
            };
          } else if (day.overnightCoordinates) {
            // Fallback: place near overnight location with small offset
            attractionPosition = {
              lat: day.overnightCoordinates.lat + (Math.random() - 0.5) * 0.01,
              lng: day.overnightCoordinates.lng + (Math.random() - 0.5) * 0.01
            };
          } else {
            // Skip if no coordinates available
            return;
          }

          const attractionMarker = new window.google.maps.Marker({
            position: attractionPosition,
            map: googleMapRef.current,
            title: `${attraction.name}`,
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="8" fill="#f59e0b" stroke="#fff" stroke-width="2"/>
                  <circle cx="12" cy="12" r="2" fill="#fff"/>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(20, 20),
              anchor: new window.google.maps.Point(10, 10)
            }
          });

          // Add click handler for attraction
          attractionMarker.addListener('click', () => {
            setSelectedLocation({
              type: 'attraction',
              name: attraction.name,
              description: attraction.description,
              dayNumber: day.dayNumber,
              date: day.date,
              placeDetails: (attraction as any).placeDetails
            });
          });

          markers.push(attractionMarker);
          markersRef.current.push(attractionMarker);
          bounds.extend(attractionMarker.getPosition()!);
        });
      }
    });

    // Use Routes API for accurate driving routes
    if (routeCoordinates.length > 1) {
      // Convert route coordinates to stops format for the backend
      const stops = routeCoordinates.map((coord, index) => ({
        name: `Stop ${index + 1}`,
        lat: coord.lat(),
        lng: coord.lng()
      }));

      const routeRequest = {
        stops: stops
      };

      // Call Routes API through our backend
      fetch('/api/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(routeRequest)
      })
      .then(response => response.json())
      .then(data => {
        if (data.polyline) {
          // Decode the polyline and display it
          const decodedPath = window.google.maps.geometry.encoding.decodePath(data.polyline);
          
          const polyline = new window.google.maps.Polyline({
            path: decodedPath,
            geodesic: true,
            strokeColor: '#4285F4',
            strokeOpacity: 0.8,
            strokeWeight: 4,
            map: googleMapRef.current,
          });
          polylinesRef.current.push(polyline);
        }
      })
      .catch(error => {
        console.log('Routes API not available, using simple polyline');
        // Fallback to simple polyline
        const polyline = new window.google.maps.Polyline({
          path: routeCoordinates,
          geodesic: true,
          strokeColor: '#4285F4',
          strokeOpacity: 0.8,
          strokeWeight: 3,
          map: googleMapRef.current,
        });
        polylinesRef.current.push(polyline);
      });
    }

    // Fit map to show all markers immediately
    if (!bounds.isEmpty()) {
      googleMapRef.current.fitBounds(bounds, 50); // Add 50px padding
      // Limit zoom level for better overview
      const listener = window.google.maps.event.addListenerOnce(googleMapRef.current, 'bounds_changed', () => {
        if (googleMapRef.current.getZoom() > 12) {
          googleMapRef.current.setZoom(12);
        }
      });
    }
  };

  // Always show the map, but with overlay message when no trip is planned
  const showEmptyState = !itinerary && !isLoading;

  // Show message if geocoding failed but itinerary exists
  if (itinerary && (itinerary as any).geocodingStatus === 'failed') {
    return (
      <div className="flex-1 relative">
        <div className="w-full h-full bg-gray-100">
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500 max-w-md mx-auto p-6">
              <MapPin className="h-16 w-16 mb-4 text-gray-300 mx-auto" />
              <h3 className="text-lg font-medium mb-2" data-testid="text-map-unavailable">Map Display Unavailable</h3>
              <p className="text-sm mb-4" data-testid="text-map-explanation">
                Your itinerary was generated successfully, but the map cannot be displayed due to Google Maps API configuration issues.
              </p>
              <p className="text-xs text-gray-400">
                Check the Itinerary Details tab to view your complete trip plan.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {isLoading && <LoadingState />}
      
      {/* Google Maps Container - always visible */}
      <div 
        ref={mapRef} 
        className="w-full h-full bg-gray-100" 
        data-testid="map-container" 
      />

      {/* Empty State Overlay - only when no trip is planned */}
      {showEmptyState && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
          <div className="glass-strong rounded-2xl p-6 text-center max-w-sm animate-fade-in">
            <MapPin className="h-12 w-12 mb-3 text-blue-400 mx-auto animate-float" />
            <h3 className="text-base font-semibold mb-2 text-gray-900" data-testid="text-empty-state">Ready to Plan Your Adventure?</h3>
            <p className="text-sm text-gray-700" data-testid="text-empty-instructions">Fill out the trip details to see your route here</p>
          </div>
        </div>
      )}

      {/* Trip Summary Panel - appears when trip is generated */}
      {itinerary && (
        <div className="absolute top-4 left-4 z-50 animate-slide-up" data-testid="trip-summary">
          <div className="glass-strong rounded-2xl p-4 max-w-xs">
            <div className="flex items-center space-x-2 mb-3">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              <h3 className="font-semibold text-gray-900">Trip Summary</h3>
            </div>
            <div className="text-sm text-gray-700 space-y-2">
              <div data-testid="summary-days" className="flex items-center">
                <span className="font-medium">{itinerary.totalDays}-day</span> 
                <span className="ml-1">road trip</span>
              </div>
              <div data-testid="summary-distance" className="flex items-center">
                <span className="font-medium">{itinerary.totalDistance} miles</span>
                <span className="ml-1">total distance</span>
              </div>
              <div data-testid="summary-stops" className="flex items-center">
                <span className="font-medium">{itinerary.days.length} stops</span>
                <span className="ml-1">planned</span>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Floating Location Info Panel */}
      {selectedLocation && (
        <div className="absolute top-4 right-4 w-80 max-h-[calc(100%-2rem)] z-50 animate-slide-up" data-testid="location-info-panel">
          <div className="glass-strong rounded-2xl p-6 glass-scrollbar overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900" data-testid="text-location-title">
                {selectedLocation.type === 'start' && '🚀 Trip Start'}
                {selectedLocation.type === 'overnight' && `🛏️ Day ${selectedLocation.dayNumber} Stop`}
                {selectedLocation.type === 'end' && '🏁 Trip End'}
                {selectedLocation.type === 'attraction' && `📍 Attraction`}
              </h3>
              <button
                onClick={() => setSelectedLocation(null)}
                className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200 glass-hover"
                data-testid="button-close-panel"
              >
                <X className="h-4 w-4 text-gray-600" />
              </button>
            </div>

            {/* Location Name */}
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <MapPin className="h-5 w-5 text-blue-500 mr-2" />
                <span className="font-semibold text-gray-900" data-testid="text-location-name">{selectedLocation.name}</span>
              </div>
              {selectedLocation.date && (
                <p className="text-sm text-gray-600 pl-7" data-testid="text-location-date">{selectedLocation.date}</p>
              )}
              {selectedLocation.description && selectedLocation.type === 'attraction' && (
                <p className="text-sm text-gray-700 pl-7 mt-2" data-testid="text-attraction-description">{selectedLocation.description}</p>
              )}
            </div>

            {/* Places API Details for Attractions */}
            {selectedLocation.type === 'attraction' && selectedLocation.placeDetails && (
              <div className="mb-4">
                {/* Address */}
                {selectedLocation.placeDetails.formattedAddress && (
                  <div className="mb-3 p-3 glass-light rounded-xl">
                    <div className="flex items-center mb-1">
                      <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-600">Address</span>
                    </div>
                    <p className="text-sm text-gray-800 pl-6" data-testid="text-place-address">
                      {selectedLocation.placeDetails.formattedAddress}
                    </p>
                  </div>
                )}

                {/* Rating */}
                {selectedLocation.placeDetails.rating && (
                  <div className="mb-3 p-3 glass-light rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-yellow-500 text-lg mr-2">⭐</span>
                        <span className="font-semibold text-gray-900" data-testid="text-place-rating">
                          {selectedLocation.placeDetails.rating.toFixed(1)}
                        </span>
                        {selectedLocation.placeDetails.userRatingsTotal && (
                          <span className="text-sm text-gray-600 ml-2" data-testid="text-place-reviews">
                            ({selectedLocation.placeDetails.userRatingsTotal} reviews)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Photos */}
                {selectedLocation.placeDetails.photos && selectedLocation.placeDetails.photos.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Photos</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedLocation.placeDetails.photos.slice(0, 2).map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`${selectedLocation.name} photo ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg"
                          data-testid={`place-photo-${index}`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact Info */}
                {(selectedLocation.placeDetails.website || selectedLocation.placeDetails.phoneNumber) && (
                  <div className="mb-3 p-3 glass-light rounded-xl">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Contact</h4>
                    <div className="space-y-2">
                      {selectedLocation.placeDetails.phoneNumber && (
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600 w-16">Phone:</span>
                          <span className="text-sm text-gray-800" data-testid="text-place-phone">
                            {selectedLocation.placeDetails.phoneNumber}
                          </span>
                        </div>
                      )}
                      {selectedLocation.placeDetails.website && (
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600 w-16">Website:</span>
                          <a
                            href={selectedLocation.placeDetails.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 underline"
                            data-testid="link-place-website"
                          >
                            Visit website
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Route Information */}
            {selectedLocation.route && (
              <div className="mb-4 p-4 glass-light rounded-xl">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Navigation className="h-4 w-4 mr-2 text-green-500" />
                  Route Details
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-1 gap-2" data-testid="text-route-from-to">
                    <div className="flex items-center">
                      <span className="text-gray-600 w-12">From:</span> 
                      <span className="font-medium">{selectedLocation.route.from}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-600 w-12">To:</span> 
                      <span className="font-medium">{selectedLocation.route.to}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-white/20">
                    <span data-testid="text-route-distance" className="flex items-center">
                      <span className="text-gray-600">Distance:</span>
                      <span className="font-semibold ml-1">{selectedLocation.route.distance} mi</span>
                    </span>
                    <span data-testid="text-route-time" className="flex items-center">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-semibold ml-1">{selectedLocation.route.drivingTime}</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-white/20">
                    <span data-testid="text-departure-time" className="flex items-center text-xs">
                      <Clock className="h-3 w-3 mr-1 text-orange-500" />
                      Depart: <span className="font-medium ml-1">{selectedLocation.route.departureTime}</span>
                    </span>
                    <span data-testid="text-arrival-time" className="flex items-center text-xs">
                      Arrive: <span className="font-medium ml-1">{selectedLocation.route.arrivalTime}</span>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Attractions */}
            {selectedLocation.attractions && selectedLocation.attractions.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Camera className="h-4 w-4 mr-2 text-purple-500" />
                  Nearby Attractions
                </h4>
                <div className="space-y-3">
                  {selectedLocation.attractions.map((attraction, index) => (
                    <div key={index} className="p-3 glass-light rounded-xl glass-hover cursor-pointer" data-testid={`attraction-${index}`}>
                      <h5 className="font-semibold text-gray-900 mb-1" data-testid={`attraction-name-${index}`}>
                        {attraction.name}
                      </h5>
                      <p className="text-sm text-gray-700" data-testid={`attraction-description-${index}`}>
                        {attraction.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Delete Attraction Button (Edit Mode) */}
            {isEditMode && selectedLocation.type === 'attraction' && selectedLocation.dayNumber && (
              <div className="mb-4">
                <button
                  onClick={() => {
                    // Find if this is a custom attraction
                    const customDayAttractions = customAttractions.get(selectedLocation.dayNumber!) || [];
                    const isCustomAttraction = customDayAttractions.some(custom => 
                      custom.name === selectedLocation.name && !custom.isRemoved
                    );
                    
                    // Find the attraction index in the original day attractions
                    const originalAttractions = itinerary?.days.find(d => d.dayNumber === selectedLocation.dayNumber)?.attractions || [];
                    const originalIndex = originalAttractions.findIndex(attr => attr.name === selectedLocation.name);
                    
                    if (isCustomAttraction) {
                      const customIndex = customDayAttractions.findIndex(custom => 
                        custom.name === selectedLocation.name && !custom.isRemoved
                      );
                      removeAttraction(selectedLocation.dayNumber!, customIndex, true);
                    } else if (originalIndex >= 0) {
                      removeAttraction(selectedLocation.dayNumber!, originalIndex, false);
                    }
                    
                    setSelectedLocation(null);
                  }}
                  className="w-full px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all duration-200 flex items-center justify-center space-x-2"
                  data-testid="button-delete-attraction"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Remove Attraction</span>
                </button>
              </div>
            )}

            {/* Add to Itinerary option for map-clicked locations */}
            {selectedLocation.type === 'map-click' && (
              <div className="mt-4 p-3 glass-light rounded-xl">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Add to Itinerary</h4>
                <p className="text-sm text-gray-600 mb-3">Choose which day to add this location to:</p>
                <div className="space-y-2">
                  {itinerary?.days.map((day) => (
                    <button
                      key={day.dayNumber}
                      onClick={() => handleAddToItinerary(day.dayNumber, selectedLocation)}
                      className="w-full p-2 text-left bg-white/50 hover:bg-white/70 rounded-lg transition-all duration-200 text-sm"
                      data-testid={`button-add-to-day-${day.dayNumber}`}
                    >
                      Day {day.dayNumber}: {day.overnightLocation}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Overnight Location Badge */}
            {selectedLocation.type === 'overnight' && (
              <div className="mt-4 p-3 glass-light rounded-xl flex items-center">
                <Bed className="h-4 w-4 text-blue-500 mr-2" />
                <span className="text-sm font-medium text-gray-800" data-testid="text-overnight-indicator">Overnight stay location</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Mode Controls - Mobile Optimized */}
      {itinerary && (
        <div className="absolute bottom-4 left-2 md:left-4 right-2 md:right-auto z-50">
          <div className="glass-strong rounded-2xl p-3 md:p-4 space-y-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center space-y-2 md:space-y-0 md:space-x-3">
              <button
                onClick={() => setIsEditMode(!isEditMode)}
                className={`px-3 md:px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 text-sm md:text-base ${
                  isEditMode 
                    ? 'bg-orange-500 text-white hover:bg-orange-600' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
                data-testid="button-toggle-edit"
              >
                <Plus className="h-4 w-4" />
                <span>{isEditMode ? 'Exit Edit' : 'Edit Locations'}</span>
              </button>
              
              {pendingChanges && (
                <button
                  onClick={updateItinerary}
                  className="px-3 md:px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-all duration-200 flex items-center justify-center space-x-2 text-sm md:text-base"
                  data-testid="button-update-itinerary"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Update Itinerary</span>
                </button>
              )}
            </div>
            
            {isEditMode && (
              <div className="text-sm text-gray-700 bg-white/50 rounded-lg p-3">
                <p className="font-medium mb-1">Edit Mode Active</p>
                <p>• Click map to add attractions</p>
                <p>• Click markers to remove</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Map Controls */}
      <div className={`absolute ${selectedLocation ? 'bottom-4 right-4' : 'top-4 right-4'} glass rounded-xl p-2 space-y-2 transition-all duration-300`} data-testid="map-controls">
        <button 
          className="block w-10 h-10 text-gray-700 hover:text-blue-600 hover:bg-white/30 rounded-lg flex items-center justify-center transition-all duration-200 glass-hover"
          onClick={() => {
            if (googleMapRef.current) {
              googleMapRef.current.setZoom(googleMapRef.current.getZoom()! + 1);
            }
          }}
          data-testid="button-zoom-in"
        >
          <ZoomIn className="h-5 w-5" />
        </button>
        <button 
          className="block w-10 h-10 text-gray-700 hover:text-blue-600 hover:bg-white/30 rounded-lg flex items-center justify-center transition-all duration-200 glass-hover"
          onClick={() => {
            if (googleMapRef.current) {
              googleMapRef.current.setZoom(googleMapRef.current.getZoom()! - 1);
            }
          }}
          data-testid="button-zoom-out"
        >
          <ZoomOut className="h-5 w-5" />
        </button>
        <button 
          className="block w-10 h-10 text-gray-700 hover:text-blue-600 hover:bg-white/30 rounded-lg flex items-center justify-center transition-all duration-200 glass-hover"
          onClick={() => {
            if (googleMapRef.current && itinerary) {
              const bounds = new window.google.maps.LatLngBounds();
              // Add all overnight locations to bounds
              itinerary.days.forEach(day => {
                if (day.overnightCoordinates) {
                  bounds.extend(new window.google.maps.LatLng(
                    day.overnightCoordinates.lat,
                    day.overnightCoordinates.lng
                  ));
                }
              });
              googleMapRef.current.fitBounds(bounds);
            }
          }}
          data-testid="button-fit-bounds"
        >
          <Maximize className="h-5 w-5" />
        </button>
      </div>

      {/* Route Legend */}
      {itinerary && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4" data-testid="route-legend">
          <h4 className="font-medium text-gray-900 mb-3">Route Legend</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span>Driving Route</span>
            </div>
            <div className="flex items-center space-x-2">
              <Bed className="h-3 w-3 text-emerald-600" />
              <span>Overnight Stay</span>
            </div>
            <div className="flex items-center space-x-2">
              <Camera className="h-3 w-3 text-red-600" />
              <span>Attraction</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
