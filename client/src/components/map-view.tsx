import { useEffect, useRef } from "react";
import { MapPin, Camera, Bed, ZoomIn, ZoomOut, Maximize } from "lucide-react";
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
}

export function MapView({ itinerary, isLoading }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize Google Map
    const initMap = () => {
      if (!mapRef.current) return;

      googleMapRef.current = new window.google.maps.Map(mapRef.current, {
        zoom: 6,
        center: { lat: 37.7749, lng: -122.4194 }, // Default to San Francisco
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
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

    // Clear existing markers and polylines
    // Note: In a production app, you'd want to store references to markers/polylines to clear them properly

    const bounds = new window.google.maps.LatLngBounds();
    const markers: any[] = [];

    // Create route polyline coordinates
    const routeCoordinates: any[] = [];

    // Add start location to route coordinates first
    if (itinerary.days.length > 0 && itinerary.days[0].route?.fromCoordinates) {
      routeCoordinates.push(new window.google.maps.LatLng(
        itinerary.days[0].route.fromCoordinates.lat, 
        itinerary.days[0].route.fromCoordinates.lng
      ));
    }

    itinerary.days.forEach((day, index) => {
      // Add markers for overnight locations
      if (day.overnightCoordinates) {
        const marker = new window.google.maps.Marker({
          position: { lat: day.overnightCoordinates.lat, lng: day.overnightCoordinates.lng },
          map: googleMapRef.current,
          title: `Day ${day.dayNumber}: ${day.overnightLocation}`,
          // Use default Google Maps pin - no custom icon for better performance
        });

        markers.push(marker);
        bounds.extend(marker.getPosition()!);
        
        routeCoordinates.push(new window.google.maps.LatLng(day.overnightCoordinates.lat, day.overnightCoordinates.lng));
      }

      // Add markers for route start/end if available
      if (index === 0 && day.route.fromCoordinates) {
        const startMarker = new window.google.maps.Marker({
          position: { lat: day.route.fromCoordinates.lat, lng: day.route.fromCoordinates.lng },
          map: googleMapRef.current,
          title: `Start: ${day.route.from}`,
          label: 'A', // Use Google's built-in letter labels
        });
        markers.push(startMarker);
        bounds.extend(startMarker.getPosition()!);
      }

      if (index === itinerary.days.length - 1 && day.route.toCoordinates) {
        const endMarker = new window.google.maps.Marker({
          position: { lat: day.route.toCoordinates.lat, lng: day.route.toCoordinates.lng },
          map: googleMapRef.current,
          title: `End: ${day.route.to}`,
          label: 'B', // Use Google's built-in letter labels
        });
        markers.push(endMarker);
        bounds.extend(endMarker.getPosition()!);
      }
    });

    // Use Routes API for accurate driving routes
    if (routeCoordinates.length > 1) {
      // Create waypoints for Routes API
      const waypoints = routeCoordinates.slice(1, -1).map(coord => ({
        location: {
          latLng: {
            latitude: coord.lat(),
            longitude: coord.lng()
          }
        },
        via: false
      }));

      const routeRequest = {
        origin: {
          location: {
            latLng: {
              latitude: routeCoordinates[0].lat(),
              longitude: routeCoordinates[0].lng()
            }
          }
        },
        destination: {
          location: {
            latLng: {
              latitude: routeCoordinates[routeCoordinates.length - 1].lat(),
              longitude: routeCoordinates[routeCoordinates.length - 1].lng()
            }
          }
        },
        intermediates: waypoints,
        travelMode: 'DRIVE',
        routingPreference: 'TRAFFIC_UNAWARE',
        computeAlternativeRoutes: false,
        routeModifiers: {
          avoidTolls: false,
          avoidHighways: false,
          avoidFerries: false
        }
      };

      // Call Routes API through our backend
      fetch('/api/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(routeRequest)
      })
      .then(response => response.json())
      .then(data => {
        if (data.routes && data.routes.length > 0) {
          // Decode the polyline and display it
          const route = data.routes[0];
          if (route.polyline && route.polyline.encodedPolyline) {
            const decodedPath = window.google.maps.geometry.encoding.decodePath(route.polyline.encodedPolyline);
            
            new window.google.maps.Polyline({
              path: decodedPath,
              geodesic: true,
              strokeColor: '#4285F4',
              strokeOpacity: 0.8,
              strokeWeight: 4,
              map: googleMapRef.current,
            });
          }
        }
      })
      .catch(error => {
        console.log('Routes API not available, using simple polyline');
        // Fallback to simple polyline
        new window.google.maps.Polyline({
          path: routeCoordinates,
          geodesic: true,
          strokeColor: '#4285F4',
          strokeOpacity: 0.8,
          strokeWeight: 3,
          map: googleMapRef.current,
        });
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

  }, [itinerary]);

  if (!itinerary && !isLoading) {
    return (
      <div className="flex-1 relative">
        <div className="w-full h-full bg-gray-100">
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <MapPin className="h-16 w-16 mb-4 text-gray-300 mx-auto" />
              <h3 className="text-lg font-medium mb-2" data-testid="text-empty-state">Ready to Plan Your Adventure?</h3>
              <p className="text-sm" data-testid="text-empty-instructions">Fill out the trip details and click "Generate Trip Plan" to see your route</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
    <div className="flex-1 relative">
      {isLoading && <LoadingState />}
      
      {/* Google Maps Container */}
      <div ref={mapRef} className="w-full h-full bg-gray-100" data-testid="map-container" />

      {/* Map Controls */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2 space-y-2" data-testid="map-controls">
        <button 
          className="block w-8 h-8 text-gray-600 hover:text-primary hover:bg-gray-50 rounded flex items-center justify-center"
          onClick={() => {
            if (googleMapRef.current) {
              googleMapRef.current.setZoom(googleMapRef.current.getZoom()! + 1);
            }
          }}
          data-testid="button-zoom-in"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button 
          className="block w-8 h-8 text-gray-600 hover:text-primary hover:bg-gray-50 rounded flex items-center justify-center"
          onClick={() => {
            if (googleMapRef.current) {
              googleMapRef.current.setZoom(googleMapRef.current.getZoom()! - 1);
            }
          }}
          data-testid="button-zoom-out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button 
          className="block w-8 h-8 text-gray-600 hover:text-primary hover:bg-gray-50 rounded flex items-center justify-center"
          data-testid="button-fullscreen"
        >
          <Maximize className="h-4 w-4" />
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
