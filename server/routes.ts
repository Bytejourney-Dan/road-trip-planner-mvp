import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { planTripSchema } from "@shared/schema";
import { generateTripItinerary } from "./services/openai";

import { geocodeItinerary } from "./services/maps";

// Geocode city names → lat/lng using Geocoding API (since you enabled it)
async function geocodeStopsByName(names: string[], apiKey: string) {
  const out: Array<{ name: string; lat: number; lng: number }> = [];
  for (const name of names) {
    const url =
      "https://maps.googleapis.com/maps/api/geocode/json?address=" +
      encodeURIComponent(name) +
      "&key=" +
      apiKey;

    const r = await fetch(url);
    const j = await r.json();

    if (!j.results?.[0]) {
      throw new Error(`Geocode failed for "${name}": ${JSON.stringify(j)}`);
    }
    const loc = j.results[0].geometry.location;
    out.push({ name, lat: loc.lat, lng: loc.lng });
  }
  return out;
}

function toRoutesBodyFromStops(
  stops: Array<{ name: string; lat: number; lng: number }>
) {
  const [origin, ...rest] = stops;
  const destination = rest.pop()!;
  return {
    origin: {
      location: {
        latLng: { latitude: origin.lat, longitude: origin.lng },
      },
    },
    destination: {
      location: {
        latLng: { latitude: destination.lat, longitude: destination.lng },
      },
    },
    intermediates: rest.map((s) => ({
      location: {
        latLng: { latitude: s.lat, longitude: s.lng },
      },
    })),
    travelMode: "DRIVE",
    routingPreference: "TRAFFIC_AWARE",
    units: "IMPERIAL",
  };
}



