import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Map, List, Route as RouteIcon, Menu, X } from "lucide-react";
import { TripForm } from "@/components/trip-form";
import { MapView } from "@/components/map-view";
import { ItineraryView } from "@/components/itinerary-view";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { TripFormData, Trip } from "@/types/trip";

type ViewMode = "map" | "itinerary" | "form";

export default function Home() {
  const [activeView, setActiveView] = useState<ViewMode>("form");
  const [completedTrip, setCompletedTrip] = useState<Trip | undefined>();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toast } = useToast();

  const planTripMutation = useMutation({
    mutationFn: async (formData: TripFormData) => {
      const response = await apiRequest("POST", "/api/trips/plan", formData);
      return response.json() as Promise<Trip>;
    },
    onSuccess: (trip) => {
      setCompletedTrip(trip);
      // Force map view to be active to show the new route immediately
      setActiveView("map");
      // Close mobile menu if open
      setIsMobileMenuOpen(false);
      
      // Add a small delay to ensure map component re-renders with new data
      setTimeout(() => {
        toast({
          title: "Trip Generated Successfully!",
          description: `Your ${trip.itinerary?.totalDays}-day road trip is ready to explore.`,
        });
      }, 100);
    },
    onError: (error: any) => {
      console.error("Failed to plan trip:", error);
      
      // Enhanced error handling with specific guidance
      let title = "Trip Planning Failed";
      let description = "Unable to generate your trip itinerary. Please try again.";
      
      if (error?.response?.json) {
        error.response.json().then((errorData: any) => {
          if (errorData.message?.includes("quota")) {
            title = "OpenAI API Quota Exceeded";
            description = "Your OpenAI API key has reached its usage limit. Please check your billing and usage at https://platform.openai.com/usage";
          } else if (errorData.message?.includes("authentication")) {
            title = "API Authentication Error";
            description = "Please verify your OpenAI API key is valid and properly configured.";
          } else {
            description = errorData.message || description;
          }
          
          toast({
            title,
            description,
            variant: "destructive",
          });
        }).catch(() => {
          toast({
            title,
            description,
            variant: "destructive",
          });
        });
      } else {
        toast({
          title,
          description,
          variant: "destructive",
        });
      }
    },
  });

  const handlePlanTrip = (formData: TripFormData) => {
    planTripMutation.mutate(formData);
  };

  const handleItineraryUpdate = (updatedItinerary: any) => {
    if (completedTrip) {
      setCompletedTrip({
        ...completedTrip,
        itinerary: updatedItinerary
      });
      
      toast({
        title: "Itinerary Updated!",
        description: "Your trip has been updated with your custom locations.",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="glass rounded-none border-b border-white/20 z-50">
        <div className="px-4 md:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center animate-glow">
                <RouteIcon className="h-4 w-4 md:h-5 md:w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-bold text-gray-900" data-testid="text-app-title">RoadTrip Planner</h1>
                <p className="text-xs text-gray-600 hidden sm:block" data-testid="text-app-subtitle">AI-Powered Travel Planning</p>
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
                  activeView === "form"
                    ? "bg-white text-gray-900 shadow-md"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                }`}
                onClick={() => setActiveView("form")}
                data-testid="tab-form"
              >
                <RouteIcon className="h-4 w-4 mr-2" />
                Plan
              </Button>
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
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="ghost"
                size="sm"
                className={`rounded-lg transition-all duration-300 flex flex-col items-center space-y-1 h-auto py-3 ${
                  activeView === "form"
                    ? "bg-white text-gray-900 shadow-md"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                }`}
                onClick={() => {
                  setActiveView("form");
                  setIsMobileMenuOpen(false);
                }}
                data-testid="tab-mobile-form"
              >
                <RouteIcon className="h-5 w-5" />
                <span className="text-xs">Plan</span>
              </Button>
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Desktop Layout: Left Panel - Trip Planning Form */}
        <div className={`
          ${activeView === "form" ? "block" : "hidden"} md:block
          w-full md:w-96 glass-strong border-b md:border-r md:border-b-0 border-white/20 
          p-4 md:p-6 overflow-y-auto glass-scrollbar
          ${activeView === "form" ? "flex-1" : ""}
        `}>
          <TripForm 
            onSubmit={handlePlanTrip}
            isLoading={planTripMutation.isPending}
            completedTrip={completedTrip}
          />
        </div>

        {/* Desktop Layout: Right Panel - Map or Itinerary */}
        <div className={`
          flex-1 relative
          ${activeView === "form" ? "hidden md:block" : "block"}
        `}>
          {activeView === "map" ? (
            <MapView 
              key={completedTrip ? `map-${completedTrip.id}-${Date.now()}` : 'default'}
              itinerary={completedTrip?.itinerary}
              isLoading={planTripMutation.isPending}
              onItineraryUpdate={handleItineraryUpdate}
            />
          ) : activeView === "itinerary" ? (
            <div className="h-full p-4 md:p-6 overflow-y-auto glass-scrollbar">
              <ItineraryView 
                itinerary={completedTrip?.itinerary}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
