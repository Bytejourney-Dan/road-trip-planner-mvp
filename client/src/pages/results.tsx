import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Map, List, Route as RouteIcon, ArrowLeft, MapPin } from "lucide-react";
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
  const [customAttractions, setCustomAttractions] = useState<Record<number, any[]>>({});
  const [removedAttractions, setRemovedAttractions] = useState<Record<number, number[]>>({});
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

  const handleRemoveAttraction = (dayNumber: number, attractionIndex: number, isCustom: boolean) => {
    if (isCustom) {
      // Remove custom attraction
      const currentCustomAttractions = customAttractions[dayNumber] || [];
      const updatedCustomAttractions = currentCustomAttractions.map((attraction: any, index: number) => 
        index === attractionIndex ? { ...attraction, isRemoved: true } : attraction
      );
      
      setCustomAttractions({
        ...customAttractions,
        [dayNumber]: updatedCustomAttractions
      });
    } else {
      // Mark original attraction as removed
      const currentRemoved = removedAttractions[dayNumber] || [];
      if (!currentRemoved.includes(attractionIndex)) {
        setRemovedAttractions({
          ...removedAttractions,
          [dayNumber]: [...currentRemoved, attractionIndex]
        });
      }
    }

    toast({
      title: "Attraction Removed",
      description: "The attraction has been removed from your itinerary.",
    });
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
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Scenic Background */}
      <div className="absolute inset-0 opacity-20">
        <svg
          viewBox="0 0 1920 1080"
          className="w-full h-full object-cover"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Sky gradient */}
          <defs>
            <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#87CEEB" />
              <stop offset="40%" stopColor="#98D8E8" />
              <stop offset="100%" stopColor="#F0F8FF" />
            </linearGradient>
            <linearGradient id="mountainGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4A90A4" />
              <stop offset="100%" stopColor="#2C5F7A" />
            </linearGradient>
            <linearGradient id="roadGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#696969" />
              <stop offset="100%" stopColor="#2F2F2F" />
            </linearGradient>
          </defs>
          
          {/* Sky */}
          <rect width="1920" height="650" fill="url(#skyGradient)" />
          
          {/* Mountain layers */}
          <path d="M0,400 L300,200 L600,350 L900,150 L1200,280 L1500,180 L1800,320 L1920,250 L1920,650 L0,650 Z" fill="url(#mountainGradient)" opacity="0.8" />
          <path d="M0,500 L200,350 L400,450 L700,300 L1000,420 L1300,350 L1600,400 L1920,380 L1920,650 L0,650 Z" fill="#5B9BD5" opacity="0.6" />
          
          {/* Hills */}
          <path d="M0,580 L300,500 L600,550 L900,480 L1200,530 L1500,500 L1920,520 L1920,650 L0,650 Z" fill="#90EE90" opacity="0.7" />
          
          {/* Road */}
          <path d="M0,650 Q200,620 400,630 T800,640 T1200,635 T1920,650 L1920,680 Q1600,670 1200,675 T800,680 T400,670 Q200,665 0,680 Z" fill="url(#roadGradient)" />
          
          {/* Road markings */}
          <path d="M100,655 L200,652 M300,653 L400,650 M500,652 L600,649 M700,651 L800,648 M900,650 L1000,647 M1100,649 L1200,646 M1300,648 L1400,645 M1500,647 L1600,644 M1700,646 L1800,643" 
                stroke="#FFD700" strokeWidth="3" fill="none" opacity="0.8" />
          
          {/* Trees */}
          <g opacity="0.6">
            <ellipse cx="150" cy="580" rx="15" ry="40" fill="#228B22" />
            <ellipse cx="380" cy="600" rx="20" ry="50" fill="#32CD32" />
            <ellipse cx="680" cy="590" rx="18" ry="45" fill="#228B22" />
            <ellipse cx="950" cy="610" rx="22" ry="55" fill="#32CD32" />
            <ellipse cx="1250" cy="595" rx="16" ry="42" fill="#228B22" />
            <ellipse cx="1480" cy="605" rx="25" ry="60" fill="#32CD32" />
            <ellipse cx="1750" cy="585" rx="19" ry="48" fill="#228B22" />
          </g>
          
          {/* Clouds */}
          <g opacity="0.7" fill="white" className="animate-drift">
            <ellipse cx="300" cy="150" rx="60" ry="30" />
            <ellipse cx="280" cy="140" rx="40" ry="25" />
            <ellipse cx="320" cy="135" rx="45" ry="28" />
            
            <ellipse cx="800" cy="120" rx="70" ry="35" />
            <ellipse cx="780" cy="110" rx="50" ry="30" />
            <ellipse cx="820" cy="105" rx="55" ry="32" />
            
            <ellipse cx="1400" cy="180" rx="65" ry="32" />
            <ellipse cx="1380" cy="170" rx="45" ry="27" />
            <ellipse cx="1420" cy="165" rx="50" ry="30" />
          </g>
          
          {/* Sun */}
          <g className="animate-sun-glow">
            <circle cx="1600" cy="200" r="80" fill="#FFD700" opacity="0.8" />
            <circle cx="1600" cy="200" r="60" fill="#FFA500" opacity="0.6" />
          </g>
        </svg>
      </div>
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

          </div>
        </div>
        

      </header>

      {/* Main Content - Tab View */}
      <div className="flex-1 relative h-full z-10">
        {/* Tab Navigation */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
          <div className="glass-strong rounded-xl p-1 flex">
            <button
              onClick={() => setActiveView('map')}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeView === 'map'
                  ? 'bg-white/30 text-gray-900 shadow-md'
                  : 'text-gray-700 hover:bg-white/20'
              }`}
              data-testid="button-view-map"
            >
              <MapPin className="h-4 w-4 inline mr-2" />
              Route Map
            </button>
            <button
              onClick={() => setActiveView('itinerary')}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeView === 'itinerary'
                  ? 'bg-white/30 text-gray-900 shadow-md'
                  : 'text-gray-700 hover:bg-white/20'
              }`}
              data-testid="button-view-itinerary"
            >
              <List className="h-4 w-4 inline mr-2" />
              Trip Details
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="h-full">
          {activeView === 'map' ? (
            <MapView 
              key={`map-${completedTrip.id}-${Date.now()}`}
              itinerary={completedTrip.itinerary}
              isLoading={false}
              onItineraryUpdate={handleItineraryUpdate}
              customAttractions={customAttractions}
              removedAttractions={removedAttractions}
              onRemoveAttraction={handleRemoveAttraction}
            />
          ) : (
            <div className="h-full bg-white/10 backdrop-blur-md">
              <div className="h-full flex flex-col">
                {/* Itinerary Header */}
                <div className="px-6 py-4 pt-20 border-b border-white/20 bg-white/5">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <List className="h-6 w-6 mr-3 text-blue-600" />
                    Trip Itinerary
                  </h2>
                  <p className="text-sm text-gray-600 mt-2">
                    {completedTrip.itinerary?.totalDays} days • {completedTrip.itinerary?.totalAttractions} attractions • {completedTrip.itinerary?.totalDistance} miles
                  </p>
                </div>
                
                {/* Itinerary Content */}
                <div className="flex-1 p-6 overflow-y-auto glass-scrollbar">
                  <ItineraryView 
                    itinerary={completedTrip.itinerary}
                    onRemoveAttraction={handleRemoveAttraction}
                    customAttractions={customAttractions}
                    removedAttractions={removedAttractions}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}