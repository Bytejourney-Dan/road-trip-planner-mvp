import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Map, List, Route as RouteIcon, ArrowLeft, Menu, X } from "lucide-react";
import { MapView } from "@/components/map-view";
import { ItineraryView } from "@/components/itinerary-view";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Trip } from "@/types/trip";

type ViewMode = "map" | "itinerary";

export default function Results() {
  const [, navigate] = useLocation();
  const [activeView, setActiveView] = useState<ViewMode>("map");
  const [completedTrip, setCompletedTrip] = useState<Trip | undefined>();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load trip data from session storage
    const tripData = sessionStorage.getItem('currentTrip');
    if (tripData) {
      try {
        const trip = JSON.parse(tripData);
        setCompletedTrip(trip);
      } catch (error) {
        console.error('Failed to parse trip data:', error);
        navigate('/');
      }
    } else {
      // No trip data, redirect to landing
      navigate('/');
    }
  }, [navigate]);

  const handleItineraryUpdate = (updatedItinerary: any) => {
    if (completedTrip) {
      const updatedTrip = {
        ...completedTrip,
        itinerary: updatedItinerary
      };
      setCompletedTrip(updatedTrip);
      
      // Update session storage
      sessionStorage.setItem('currentTrip', JSON.stringify(updatedTrip));
      
      toast({
        title: "Itinerary Updated!",
        description: "Your trip has been updated with your custom locations.",
      });
    }
  };

  const handleStartOver = () => {
    sessionStorage.removeItem('currentTrip');
    navigate('/');
  };

  if (!completedTrip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="glass-strong rounded-2xl p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your trip...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="glass rounded-none border-b border-white/20 z-50">
        <div className="px-4 md:px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Left Side - Logo and Back Button */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleStartOver}
                className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200"
                data-testid="button-back-to-landing"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">New Trip</span>
              </Button>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center animate-glow">
                  <RouteIcon className="h-4 w-4 md:h-5 md:w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg md:text-xl font-bold text-gray-900" data-testid="text-app-title">
                    Your Road Trip
                  </h1>
                  <p className="text-xs text-gray-600 hidden sm:block" data-testid="text-trip-summary">
                    {completedTrip.itinerary?.totalDays} days • {completedTrip.itinerary?.totalAttractions} attractions
                  </p>
                </div>
              </div>
            </div>
            
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2"
                data-testid="button-mobile-menu"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
            
            {/* Desktop Tab Switches */}
            <div className="hidden md:flex bg-white/20 rounded-xl p-1">
              <Button
                variant="ghost"
                size="sm"
                className={`rounded-lg transition-all duration-300 ${
                  activeView === "map"
                    ? "bg-white text-gray-900 shadow-md"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                }`}
                onClick={() => setActiveView("map")}
                data-testid="tab-map"
              >
                <Map className="h-4 w-4 mr-2" />
                Map
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`rounded-lg transition-all duration-300 ${
                  activeView === "itinerary"
                    ? "bg-white text-gray-900 shadow-md"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                }`}
                onClick={() => setActiveView("itinerary")}
                data-testid="tab-itinerary"
              >
                <List className="h-4 w-4 mr-2" />
                Itinerary
              </Button>
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden glass-strong border-t border-white/20 px-4 py-3">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="ghost"
                size="sm"
                className={`rounded-lg transition-all duration-300 flex flex-col items-center space-y-1 h-auto py-3 ${
                  activeView === "map"
                    ? "bg-white text-gray-900 shadow-md"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                }`}
                onClick={() => {
                  setActiveView("map");
                  setIsMobileMenuOpen(false);
                }}
                data-testid="tab-mobile-map"
              >
                <Map className="h-5 w-5" />
                <span className="text-xs">Map</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`rounded-lg transition-all duration-300 flex flex-col items-center space-y-1 h-auto py-3 ${
                  activeView === "itinerary"
                    ? "bg-white text-gray-900 shadow-md"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                }`}
                onClick={() => {
                  setActiveView("itinerary");
                  setIsMobileMenuOpen(false);
                }}
                data-testid="tab-mobile-itinerary"
              >
                <List className="h-5 w-5" />
                <span className="text-xs">Itinerary</span>
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="flex-1 relative">
        {activeView === "map" ? (
          <MapView 
            key={`map-${completedTrip.id}-${Date.now()}`}
            itinerary={completedTrip.itinerary}
            isLoading={false}
            onItineraryUpdate={handleItineraryUpdate}
          />
        ) : (
          <div className="h-full p-4 md:p-6 overflow-y-auto glass-scrollbar">
            <ItineraryView 
              itinerary={completedTrip.itinerary}
            />
          </div>
        )}
      </div>
    </div>
  );
}