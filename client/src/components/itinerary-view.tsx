import { Clock, Route, Camera, Bed, TrendingUp, CheckCircle, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { TripItinerary } from "@/types/trip";

interface ItineraryViewProps {
  itinerary?: TripItinerary;
  onRemoveAttraction?: (dayNumber: number, attractionIndex: number, isCustom: boolean) => void;
  customAttractions?: Map<number, any[]>;
  removedAttractions?: Map<number, number[]>;
}

export function ItineraryView({ itinerary, onRemoveAttraction, customAttractions, removedAttractions }: ItineraryViewProps) {
  if (!itinerary) {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="text-center text-gray-500 mt-12">
            <Clock className="h-16 w-16 mb-4 text-gray-300 mx-auto" />
            <h3 className="text-lg font-medium mb-2" data-testid="text-no-itinerary">No Itinerary Available</h3>
            <p className="text-sm" data-testid="text-generate-trip">Generate a trip plan to see your detailed itinerary</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2" data-testid="text-itinerary-title">Your Trip Itinerary</h2>
          <p className="text-gray-600" data-testid="text-itinerary-subtitle">Day-by-day breakdown of your road trip adventure</p>
        </div>



        {/* Itinerary Cards */}
        <div className="space-y-6">
          {itinerary.days.map((day, index) => (
            <Card key={day.dayNumber} className="shadow-sm border border-gray-200" data-testid={`card-day-${day.dayNumber}`}>
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 rounded-t-lg">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    <span className="text-primary" data-testid={`text-day-number-${day.dayNumber}`}>Day {day.dayNumber}</span> - {new Date(day.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h3>
                  <div className="text-sm text-gray-500">
                    <Clock className="inline h-4 w-4 mr-1" />
                    <span data-testid={`text-driving-time-${day.dayNumber}`}>{day.route.drivingTime} driving</span>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                {/* Route Segment */}
                <div className="flex items-start space-x-4 mb-6">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Route className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1" data-testid={`text-route-${day.dayNumber}`}>
                      {day.route.from} → {day.route.to}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2" data-testid={`text-route-details-${day.dayNumber}`}>
                      Distance: {day.route.distance} miles • Driving time: {day.route.drivingTime}
                    </p>
                    <div className="text-xs text-gray-500" data-testid={`text-route-times-${day.dayNumber}`}>
                      Departure: {day.route.departureTime} • Arrival: {day.route.arrivalTime}
                    </div>
                  </div>
                </div>

                {/* Attractions */}
                {day.attractions && day.attractions.length > 0 && (
                  <div className="ml-12 space-y-4">
                    <div>
                      <h5 className="font-medium text-gray-800 mb-3 flex items-center">
                        <Camera className="h-4 w-4 text-red-600 mr-2" />
                        Popular Attractions
                      </h5>
                      <div className="grid gap-3">
                        {day.attractions
                          .filter((_, index) => {
                            // Filter out removed attractions by checking the removedAttractions map
                            const removedIndexes = onRemoveAttraction ? (removedAttractions?.get(day.dayNumber) || []) : [];
                            return !removedIndexes.includes(index);
                          })
                          .map((attraction, attractionIndex) => {
                          // Check if this is a custom attraction
                          const customDayAttractions = customAttractions?.get(day.dayNumber) || [];
                          const isCustomAttraction = customDayAttractions.some(custom => 
                            custom.name === attraction.name && !custom.isRemoved
                          );

                          return (
                            <div 
                              key={attractionIndex} 
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                              data-testid={`attraction-${day.dayNumber}-${attractionIndex}`}
                            >
                              <div className="flex items-center space-x-3 flex-1">
                                <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900 text-sm" data-testid={`attraction-name-${day.dayNumber}-${attractionIndex}`}>
                                    {attraction.name}
                                  </div>
                                  <div className="text-xs text-gray-600" data-testid={`attraction-description-${day.dayNumber}-${attractionIndex}`}>
                                    {attraction.description}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Remove Attraction Button */}
                              {onRemoveAttraction && (
                                <button
                                  onClick={() => onRemoveAttraction(day.dayNumber, attractionIndex, isCustomAttraction)}
                                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 flex-shrink-0"
                                  title="Remove attraction"
                                  data-testid={`button-remove-attraction-${day.dayNumber}-${attractionIndex}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                        
                        {/* Display custom attractions */}
                        {customAttractions?.get(day.dayNumber)?.filter(custom => !custom.isRemoved).map((customAttraction, customIndex) => (
                          <div 
                            key={`custom-${customIndex}`}
                            className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                            data-testid={`custom-attraction-${day.dayNumber}-${customIndex}`}
                          >
                            <div className="flex items-center space-x-3 flex-1">
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                              <div className="flex-1">
                                <div className="font-medium text-gray-900 text-sm flex items-center space-x-2">
                                  <span>{customAttraction.name}</span>
                                  <span className="px-2 py-1 text-xs bg-blue-200 text-blue-800 rounded-full">Custom</span>
                                </div>
                                <div className="text-xs text-gray-600">
                                  {customAttraction.description || "Custom added location"}
                                </div>
                              </div>
                            </div>
                            
                            {/* Remove Custom Attraction Button */}
                            {onRemoveAttraction && (
                              <button
                                onClick={() => onRemoveAttraction(day.dayNumber, customIndex, true)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 flex-shrink-0"
                                title="Remove custom attraction"
                                data-testid={`button-remove-custom-attraction-${day.dayNumber}-${customIndex}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Overnight Stay */}
                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-2 text-emerald-600 mb-2">
                        <Bed className="h-4 w-4" />
                        <span className="font-medium text-sm">Overnight Stay</span>
                      </div>
                      <p className="text-sm text-gray-700 ml-6" data-testid={`overnight-location-${day.dayNumber}`}>
                        {day.overnightLocation}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trip Summary */}
        <Card className="mt-8 border-primary/20 bg-primary/5" data-testid="trip-summary-card">
          <CardContent className="p-6">
            <h3 className="font-semibold text-primary-900 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 text-primary mr-2" />
              Trip Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary" data-testid="summary-total-distance">
                  {itinerary.totalDistance}
                </div>
                <div className="text-sm text-primary-700">Total Miles</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary" data-testid="summary-total-driving-time">
                  {itinerary.totalDrivingTime}
                </div>
                <div className="text-sm text-primary-700">Driving Time</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary" data-testid="summary-total-days">
                  {itinerary.totalDays}
                </div>
                <div className="text-sm text-primary-700">Days</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary" data-testid="summary-total-attractions">
                  {itinerary.totalAttractions}
                </div>
                <div className="text-sm text-primary-700">Attractions</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
