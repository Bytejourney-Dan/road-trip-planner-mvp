import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { planTripSchema } from "@shared/schema";
import { generateTripItinerary } from "./services/openai";
import { geocodeItinerary } from "./services/maps";

export async function registerRoutes(app: Express): Promise<Server> {
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
        interests: planRequest.interests,
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
          interests: planRequest.interests,
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

        res.status(500).json({ 
          error: "Failed to generate trip itinerary",
          message: error instanceof Error ? error.message : "Unknown error"
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
