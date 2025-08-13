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
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_FRONTEND_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
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

    itinerary.days.forEach((day, index) => {
      // Add markers for overnight locations
      if (day.overnightCoordinates) {
        const marker = new window.google.maps.Marker({
          position: { lat: day.overnightCoordinates.lat, lng: day.overnightCoordinates.lng },
          map: googleMapRef.current,
          title: `Day ${day.dayNumber}: ${day.overnightLocation}`,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#10b981',
            fillOpacity: 1,
            strokeColor: '#059669',
            strokeWeight: 2,
          },
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
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#3b82f6',
            fillOpacity: 1,
            strokeColor: '#2563eb',
            strokeWeight: 2,
          },
        });
        markers.push(startMarker);
        bounds.extend(startMarker.getPosition()!);
      }

      if (index === itinerary.days.length - 1 && day.route.toCoordinates) {
        const endMarker = new window.google.maps.Marker({
          position: { lat: day.route.toCoordinates.lat, lng: day.route.toCoordinates.lng },
          map: googleMapRef.current,
          title: `End: ${day.route.to}`,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#ef4444',
            fillOpacity: 1,
            strokeColor: '#dc2626',
            strokeWeight: 2,
          },
        });
        markers.push(endMarker);
        bounds.extend(endMarker.getPosition()!);
      }
    });

    // Create route polyline
    if (routeCoordinates.length > 1) {
      new window.google.maps.Polyline({
        path: routeCoordinates,
        geodesic: true,
        strokeColor: '#3b82f6',
        strokeOpacity: 1.0,
        strokeWeight: 3,
        map: googleMapRef.current,
      });
    }

    // Fit map to show all markers
    if (!bounds.isEmpty()) {
      googleMapRef.current.fitBounds(bounds);
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