export async function registerRoutes(app: Express): Promise<Server> {
  // Serve Google Maps API key to frontend
  app.get("/api/config/maps-key", (req, res) => {
    res.json({ 
      apiKey: process.env.GOOGLE_MAPS_FRONTEND_API_KEY 
    });
  });

  // Routes API endpoint — patched with logging + proper v2 body handling
  app.post("/api/routes", async (req, res) => {
    try {
      const apiKey = process.env.GOOGLE_MAPS_SERVER_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Google Maps Server API key not configured" });
      }

      // 1) LOG what the client sent (so you can see shape & values in Replit console)
      console.log("CLIENT /api/routes payload:", JSON.stringify(req.body));

      // 2) Build a valid Routes v2 body
      // Accept either:
      //   A) { stops: [{name,lat,lng}, ...] }  (preferred)
      //   B) { ordered_stops: ["City A", "City B", ...] } (we'll geocode each name)
      let routesBody: any;

      if (Array.isArray(req.body?.stops) && req.body.stops.length >= 2) {
        // Already have lat/lng
        routesBody = toRoutesBodyFromStops(req.body.stops);
      } else if (Array.isArray(req.body?.ordered_stops) && req.body.ordered_stops.length >= 2) {
        // Geocode names → lat/lng (uses Geocoding API)
        const stops = await geocodeStopsByName(req.body.ordered_stops, apiKey);
        routesBody = toRoutesBodyFromStops(stops);
      } else {
        return res.status(400).json({
          error: "Invalid request",
          message:
            'Send { "stops":[{ "name": "...", "lat": 0, "lng": 0 }, ...] } OR { "ordered_stops":["City A","City B", ...] } (min 2)',
        });
      }

      const fieldMask = [
        "routes.duration",
        "routes.distanceMeters",
        "routes.legs.duration",
        "routes.legs.distanceMeters",
        "routes.polyline.encodedPolyline",
      ].join(",");

      // 3) Call Routes API v2
      const response = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": fieldMask,
        },
        body: JSON.stringify(routesBody),
      });

      const text = await response.text();

      // 4) If Google returns an error, LOG the exact body so you see why
      if (!response.ok) {
        console.error("ROUTES ERROR", response.status, text); // <- check Replit console
        let code: string | undefined;
        try { code = JSON.parse(text)?.error?.status; } catch {}
        return res.status(400).json({
          error: "Routes API request failed",
          status: response.status,
          code,
          hint: "Ensure server key allows Routes API + Geocoding, and body uses latLng/placeId objects.",
        });
      }

      // 5) Normalize output (optional but handy for frontend)
      const data = JSON.parse(text);
      const route = data.routes?.[0];
      const legs = route?.legs ?? [];

      const toHHMM = (sec?: number) => {
        if (sec === undefined || sec === null) return undefined;
        const h = Math.floor(sec / 3600);
        const m = Math.round((sec % 3600) / 60);
        return `${h ? h + " h " : ""}${m} m`;
      };
      const miles = (m?: number) => (m ? (m / 1609.344).toFixed(1) + " mi" : undefined);

      return res.json({
        polyline: route?.polyline?.encodedPolyline,
        legs: legs.map((leg: any, i: number) => ({
          index: i,
          durationSeconds: leg.duration?.seconds,
          durationText: toHHMM(leg.duration?.seconds),
          distanceMeters: leg.distanceMeters,
          distanceText: miles(leg.distanceMeters),
        })),
        totals: {
          durationText: toHHMM(route?.duration?.seconds),
          distanceText: miles(route?.distanceMeters),
        },
        // also return the resolved stops if you want to re-render markers
        resolvedStops:
          Array.isArray(req.body?.stops) && req.body.stops.length >= 2
            ? req.body.stops
            : undefined,
        raw: data, // keep raw for future fields
      });
    } catch (err) {
      console.error("Routes handler crash:", err);
      res.status(500).json({ error: "Failed to compute routes" });
    }
  });


  // Plan a new trip
  app.post("/api/trips/plan", async (req, res) => {
    try {
      const planRequest = planTripSchema.parse(req.body);
      
      // Create initial trip record
      const trip = await storage.createTrip({
        startLocation: planRequest.startLocation,
        endLocation: planRequest.endLocation,
        startDate: new Date(planRequest.startDate),
        startTime: planRequest.startTime,
        endDate: new Date(planRequest.endDate),
        checkInTime: planRequest.checkInTime,
        isRoundTrip: planRequest.isRoundTrip || "false",
        interests: planRequest.interests || null,
      });

      // Generate itinerary using ChatGPT
      try {
        // Debug logging to check interests
        console.log("=== DEBUG: Route Handler Data ===");
        console.log("Plan Request interests:", planRequest.interests);
        console.log("Plan Request body:", req.body);
        console.log("=================================");
        
        const itinerary = await generateTripItinerary({
          startLocation: planRequest.startLocation,
          endLocation: planRequest.endLocation,
          startDate: planRequest.startDate,
          startTime: planRequest.startTime,
          endDate: planRequest.endDate,
          checkInTime: planRequest.checkInTime,
          isRoundTrip: planRequest.isRoundTrip,
          interests: planRequest.interests || undefined,
        });

        // Geocode locations in the itinerary
        const enhancedItinerary = await geocodeItinerary(itinerary);

        // Update trip with completed itinerary
        const updatedTrip = await storage.updateTrip(trip.id, {
          itinerary: enhancedItinerary,
          status: "completed",
        });

        res.json(updatedTrip);
      } catch (error) {
        console.error("Error generating itinerary:", error);
        
        // Update trip status to failed
        await storage.updateTrip(trip.id, {
          status: "failed",
        });

        // Provide specific error messages for common API issues
        let errorMessage = "Failed to generate trip itinerary";
        let userMessage = "Unknown error";
        
        if (error instanceof Error) {
          if (error.message.includes("exceeded your current quota")) {
            errorMessage = "OpenAI API quota exceeded";
            userMessage = "Your OpenAI API key has exceeded its usage quota. Please check your OpenAI billing and usage limits at https://platform.openai.com/usage";
          } else if (error.message.includes("401") || error.message.includes("authentication")) {
            errorMessage = "OpenAI API authentication failed";
            userMessage = "Please check that your OpenAI API key is valid and has the correct permissions";
          } else if (error.message.includes("rate limit")) {
            errorMessage = "OpenAI API rate limit exceeded";
            userMessage = "Too many requests to OpenAI API. Please wait a moment and try again";
          } else if (error.message.includes("Google Maps API") || error.message.includes("geocode")) {
            errorMessage = "Google Maps API error";
            userMessage = "Google Maps API key issue detected. Please verify your Google Maps Server API key is valid and has Geocoding API enabled";
          } else {
            userMessage = error.message;
          }
        }

        res.status(500).json({ 
          error: errorMessage,
          message: userMessage
        });
      }
    } catch (error) {
      console.error("Error planning trip:", error);
      res.status(400).json({ 
        error: "Invalid trip planning request",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Search for place details using Places API
  app.post("/api/places/search", async (req, res) => {
    try {
      const { query } = req.body;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ 
          error: "Invalid request",
          message: "Query parameter is required"
        });
      }

      const { getPlaceDetails } = await import("./services/maps.js");
      const placeDetails = await getPlaceDetails(query);
      
      if (!placeDetails) {
        return res.status(404).json({ 
          error: "Place not found",
          message: `No details found for: ${query}`
        });
      }

      res.json({
        name: placeDetails.name,
        formattedAddress: placeDetails.formattedAddress,
        rating: placeDetails.rating,
        userRatingsTotal: placeDetails.userRatingsTotal,
        photos: placeDetails.photos,
        website: placeDetails.website,
        formattedPhoneNumber: placeDetails.phoneNumber,
        openingHours: null // Not included in current getPlaceDetails implementation
      });
    } catch (error) {
      console.error("Error searching place details:", error);
      res.status(500).json({ 
        error: "Failed to search place details",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get a specific trip
  app.get("/api/trips/:id", async (req, res) => {
    try {
      const trip = await storage.getTrip(req.params.id);
      if (!trip) {
        return res.status(404).json({ error: "Trip not found" });
      }
      res.json(trip);
    } catch (error) {
      console.error("Error getting trip:", error);
      res.status(500).json({ 
        error: "Failed to retrieve trip",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
