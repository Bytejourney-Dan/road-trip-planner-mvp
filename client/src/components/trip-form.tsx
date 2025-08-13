import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
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
    interests: "none",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field: keyof TripFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
              <Input
                id="startLocation"
                type="text"
                placeholder="e.g., San Francisco, CA"
                value={formData.startLocation}
                onChange={(e) => handleInputChange("startLocation", e.target.value)}
                required
                disabled={isLoading}
                data-testid="input-start-location"
              />
            </div>
            
            <div>
              <Label htmlFor="endLocation" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Flag className="h-4 w-4 text-red-600 mr-2" />
                End Location
              </Label>
              <Input
                id="endLocation"
                type="text"
                placeholder="e.g., Los Angeles, CA"
                value={formData.endLocation}
                onChange={(e) => handleInputChange("endLocation", e.target.value)}
                required
                disabled={isLoading}
                data-testid="input-end-location"
              />
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
                <Label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">Start Time</Label>
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
              <Label htmlFor="interests" className="block text-sm font-medium text-gray-700 mb-2">Interests (Optional)</Label>
              <Select 
                value={formData.interests} 
                onValueChange={(value) => handleInputChange("interests", value)}
                disabled={isLoading}
              >
                <SelectTrigger data-testid="select-interests">
                  <SelectValue placeholder="Select your travel interests" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None selected</SelectItem>
                  <SelectItem value="National parks and nature">National parks and nature</SelectItem>
                  <SelectItem value="Museums and culture">Museums and culture</SelectItem>
                  <SelectItem value="Food and dining">Food and dining</SelectItem>
                  <SelectItem value="Beaches and coast">Beaches and coast</SelectItem>
                  <SelectItem value="Historic sites">Historic sites</SelectItem>
                  <SelectItem value="Shopping">Shopping</SelectItem>
                  <SelectItem value="Adventure and outdoor activities">Adventure and outdoor activities</SelectItem>
                  <SelectItem value="Art and galleries">Art and galleries</SelectItem>
                  <SelectItem value="Music and entertainment">Music and entertainment</SelectItem>
                  <SelectItem value="Architecture">Architecture</SelectItem>
                </SelectContent>
              </Select>
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
