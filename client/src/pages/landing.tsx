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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Scenic Background */}
      <div className="absolute inset-0 opacity-30">
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
      <header className="glass rounded-none border-b border-white/20 relative z-10">
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
      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
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

          {/* Centered Trip Form - Wide Layout */}
          <div className="w-full max-w-4xl glass-strong rounded-3xl p-6 lg:p-8">
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