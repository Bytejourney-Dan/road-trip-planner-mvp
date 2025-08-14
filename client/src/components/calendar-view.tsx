import React from 'react';
import { Calendar, MapPin, Clock, Camera, Bed, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TripItinerary } from "@/types/trip";

interface CalendarViewProps {
  itinerary?: TripItinerary;
  onRemoveAttraction?: (dayNumber: number, attractionIndex: number, isCustom: boolean) => void;
  customAttractions?: Record<number, any[]>;
  removedAttractions?: Record<number, number[]>;
}

export default function CalendarView({ 
  itinerary, 
  onRemoveAttraction, 
  customAttractions, 
  removedAttractions 
}: CalendarViewProps) {
  if (!itinerary) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-gray-500">
          <Calendar className="h-16 w-16 mb-4 text-gray-300 mx-auto" />
          <h3 className="text-lg font-medium mb-2">No Trip Planned</h3>
          <p className="text-sm">Generate a trip to see your calendar view</p>
        </div>
      </div>
    );
  }

  // Helper function to parse date string and get day name
  const getDayInfo = (dateString: string) => {
    const date = new Date(dateString);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return {
      dayName: dayNames[date.getDay()],
      dayNumber: date.getDate(),
      month: monthNames[date.getMonth()],
      fullDate: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    };
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Calendar className="h-8 w-8 text-blue-500 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">Trip Calendar</h2>
        </div>
        <p className="text-gray-600">{itinerary.totalDays}-day journey • {itinerary.totalDistance} miles</p>
      </div>

      {/* Calendar Grid */}
      <div className="grid gap-6">
        {itinerary.days.map((day) => {
          const dayInfo = getDayInfo(day.date);
          const removedIndexes = removedAttractions?.[day.dayNumber] || [];
          const filteredAttractions = day.attractions.filter((_, index) => !removedIndexes.includes(index));
          const customDayAttractions = customAttractions?.[day.dayNumber] || [];
          const activeCustomAttractions = customDayAttractions.filter(custom => !custom.isRemoved);

          return (
            <Card key={day.dayNumber} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{dayInfo.dayNumber}</div>
                      <div className="text-sm opacity-90">{dayInfo.month}</div>
                    </div>
                    <div>
                      <CardTitle className="text-xl text-white">Day {day.dayNumber}</CardTitle>
                      <p className="text-blue-100 text-sm">{dayInfo.dayName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-blue-100 mb-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{day.route?.distance || 'N/A'} mi</span>
                    </div>
                    <div className="flex items-center text-blue-100">
                      <Clock className="h-4 w-4 mr-1" />
                      <span className="text-sm">{day.route?.drivingTime || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                {/* Overnight Location */}
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <Bed className="h-5 w-5 text-green-600 mr-2" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Overnight Stay</h4>
                      <p className="text-sm text-gray-700">{day.overnightLocation}</p>
                    </div>
                  </div>
                </div>

                {/* Route Information */}
                {day.route && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                      Route Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">From: </span>
                        <span className="font-medium">{day.route.from}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">To: </span>
                        <span className="font-medium">{day.route.to}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Departure: </span>
                        <span className="font-medium">{day.route.departureTime}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Arrival: </span>
                        <span className="font-medium">{day.route.arrivalTime}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Attractions */}
                {(filteredAttractions.length > 0 || activeCustomAttractions.length > 0) && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Camera className="h-4 w-4 mr-2 text-purple-600" />
                      Attractions ({filteredAttractions.length + activeCustomAttractions.length})
                    </h4>
                    
                    <div className="grid gap-3">
                      {/* Original Attractions */}
                      {filteredAttractions.map((attraction, attractionIndex) => {
                        // Find the original index in the unfiltered array
                        const originalIndex = day.attractions.findIndex(attr => attr.name === attraction.name);
                        
                        return (
                          <div 
                            key={`original-${originalIndex}`}
                            className="flex items-start justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                            data-testid={`calendar-attraction-${day.dayNumber}-${originalIndex}`}
                          >
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900 mb-1">
                                {attraction.name}
                              </h5>
                              <p className="text-sm text-gray-600">
                                {attraction.description}
                              </p>
                            </div>
                            {onRemoveAttraction && (
                              <button
                                onClick={() => onRemoveAttraction(day.dayNumber, originalIndex, false)}
                                className="ml-3 p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 flex-shrink-0"
                                data-testid={`button-remove-calendar-attraction-${day.dayNumber}-${originalIndex}`}
                                title="Remove attraction"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        );
                      })}

                      {/* Custom Attractions */}
                      {activeCustomAttractions.map((customAttraction, customIndex) => (
                        <div 
                          key={`custom-${customIndex}`}
                          className="flex items-start justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                          data-testid={`calendar-custom-attraction-${day.dayNumber}-${customIndex}`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center mb-1">
                              <h5 className="font-medium text-gray-900">
                                {customAttraction.name}
                              </h5>
                              <span className="ml-2 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                                Custom
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {customAttraction.description || 'Custom added attraction'}
                            </p>
                          </div>
                          {onRemoveAttraction && (
                            <button
                              onClick={() => onRemoveAttraction(day.dayNumber, customIndex, true)}
                              className="ml-3 p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 flex-shrink-0"
                              data-testid={`button-remove-calendar-custom-${day.dayNumber}-${customIndex}`}
                              title="Remove custom attraction"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Attractions Message */}
                {filteredAttractions.length === 0 && activeCustomAttractions.length === 0 && (
                  <div className="text-center py-6 text-gray-500">
                    <Camera className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No attractions planned for this day</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Trip Summary */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-0">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Trip Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{itinerary.totalDays}</div>
                <div className="text-sm text-gray-600">Days</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{itinerary.totalDistance}</div>
                <div className="text-sm text-gray-600">Miles</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {itinerary.days.reduce((total, day) => {
                    const removedIndexes = removedAttractions?.[day.dayNumber] || [];
                    const filteredAttractions = day.attractions.filter((_, index) => !removedIndexes.includes(index));
                    const customDayAttractions = customAttractions?.[day.dayNumber] || [];
                    const activeCustomAttractions = customDayAttractions.filter(custom => !custom.isRemoved);
                    return total + filteredAttractions.length + activeCustomAttractions.length;
                  }, 0)}
                </div>
                <div className="text-sm text-gray-600">Attractions</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}