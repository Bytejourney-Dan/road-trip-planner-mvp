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
ROUND TRIP OPTIMIZATION STRATEGY:
This is a ROUND TRIP that should form a scenic loop with maximum route variation. Apply these rules in order of priority:

1. IDEAL LOOP FORMATION (when geography and distance allow):
   - Plan distinct outbound and return routes using different highways/corridors
   - Choose overnight stops 100+ miles apart between outbound and return legs
   - Use geographic separation strategies (coastal vs inland, northern vs southern routes)
   - Create a visible loop pattern on the map

2. FLEXIBLE ADAPTATION (when ideal rules conflict with geography or trip length):
   - If geography limits route options (islands, peninsulas, mountain ranges), focus on maximizing scenic variety
   - If trip is too short for full separation, minimize overlap and use different highway systems where possible
   - For constrained areas, vary the specific roads, scenic routes, or approaches even if general direction is similar
   - Prioritize different overnight cities even if some route segments must be shared

3. ROUTE VARIATION STRATEGIES:
   - California: I-5 (Central Valley) vs Highway 1 (Coast) vs I-395 (Eastern Sierra)
   - Cross-country: Northern states vs southern states corridors
   - Regional: Mountain passes vs valley routes vs coastal highways
   - Always choose different overnight cities for outbound vs return

The goal is maximum scenic variety and route diversity within geographic constraints.` : ''}

${request.interests && request.interests.length > 0 ? `- Travel Interests: ${request.interests.join(', ')}

ATTRACTION SELECTION RULES: 
1. For each overnight stop, recommend exactly 5 attractions within 100 miles.
2. PRIORITIZE attractions from selected interest categories ONLY.
3. If fewer than 5 attractions match selected categories, fill remaining slots with other high-quality attractions (scenic viewpoints, historic sites, local landmarks, or highly-rated destinations).
4. Every selected interest category MUST appear somewhere in the final itinerary.
5. Only include driving routes between overnight stops - do NOT route through attractions in the initial route.

For each interest category selected:
${request.interests.map(interest => `- ${interest}: MUST include specific attractions of this type within 100 miles of overnight stops`).join('\n')}

Examples of what to include:
- For "Beaches and coast": Include beaches, coastal viewpoints, seaside towns, coastal state parks, lighthouses, or oceanfront attractions
- For "Waterfalls": Include named waterfalls, waterfall hikes, or cascade viewpoints
- For "Mountains": Include mountain peaks, scenic overlooks, mountain parks, or alpine areas
- For "National and State Parks": Include specific national or state parks along the route

Distribute these interest-based attractions across different days to ensure variety.` : ''}

Rules:
- Assume travel is by car
- Day 1 starts at the provided start date/time
- All subsequent days start at 9:00 AM local time
- Keep the total number of stops (including start, overnights, destination, and attractions) at or below 25
- Ensure realistic driving times and distances between overnight stops only
- Include estimated driving times between overnight cities
- Include exactly 5 attractions per day that are within 100 miles of the overnight stop
- The initial route should ONLY connect overnight stops - do not include attractions in the driving route
- Prioritize attractions from selected interest categories, fill remaining with high-quality alternatives
${isRoundTrip ? `- ROUND TRIP OPTIMIZATION RULES:
  * MAXIMIZE ROUTE VARIETY: Use different highways, corridors, and geographic regions when possible
  * GEOGRAPHIC ADAPTATION: Follow loop rules unless geography or distance makes them impractical
  * MINIMIZE OVERLAP: When full separation isn't possible, reduce shared segments and vary specific routes
  * DIFFERENT OVERNIGHT CITIES: Always use different cities for outbound vs return, even in constrained areas
  * SCENIC DIVERSITY: Each leg should offer distinct landscapes and experiences within geographic limits` : ''}


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
