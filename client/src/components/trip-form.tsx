import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin, Flag, Clock, Sparkles, CheckCircle } from "lucide-react";
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
  const [customStartLocation, setCustomStartLocation] = useState("");
  const [customEndLocation, setCustomEndLocation] = useState("");
  const [showCustomStart, setShowCustomStart] = useState(false);
  const [showCustomEnd, setShowCustomEnd] = useState(false);

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

  const handleStartLocationChange = (value: string) => {
    if (value === "custom") {
      setShowCustomStart(true);
      handleInputChange("startLocation", customStartLocation);
    } else {
      setShowCustomStart(false);
      handleInputChange("startLocation", value);
    }
  };

  const handleEndLocationChange = (value: string) => {
    if (value === "custom") {
      setShowCustomEnd(true);
      handleInputChange("endLocation", customEndLocation);
    } else {
      setShowCustomEnd(false);
      handleInputChange("endLocation", value);
    }
  };

  const handleCustomStartLocationChange = (value: string) => {
    setCustomStartLocation(value);
    handleInputChange("startLocation", value);
  };

  const handleCustomEndLocationChange = (value: string) => {
    setCustomEndLocation(value);
    handleInputChange("endLocation", value);
  };

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
              {!showCustomStart ? (
                <Select 
                  value={formData.startLocation} 
                  onValueChange={handleStartLocationChange}
                  disabled={isLoading}
                >
                  <SelectTrigger data-testid="select-start-location">
                    <SelectValue placeholder="Select start location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">✏️ Type custom location</SelectItem>
                    <SelectItem value="New York, NY">New York, NY</SelectItem>
                    <SelectItem value="Los Angeles, CA">Los Angeles, CA</SelectItem>
                    <SelectItem value="Chicago, IL">Chicago, IL</SelectItem>
                    <SelectItem value="Houston, TX">Houston, TX</SelectItem>
                    <SelectItem value="Phoenix, AZ">Phoenix, AZ</SelectItem>
                    <SelectItem value="Philadelphia, PA">Philadelphia, PA</SelectItem>
                    <SelectItem value="San Antonio, TX">San Antonio, TX</SelectItem>
                    <SelectItem value="San Diego, CA">San Diego, CA</SelectItem>
                    <SelectItem value="Dallas, TX">Dallas, TX</SelectItem>
                    <SelectItem value="San Jose, CA">San Jose, CA</SelectItem>
                    <SelectItem value="Austin, TX">Austin, TX</SelectItem>
                    <SelectItem value="Jacksonville, FL">Jacksonville, FL</SelectItem>
                    <SelectItem value="Fort Worth, TX">Fort Worth, TX</SelectItem>
                    <SelectItem value="Columbus, OH">Columbus, OH</SelectItem>
                    <SelectItem value="San Francisco, CA">San Francisco, CA</SelectItem>
                    <SelectItem value="Charlotte, NC">Charlotte, NC</SelectItem>
                    <SelectItem value="Indianapolis, IN">Indianapolis, IN</SelectItem>
                    <SelectItem value="Seattle, WA">Seattle, WA</SelectItem>
                    <SelectItem value="Denver, CO">Denver, CO</SelectItem>
                    <SelectItem value="Boston, MA">Boston, MA</SelectItem>
                    <SelectItem value="Nashville, TN">Nashville, TN</SelectItem>
                    <SelectItem value="Miami, FL">Miami, FL</SelectItem>
                    <SelectItem value="Las Vegas, NV">Las Vegas, NV</SelectItem>
                    <SelectItem value="Portland, OR">Portland, OR</SelectItem>
                    <SelectItem value="Atlanta, GA">Atlanta, GA</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="e.g., Small Town, State or Address"
                    value={customStartLocation}
                    onChange={(e) => handleCustomStartLocationChange(e.target.value)}
                    disabled={isLoading}
                    data-testid="input-custom-start-location"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCustomStart(false)}
                    disabled={isLoading}
                    className="text-xs"
                  >
                    ← Back to preset cities
                  </Button>
                </div>
              )}
            </div>
            
            <div>
              <Label htmlFor="endLocation" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Flag className="h-4 w-4 text-red-600 mr-2" />
                End Location
              </Label>
              {!showCustomEnd ? (
                <Select 
                  value={formData.endLocation} 
                  onValueChange={handleEndLocationChange}
                  disabled={isLoading}
                >
                  <SelectTrigger data-testid="select-end-location">
                    <SelectValue placeholder="Select end location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">✏️ Type custom location</SelectItem>
                    <SelectItem value="New York, NY">New York, NY</SelectItem>
                    <SelectItem value="Los Angeles, CA">Los Angeles, CA</SelectItem>
                    <SelectItem value="Chicago, IL">Chicago, IL</SelectItem>
                    <SelectItem value="Houston, TX">Houston, TX</SelectItem>
                    <SelectItem value="Phoenix, AZ">Phoenix, AZ</SelectItem>
                    <SelectItem value="Philadelphia, PA">Philadelphia, PA</SelectItem>
                    <SelectItem value="San Antonio, TX">San Antonio, TX</SelectItem>
                    <SelectItem value="San Diego, CA">San Diego, CA</SelectItem>
                    <SelectItem value="Dallas, TX">Dallas, TX</SelectItem>
                    <SelectItem value="San Jose, CA">San Jose, CA</SelectItem>
                    <SelectItem value="Austin, TX">Austin, TX</SelectItem>
                    <SelectItem value="Jacksonville, FL">Jacksonville, FL</SelectItem>
                    <SelectItem value="Fort Worth, TX">Fort Worth, TX</SelectItem>
                    <SelectItem value="Columbus, OH">Columbus, OH</SelectItem>
                    <SelectItem value="San Francisco, CA">San Francisco, CA</SelectItem>
                    <SelectItem value="Charlotte, NC">Charlotte, NC</SelectItem>
                    <SelectItem value="Indianapolis, IN">Indianapolis, IN</SelectItem>
                    <SelectItem value="Seattle, WA">Seattle, WA</SelectItem>
                    <SelectItem value="Denver, CO">Denver, CO</SelectItem>
                    <SelectItem value="Boston, MA">Boston, MA</SelectItem>
                    <SelectItem value="Nashville, TN">Nashville, TN</SelectItem>
                    <SelectItem value="Miami, FL">Miami, FL</SelectItem>
                    <SelectItem value="Las Vegas, NV">Las Vegas, NV</SelectItem>
                    <SelectItem value="Portland, OR">Portland, OR</SelectItem>
                    <SelectItem value="Atlanta, GA">Atlanta, GA</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="e.g., Small Town, State or Address"
                    value={customEndLocation}
                    onChange={(e) => handleCustomEndLocationChange(e.target.value)}
                    disabled={isLoading}
                    data-testid="input-custom-end-location"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCustomEnd(false)}
                    disabled={isLoading}
                    className="text-xs"
                  >
                    ← Back to preset cities
                  </Button>
                </div>
              )}
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
