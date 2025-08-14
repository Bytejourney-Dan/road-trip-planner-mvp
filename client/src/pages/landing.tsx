import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Route as RouteIcon, Sparkles, MapPin, Calendar, Users } from "lucide-react";
import { TripForm } from "@/components/trip-form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { TripFormData, Trip } from "@/types/trip";

export default function Landing() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const planTripMutation = useMutation({
    mutationFn: async (formData: TripFormData) => {
      const response = await apiRequest("POST", "/api/trips/plan", formData);
      return response.json() as Promise<Trip>;
    },
    onSuccess: (trip) => {
      // Store trip data and navigate to results page
      sessionStorage.setItem('currentTrip', JSON.stringify(trip));
      navigate('/results');
      
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="glass rounded-none border-b border-white/20">
        <div className="px-4 md:px-6 py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center animate-glow">
                <RouteIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900" data-testid="text-app-title">RoadTrip Planner</h1>
                <p className="text-sm text-gray-600" data-testid="text-app-subtitle">AI-Powered Travel Planning</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex flex-col items-center space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-6 max-w-4xl">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Plan Your Perfect
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Road Trip</span>
              </h2>
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                Let AI create personalized itineraries with attractions, routes, and accommodations. 
                Explore interactive maps and customize your journey.
              </p>
            </div>
          </div>

          {/* Centered Trip Form */}
          <div className="w-full max-w-md glass-strong rounded-3xl p-6 lg:p-8">
            <div className="mb-6 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Planning</h3>
              <p className="text-sm text-gray-600">Tell us about your dream road trip</p>
            </div>
            
            <TripForm 
              onSubmit={handlePlanTrip}
              isLoading={planTripMutation.isPending}
              showMinimal={true}
            />
          </div>

          {/* Feature Highlights - Moved to Bottom */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
            <div className="glass-light rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">AI-Powered Planning</h3>
              <p className="text-sm text-gray-600">Smart recommendations based on your preferences and travel style</p>
            </div>

            <div className="glass-light rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Interactive Maps</h3>
              <p className="text-sm text-gray-600">Visual route planning with Google Maps integration</p>
            </div>

            <div className="glass-light rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Flexible Itineraries</h3>
              <p className="text-sm text-gray-600">Day-by-day schedules with customizable attractions</p>
            </div>
          </div>

          {/* Social Proof / Stats - Moved to Bottom */}
          <div className="glass-light rounded-2xl p-6 lg:p-8 w-full max-w-2xl">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl lg:text-3xl font-bold text-blue-600">1000+</div>
                <div className="text-sm text-gray-600">Trips Planned</div>
              </div>
              <div>
                <div className="text-2xl lg:text-3xl font-bold text-green-600">50+</div>
                <div className="text-sm text-gray-600">Destinations</div>
              </div>
              <div>
                <div className="text-2xl lg:text-3xl font-bold text-purple-600">5★</div>
                <div className="text-sm text-gray-600">User Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}