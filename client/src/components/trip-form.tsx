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
    interests: "",
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
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleInputChange("startTime", e.target.value)}
                  required
                  disabled={isLoading}
                  data-testid="input-start-time"
                />
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
                <Input
                  id="checkInTime"
                  type="time"
                  value={formData.checkInTime}
                  onChange={(e) => handleInputChange("checkInTime", e.target.value)}
                  required
                  disabled={isLoading}
                  data-testid="input-checkin-time"
                />
              </div>
            </div>
          </div>

          {/* Additional Options */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="interests" className="block text-sm font-medium text-gray-700 mb-2">Interests (Optional)</Label>
              <Textarea
                id="interests"
                placeholder="e.g., National parks, museums, food, beaches..."
                rows={3}
                value={formData.interests}
                onChange={(e) => handleInputChange("interests", e.target.value)}
                disabled={isLoading}
                className="resize-none"
                data-testid="textarea-interests"
              />
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
