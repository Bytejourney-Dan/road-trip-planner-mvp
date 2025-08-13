import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { planTripSchema } from "@shared/schema";
import { generateTripItinerary } from "./services/openai";

import { geocodeItinerary } from "./services/maps";

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve Google Maps API key to frontend
  app.get("/api/config/maps-key", (req, res) => {
    res.json({ 
      apiKey: process.env.GOOGLE_MAPS_FRONTEND_API_KEY 
    });
  });

  // Routes API endpoint
  app.post("/api/routes", async (req, res) => {
    try {
      const routeRequest = req.body;
      const apiKey = process.env.GOOGLE_MAPS_SERVER_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ error: "Google Maps Server API key not configured" });
      }

      const response = await fetch(`https://routes.googleapis.com/directions/v2:computeRoutes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline'
        },
        body: JSON.stringify(routeRequest)
      });

      if (!response.ok) {
        console.log('Routes API error:', response.status, response.statusText);
        return res.status(response.status).json({ error: 'Routes API request failed' });
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Routes API error:", error);
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
