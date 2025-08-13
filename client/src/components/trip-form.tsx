import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin, Flag, Clock, Sparkles, CheckCircle, ChevronDown } from "lucide-react";
import { TripFormData, Trip } from "@/types/trip";

interface TripFormProps {
  onSubmit: (data: TripFormData) => void;
  isLoading: boolean;
  completedTrip?: Trip;
}

export function TripForm({ onSubmit, isLoading, completedTrip }: TripFormProps) {
  const [formData, setFormData] = useState<TripFormData>({
    startLocation: "",
    endLocation: "",
    startDate: "",
    startTime: "09:00",
    endDate: "",
    checkInTime: "22:00",
    interests: [],
  });

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [startLocationInput, setStartLocationInput] = useState("");
  const [endLocationInput, setEndLocationInput] = useState("");
  const [showStartSuggestions, setShowStartSuggestions] = useState(false);
  const [showEndSuggestions, setShowEndSuggestions] = useState(false);
  const [filteredStartCities, setFilteredStartCities] = useState<string[]>([]);
  const [filteredEndCities, setFilteredEndCities] = useState<string[]>([]);
  
  const startInputRef = useRef<HTMLInputElement>(null);
  const endInputRef = useRef<HTMLInputElement>(null);
  
  const cities = [
    "New York, NY", "Los Angeles, CA", "Chicago, IL", "Houston, TX", "Phoenix, AZ",
    "Philadelphia, PA", "San Antonio, TX", "San Diego, CA", "Dallas, TX", "San Jose, CA",
    "Austin, TX", "Jacksonville, FL", "Fort Worth, TX", "Columbus, OH", "San Francisco, CA",
    "Charlotte, NC", "Indianapolis, IN", "Seattle, WA", "Denver, CO", "Boston, MA",
    "Nashville, TN", "Miami, FL", "Las Vegas, NV", "Portland, OR", "Atlanta, GA"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field: keyof TripFormData, value: string | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleInterestToggle = (interest: string, checked: boolean) => {
    setSelectedInterests(prev => {
      const newInterests = checked 
        ? [...prev, interest]
        : prev.filter(i => i !== interest);
      handleInputChange("interests", newInterests);
      return newInterests;
    });
  };

  const handleStartLocationInputChange = (value: string) => {
    setStartLocationInput(value);
    handleInputChange("startLocation", value);
    
    if (value.length > 0) {
      const filtered = cities.filter(city => 
        city.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredStartCities(filtered);
      setShowStartSuggestions(true);
    } else {
      setShowStartSuggestions(false);
    }
  };

  const handleEndLocationInputChange = (value: string) => {
    setEndLocationInput(value);
    handleInputChange("endLocation", value);
    
    if (value.length > 0) {
      const filtered = cities.filter(city => 
        city.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredEndCities(filtered);
      setShowEndSuggestions(true);
    } else {
      setShowEndSuggestions(false);
    }
  };

  const selectStartLocation = (city: string) => {
    setStartLocationInput(city);
    handleInputChange("startLocation", city);
    setShowStartSuggestions(false);
  };

  const selectEndLocation = (city: string) => {
    setEndLocationInput(city);
    handleInputChange("endLocation", city);
    setShowEndSuggestions(false);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (startInputRef.current && !startInputRef.current.contains(event.target as Node)) {
        setShowStartSuggestions(false);
      }
      if (endInputRef.current && !endInputRef.current.contains(event.target as Node)) {
        setShowEndSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="h-full overflow-y-auto glass-scrollbar">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-lg flex items-center justify-center mr-3 animate-glow">
            <MapPin className="h-4 w-4 text-white" />
          </div>
          Plan Your Trip
        </h2>
        <p className="text-sm text-gray-700">Enter your trip details and let AI create your perfect itinerary</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Trip Locations */}
        <div className="space-y-4">
          <div className="glass-light p-4 rounded-xl">
            <Label htmlFor="startLocation" className="flex items-center text-sm font-semibold text-gray-800 mb-3">
              <MapPin className="h-4 w-4 text-emerald-500 mr-2" />
              Start Location
            </Label>
            <div className="relative" ref={startInputRef}>
              <Input
                id="startLocation"
                type="text"
                placeholder="Type city name (e.g., San Francisco, CA)"
                value={startLocationInput}
                onChange={(e) => handleStartLocationInputChange(e.target.value)}
                onFocus={() => {
                  if (startLocationInput.length > 0) {
                    setShowStartSuggestions(true);
                  }
                }}
                required
                disabled={isLoading}
                data-testid="input-start-location"
                className="pr-10 bg-white/50 border-white/20 focus:border-emerald-300 focus:ring-emerald-200 rounded-lg transition-all duration-200"
              />
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              
              {showStartSuggestions && filteredStartCities.length > 0 && (
                <div className="absolute z-[60] w-full mt-2 glass-strong rounded-xl shadow-lg max-h-60 overflow-y-auto glass-scrollbar">
                  {filteredStartCities.map((city, index) => (
                    <button
                      key={index}
                      type="button"
                      className="w-full px-4 py-3 text-left hover:bg-white/30 focus:bg-white/30 focus:outline-none border-b border-white/10 last:border-b-0 transition-all duration-200 text-gray-800 font-medium first:rounded-t-xl last:rounded-b-xl"
                      onClick={() => selectStartLocation(city)}
                      data-testid={`suggestion-start-${index}`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
            
          <div className="glass-light p-4 rounded-xl">
            <Label htmlFor="endLocation" className="flex items-center text-sm font-semibold text-gray-800 mb-3">
              <Flag className="h-4 w-4 text-red-500 mr-2" />
              End Location
            </Label>
            <div className="relative" ref={endInputRef}>
              <Input
                id="endLocation"
                type="text"
                placeholder="Type city name (e.g., Los Angeles, CA)"
                value={endLocationInput}
                onChange={(e) => handleEndLocationInputChange(e.target.value)}
                onFocus={() => {
                  if (endLocationInput.length > 0) {
                    setShowEndSuggestions(true);
                  }
                }}
                required
                disabled={isLoading}
                data-testid="input-end-location"
                className="pr-10 bg-white/50 border-white/20 focus:border-red-300 focus:ring-red-200 rounded-lg transition-all duration-200"
              />
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              
              {showEndSuggestions && filteredEndCities.length > 0 && (
                <div className="absolute z-[60] w-full mt-2 glass-strong rounded-xl shadow-lg max-h-60 overflow-y-auto glass-scrollbar">
                  {filteredEndCities.map((city, index) => (
                    <button
                      key={index}
                      type="button"
                      className="w-full px-4 py-3 text-left hover:bg-white/30 focus:bg-white/30 focus:outline-none border-b border-white/10 last:border-b-0 transition-all duration-200 text-gray-800 font-medium first:rounded-t-xl last:rounded-b-xl"
                      onClick={() => selectEndLocation(city)}
                      data-testid={`suggestion-end-${index}`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

          {/* Trip Dates & Times */}
          <div className="glass-light p-4 rounded-xl space-y-4">
            <div className="flex items-center mb-3">
              <Clock className="h-4 w-4 text-blue-500 mr-2" />
              <Label className="text-sm font-semibold text-gray-800">Travel Dates & Times</Label>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange("startDate", e.target.value)}
                  required
                  disabled={isLoading}
                  data-testid="input-start-date"
                  className="bg-white/50 border-white/20 focus:border-blue-300 focus:ring-blue-200 rounded-lg transition-all duration-200"
                />
              </div>
              <div>
                <Label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">Departure Time</Label>
                <Select 
                  value={formData.startTime} 
                  onValueChange={(value) => handleInputChange("startTime", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger data-testid="select-start-time" className="bg-white/50 border-white/20 focus:border-blue-300 focus:ring-blue-200 rounded-lg transition-all duration-200">
                    <SelectValue placeholder="Select departure time" />
                  </SelectTrigger>
                  <SelectContent className="glass-strong rounded-xl">
                    <SelectItem value="06:00" className="hover:bg-white/30 focus:bg-white/30">6:00 AM</SelectItem>
                    <SelectItem value="07:00" className="hover:bg-white/30 focus:bg-white/30">7:00 AM</SelectItem>
                    <SelectItem value="08:00" className="hover:bg-white/30 focus:bg-white/30">8:00 AM</SelectItem>
                    <SelectItem value="09:00" className="hover:bg-white/30 focus:bg-white/30">9:00 AM</SelectItem>
                    <SelectItem value="10:00" className="hover:bg-white/30 focus:bg-white/30">10:00 AM</SelectItem>
                    <SelectItem value="11:00" className="hover:bg-white/30 focus:bg-white/30">11:00 AM</SelectItem>
                    <SelectItem value="12:00" className="hover:bg-white/30 focus:bg-white/30">12:00 PM</SelectItem>
                    <SelectItem value="13:00" className="hover:bg-white/30 focus:bg-white/30">1:00 PM</SelectItem>
                    <SelectItem value="14:00" className="hover:bg-white/30 focus:bg-white/30">2:00 PM</SelectItem>
                    <SelectItem value="15:00" className="hover:bg-white/30 focus:bg-white/30">3:00 PM</SelectItem>
                    <SelectItem value="16:00" className="hover:bg-white/30 focus:bg-white/30">4:00 PM</SelectItem>
                    <SelectItem value="17:00" className="hover:bg-white/30 focus:bg-white/30">5:00 PM</SelectItem>
                    <SelectItem value="18:00" className="hover:bg-white/30 focus:bg-white/30">6:00 PM</SelectItem>
                    <SelectItem value="19:00" className="hover:bg-white/30 focus:bg-white/30">7:00 PM</SelectItem>
                    <SelectItem value="20:00" className="hover:bg-white/30 focus:bg-white/30">8:00 PM</SelectItem>
                    <SelectItem value="21:00" className="hover:bg-white/30 focus:bg-white/30">9:00 PM</SelectItem>
                    <SelectItem value="22:00" className="hover:bg-white/30 focus:bg-white/30">10:00 PM</SelectItem>
                    <SelectItem value="23:00" className="hover:bg-white/30 focus:bg-white/30">11:00 PM</SelectItem>
                    <SelectItem value="00:00" className="hover:bg-white/30 focus:bg-white/30">12:00 AM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange("endDate", e.target.value)}
                  required
                  disabled={isLoading}
                  data-testid="input-end-date"
                  className="bg-white/50 border-white/20 focus:border-blue-300 focus:ring-blue-200 rounded-lg transition-all duration-200"
                />
              </div>
              <div>
                <Label htmlFor="checkInTime" className="block text-sm font-medium text-gray-700 mb-2">Latest Check-in</Label>
                <Select 
                  value={formData.checkInTime} 
                  onValueChange={(value) => handleInputChange("checkInTime", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger data-testid="select-checkin-time" className="bg-white/50 border-white/20 focus:border-blue-300 focus:ring-blue-200 rounded-lg transition-all duration-200">
                    <SelectValue placeholder="Select check-in time" />
                  </SelectTrigger>
                  <SelectContent className="glass-strong rounded-xl">
                    <SelectItem value="18:00" className="hover:bg-white/30 focus:bg-white/30">6:00 PM</SelectItem>
                    <SelectItem value="19:00" className="hover:bg-white/30 focus:bg-white/30">7:00 PM</SelectItem>
                    <SelectItem value="20:00" className="hover:bg-white/30 focus:bg-white/30">8:00 PM</SelectItem>
                    <SelectItem value="21:00" className="hover:bg-white/30 focus:bg-white/30">9:00 PM</SelectItem>
                    <SelectItem value="22:00" className="hover:bg-white/30 focus:bg-white/30">10:00 PM</SelectItem>
                    <SelectItem value="23:00" className="hover:bg-white/30 focus:bg-white/30">11:00 PM</SelectItem>
                    <SelectItem value="00:00" className="hover:bg-white/30 focus:bg-white/30">12:00 AM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Travel Interests */}
          <div className="glass-light p-4 rounded-xl">
            <div className="flex items-center mb-4">
              <Sparkles className="h-4 w-4 text-purple-500 mr-2" />
              <Label className="text-sm font-semibold text-gray-800">Travel Interests (Optional)</Label>
            </div>
            
            <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto glass-scrollbar" data-testid="interests-checkboxes">
              {[
                "National parks and nature",
                "Museums and culture", 
                "Food and dining",
                "Beaches and coast",
                "Historic sites",
                "Shopping",
                "Adventure and outdoor activities",
                "Art and galleries",
                "Music and entertainment",
                "Architecture"
              ].map((interest) => (
                <div key={interest} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/30 transition-all duration-200 glass-hover">
                  <Checkbox
                    id={`interest-${interest}`}
                    checked={selectedInterests.includes(interest)}
                    onCheckedChange={(checked) => handleInterestToggle(interest, !!checked)}
                    disabled={isLoading}
                    data-testid={`checkbox-${interest.toLowerCase().replace(/\s+/g, '-')}`}
                    className="border-white/30 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-500 data-[state=checked]:to-blue-500 data-[state=checked]:border-purple-400"
                  />
                  <Label 
                    htmlFor={`interest-${interest}`}
                    className="text-sm font-medium cursor-pointer text-gray-800 select-none"
                  >
                    {interest}
                  </Label>
                </div>
              ))}
            </div>
            
            {selectedInterests.length > 0 && (
              <div className="mt-3 p-2 glass-light rounded-lg">
                <p className="text-xs text-gray-600 font-medium">
                  Selected: {selectedInterests.join(", ")}
                </p>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button 
            type="submit"
            className="w-full h-12 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={isLoading}
            data-testid="button-plan-trip"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Generating...
              </div>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Trip Plan
              </>
            )}
          </Button>
        </form>

      {/* Trip Summary Card */}
      {completedTrip?.itinerary && (
        <div className="mt-6 glass-light rounded-xl p-4 animate-fade-in" data-testid="trip-summary">
          <div className="flex items-center space-x-2 mb-3">
            <CheckCircle className="h-5 w-5 text-emerald-500" />
            <h3 className="font-semibold text-gray-900">Trip Generated!</h3>
          </div>
          <div className="text-sm text-gray-700 space-y-2">
            <div data-testid="summary-days" className="flex items-center">
              <span className="font-medium">{completedTrip.itinerary.totalDays}-day</span> 
              <span className="ml-1">road trip</span>
            </div>
            <div data-testid="summary-distance" className="flex items-center">
              <span className="font-medium">{completedTrip.itinerary.totalDistance} miles</span>
              <span className="ml-1">total distance</span>
            </div>
            <div data-testid="summary-stops" className="flex items-center">
              <span className="font-medium">{completedTrip.itinerary.days.length} stops</span>
              <span className="ml-1">planned</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
