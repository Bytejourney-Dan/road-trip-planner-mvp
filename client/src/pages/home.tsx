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
      toast({
        title: "Trip Generated Successfully!",
        description: `Your ${trip.itinerary?.totalDays}-day road trip is ready to explore.`,
      });
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <RouteIcon className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900" data-testid="text-app-title">RoadTrip Planner</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600" data-testid="text-app-subtitle">AI-Powered Travel Planning</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-screen pt-16">
        {/* Trip Planning Form */}
        <TripForm 
          onSubmit={handlePlanTrip}
          isLoading={planTripMutation.isPending}
          completedTrip={completedTrip}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Content Tabs */}
          <div className="bg-white border-b border-gray-200">
            <div className="px-6">
              <nav className="flex space-x-8" aria-label="Tabs">
                <Button
                  variant="ghost"
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeView === "map"
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => setActiveView("map")}
                  data-testid="tab-map"
                >
                  <Map className="h-4 w-4 mr-2" />
                  Route Map
                </Button>
                <Button
                  variant="ghost"
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeView === "itinerary"
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => setActiveView("itinerary")}
                  data-testid="tab-itinerary"
                >
                  <List className="h-4 w-4 mr-2" />
                  Itinerary Details
                </Button>
              </nav>
            </div>
          </div>

          {/* Content Views */}
          {activeView === "map" && (
            <MapView 
              itinerary={completedTrip?.itinerary}
              isLoading={planTripMutation.isPending}
            />
          )}
          
          {activeView === "itinerary" && (
            <ItineraryView itinerary={completedTrip?.itinerary} />
          )}
        </div>
      </div>
    </div>
  );
}
