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
    <div className="w-full lg:w-80 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Plan Your Trip</h2>
          <p className="text-sm text-gray-600">Enter your trip details and let AI create your perfect itinerary</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Trip Locations */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="startLocation" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <MapPin className="h-4 w-4 text-emerald-600 mr-2" />
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
                  className="pr-8"
                />
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                
                {showStartSuggestions && filteredStartCities.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredStartCities.map((city, index) => (
                      <button
                        key={index}
                        type="button"
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
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
            
            <div>
              <Label htmlFor="endLocation" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Flag className="h-4 w-4 text-red-600 mr-2" />
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
                  className="pr-8"
                />
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                
                {showEndSuggestions && filteredEndCities.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredEndCities.map((city, index) => (
                      <button
                        key={index}
                        type="button"
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
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
          <div className="space-y-4">
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
                />
              </div>
              <div>
                <Label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">Departure Time</Label>
                <Select 
                  value={formData.startTime} 
                  onValueChange={(value) => handleInputChange("startTime", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger data-testid="select-start-time">
                    <SelectValue placeholder="Select departure time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="06:00">6:00 AM</SelectItem>
                    <SelectItem value="07:00">7:00 AM</SelectItem>
                    <SelectItem value="08:00">8:00 AM</SelectItem>
                    <SelectItem value="09:00">9:00 AM</SelectItem>
                    <SelectItem value="10:00">10:00 AM</SelectItem>
                    <SelectItem value="11:00">11:00 AM</SelectItem>
                    <SelectItem value="12:00">12:00 PM</SelectItem>
                    <SelectItem value="13:00">1:00 PM</SelectItem>
                    <SelectItem value="14:00">2:00 PM</SelectItem>
                    <SelectItem value="15:00">3:00 PM</SelectItem>
                    <SelectItem value="16:00">4:00 PM</SelectItem>
                    <SelectItem value="17:00">5:00 PM</SelectItem>
                    <SelectItem value="18:00">6:00 PM</SelectItem>
                    <SelectItem value="19:00">7:00 PM</SelectItem>
                    <SelectItem value="20:00">8:00 PM</SelectItem>
                    <SelectItem value="21:00">9:00 PM</SelectItem>
                    <SelectItem value="22:00">10:00 PM</SelectItem>
                    <SelectItem value="23:00">11:00 PM</SelectItem>
                    <SelectItem value="00:00">12:00 AM</SelectItem>
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
                />
              </div>
              <div>
                <Label htmlFor="checkInTime" className="block text-sm font-medium text-gray-700 mb-2">Latest Check-in</Label>
                <Select 
                  value={formData.checkInTime} 
                  onValueChange={(value) => handleInputChange("checkInTime", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger data-testid="select-checkin-time">
                    <SelectValue placeholder="Select check-in time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="18:00">6:00 PM</SelectItem>
                    <SelectItem value="19:00">7:00 PM</SelectItem>
                    <SelectItem value="20:00">8:00 PM</SelectItem>
                    <SelectItem value="21:00">9:00 PM</SelectItem>
                    <SelectItem value="22:00">10:00 PM</SelectItem>
                    <SelectItem value="23:00">11:00 PM</SelectItem>
                    <SelectItem value="00:00">12:00 AM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Additional Options */}
          <div className="space-y-4">
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-3">Interests (Optional)</Label>
              <div className="space-y-3 max-h-40 overflow-y-auto" data-testid="interests-checkboxes">
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
                  <div key={interest} className="flex items-center space-x-2">
                    <Checkbox
                      id={`interest-${interest}`}
                      checked={selectedInterests.includes(interest)}
                      onCheckedChange={(checked) => handleInterestToggle(interest, !!checked)}
                      disabled={isLoading}
                      data-testid={`checkbox-${interest.toLowerCase().replace(/\s+/g, '-')}`}
                    />
                    <Label 
                      htmlFor={`interest-${interest}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {interest}
                    </Label>
                  </div>
                ))}
              </div>
              {selectedInterests.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  Selected: {selectedInterests.join(", ")}
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit"
            className="w-full"
            disabled={isLoading}
            data-testid="button-plan-trip"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Trip Plan
          </Button>
        </form>

        {/* Trip Summary Card */}
        {completedTrip?.itinerary && (
          <Card className="mt-6 border-emerald-200 bg-emerald-50" data-testid="trip-summary">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-3">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <h3 className="font-medium text-emerald-900">Trip Generated!</h3>
              </div>
              <div className="text-sm text-emerald-700 space-y-1">
                <div data-testid="summary-days">{completedTrip.itinerary.totalDays}-day road trip</div>
                <div data-testid="summary-distance">{completedTrip.itinerary.totalDistance} miles total</div>
                <div data-testid="summary-stops">{completedTrip.itinerary.days.length} stops</div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
