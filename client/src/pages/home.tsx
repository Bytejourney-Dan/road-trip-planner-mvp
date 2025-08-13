import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Map, List, Route as RouteIcon } from "lucide-react";
import { TripForm } from "@/components/trip-form";
import { MapView } from "@/components/map-view";
import { ItineraryView } from "@/components/itinerary-view";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { TripFormData, Trip } from "@/types/trip";

type ViewMode = "map" | "itinerary";

export default function Home() {
  const [activeView, setActiveView] = useState<ViewMode>("map");
  const [completedTrip, setCompletedTrip] = useState<Trip | undefined>();
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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="glass rounded-none border-b border-white/20 z-50">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center animate-glow">
                <RouteIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900" data-testid="text-app-title">RoadTrip Planner</h1>
                <p className="text-xs text-gray-600" data-testid="text-app-subtitle">AI-Powered Travel Planning</p>
              </div>
            </div>
            
            {/* Tab Switches */}
            <div className="flex bg-white/20 rounded-xl p-1">
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
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Left Panel - Trip Planning Form */}
        <div className="w-96 glass-strong border-r border-white/20 p-6 overflow-y-auto glass-scrollbar">
          <TripForm 
            onSubmit={handlePlanTrip}
            isLoading={planTripMutation.isPending}
            completedTrip={completedTrip}
          />
        </div>

        {/* Right Panel - Map or Itinerary */}
        <div className="flex-1 relative">
          {activeView === "map" ? (
            <MapView 
              key={completedTrip ? `map-${completedTrip.id}-${Date.now()}` : 'default'}
              itinerary={completedTrip?.itinerary}
              isLoading={planTripMutation.isPending}
            />
          ) : (
            <div className="h-full p-6 overflow-y-auto glass-scrollbar">
              <ItineraryView 
                itinerary={completedTrip?.itinerary}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
