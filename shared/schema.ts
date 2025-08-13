import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const trips = pgTable("trips", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  startLocation: text("start_location").notNull(),
  endLocation: text("end_location").notNull(),
  startDate: timestamp("start_date").notNull(),
  startTime: text("start_time").notNull(),
  endDate: timestamp("end_date").notNull(),
  checkInTime: text("check_in_time").notNull(),
  isRoundTrip: varchar("is_round_trip").notNull().default("false"),

  interests: text("interests").array(),
  itinerary: jsonb("itinerary"),
  status: text("status").notNull().default("pending"), // pending, completed, failed
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
});

export const insertTripSchema = createInsertSchema(trips).omit({
  id: true,
  createdAt: true,
  status: true,
  itinerary: true,
});

export const planTripSchema = insertTripSchema.extend({
  startDate: z.string(),
  endDate: z.string(),
  isRoundTrip: z.string().default("false"),
});

export type InsertTrip = z.infer<typeof insertTripSchema>;
export type PlanTripRequest = z.infer<typeof planTripSchema>;
export type Trip = typeof trips.$inferSelect;

// Types for the itinerary structure
export interface TripItinerary {
  totalDays: number;
  totalDistance: number;
  totalDrivingTime: string;
  totalAttractions: number;
  days: TripDay[];
}

export interface TripDay {
  dayNumber: number;
  date: string;
  route: {
    from: string;
    to: string;
    distance: number;
    drivingTime: string;
    departureTime: string;
    arrivalTime: string;
  };
  attractions: Attraction[];
  overnightLocation: string;
}

export interface Attraction {
  name: string;
  description: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}
