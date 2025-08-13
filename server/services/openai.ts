import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface TripPlanningRequest {
  startLocation: string;
  endLocation: string;
  startDate: string;
  startTime: string;
  endDate: string;
  checkInTime: string;
  isRoundTrip?: string;

  interests?: string[];
}

export async function generateTripItinerary(request: TripPlanningRequest) {
  const isRoundTrip = request.isRoundTrip === "true";
  
  const prompt = `You are a professional trip planner specializing in road trips.

Using the trip details provided, create a realistic, day-by-day driving itinerary.
Include cities or towns for overnight stays and up to 5 most popular attractions near each overnight city or along the route.

Trip Details:
- Start: ${request.startLocation}
- End: ${request.endLocation}
- Start Date: ${request.startDate} at ${request.startTime}
- End Date: ${request.endDate}
- Latest check-in time: ${request.checkInTime}
- Trip Type: ${isRoundTrip ? 'Round Trip (return to starting location)' : 'One Way'}

${request.interests && request.interests.length > 0 ? `- Travel Interests: ${request.interests.join(', ')}

When selecting attractions, include a variety of places that match the traveler's interests. Ensure all selected interest categories are represented in the attractions throughout the trip.` : ''}

Rules:
- Assume travel is by car
- Day 1 starts at the provided start date/time
- All subsequent days start at 9:00 AM local time
- Keep the total number of stops (including start, overnights, destination, and attractions) at or below 25
- Ensure realistic driving times and distances
- Include estimated driving times between cities
- Include attractions that match the traveler's specified interests
${isRoundTrip ? '- For round trips: plan the outbound journey to the destination, then plan the return journey back to the starting location within the given dates' : ''}


Return the plan in STRICT JSON format with this exact structure:
{
  "totalDays": number,
  "totalDistance": number (in miles),
  "totalDrivingTime": "string (e.g., '16h 35m')",
  "totalAttractions": number,
  "days": [
    {
      "dayNumber": number,
      "date": "YYYY-MM-DD",
      "route": {
        "from": "string",
        "to": "string", 
        "distance": number (in miles),
        "drivingTime": "string (e.g., '2h 15m')",
        "departureTime": "string (e.g., '9:00 AM')",
        "arrivalTime": "string (e.g., '11:15 AM')"
      },
      "attractions": [
        {
          "name": "string",
          "description": "string"
        }
      ],
      "overnightLocation": "string"
    }
  ]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional trip planner. Always respond with valid JSON matching the exact format requested."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    return JSON.parse(content);
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error(`Failed to generate trip itinerary: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
