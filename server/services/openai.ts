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
Include cities or towns for overnight stays and exactly 5 attractions within 100 miles of each overnight city.

IMPORTANT: The driving route should ONLY connect overnight stops - do not include attractions as waypoints in the driving directions.

Trip Details:
- Start: ${request.startLocation}
- End: ${request.endLocation}
- Start Date: ${request.startDate} at ${request.startTime}
- End Date: ${request.endDate}
- Latest check-in time: ${request.checkInTime}
- Trip Type: ${isRoundTrip ? 'Round Trip (return to starting location)' : 'One Way'}

${isRoundTrip ? `
ROUND TRIP ROUTE OPTIMIZATION:
For this round trip, you MUST create two distinct routes to minimize overlap and maximize the travel experience:

1. OUTBOUND JOURNEY: Plan the most direct or scenic route from ${request.startLocation} to ${request.endLocation}
2. RETURN JOURNEY: Plan a completely different route back to ${request.startLocation} that avoids the outbound path

Route Strategy Examples:
- If one direction goes inland, the other should go coastal
- If one uses major highways, the other should use scenic backroads
- If one goes through mountains, the other could go through valleys or plains
- Choose different intermediate cities for overnight stops on each leg
- Consider different geographic features: desert vs forest, urban vs rural, etc.

This creates a true loop experience where travelers discover new places on both legs of the journey.` : ''}

${request.interests && request.interests.length > 0 ? `- Travel Interests: ${request.interests.join(', ')}

CRITICAL REQUIREMENTS: 
1. The itinerary MUST include attractions from EVERY selected interest category. No exceptions.
2. Recommend exactly 5 attractions per day that are within 100 miles of the overnight stop for that day.
3. Only include driving routes between overnight stops - do NOT route through attractions in the initial route.

For each interest category selected:
${request.interests.map(interest => `- ${interest}: MUST include specific attractions of this type within 100 miles of overnight stops`).join('\n')}

Examples of what to include:
- For "Beaches and coast": Include beaches, coastal viewpoints, seaside towns, coastal state parks, lighthouses, or oceanfront attractions
- For "Waterfalls": Include named waterfalls, waterfall hikes, or cascade viewpoints
- For "Mountains": Include mountain peaks, scenic overlooks, mountain parks, or alpine areas
- For "National and State Parks": Include specific national or state parks along the route

Distribute these interest-based attractions across different days. Each selected interest category MUST appear in the final itinerary.` : ''}

Rules:
- Assume travel is by car
- Day 1 starts at the provided start date/time
- All subsequent days start at 9:00 AM local time
- Keep the total number of stops (including start, overnights, destination, and attractions) at or below 25
- Ensure realistic driving times and distances between overnight stops only
- Include estimated driving times between overnight cities
- Include exactly 5 attractions per day that are within 100 miles of the overnight stop
- The initial route should ONLY connect overnight stops - do not include attractions in the driving route
- Include attractions that match the traveler's specified interests
${isRoundTrip ? `- For round trips: CREATE A TRUE ROUND TRIP EXPERIENCE by planning TWO DIFFERENT ROUTES:
  * OUTBOUND ROUTE: Plan the journey from start to destination using one route
  * RETURN ROUTE: Plan the return journey using a COMPLETELY DIFFERENT route to minimize overlap
  * Choose overnight stops on the return that are in different cities/towns than the outbound journey
  * This creates a loop experience where travelers see different scenery and attractions on the way back
  * The goal is to maximize new experiences and minimize driving the same roads twice
  * Examples: If outbound goes through mountains, return could go through coastal areas; if outbound is inland, return could be along the coast` : ''}


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
          "description": "string (within 100 miles of overnight stop)",
          "coordinates": {"lat": number, "lng": number},
          "estimatedDuration": "string (e.g., '2h')",
          "category": "string (from user interests)"
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
