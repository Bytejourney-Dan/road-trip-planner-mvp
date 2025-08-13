import { type Trip, type InsertTrip } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getTrip(id: string): Promise<Trip | undefined>;
  createTrip(trip: InsertTrip): Promise<Trip>;
  updateTrip(id: string, updates: Partial<Trip>): Promise<Trip | undefined>;
}

export class MemStorage implements IStorage {
  private trips: Map<string, Trip>;

  constructor() {
    this.trips = new Map();
  }

  async getTrip(id: string): Promise<Trip | undefined> {
    return this.trips.get(id);
  }

  async createTrip(insertTrip: InsertTrip): Promise<Trip> {
    const id = randomUUID();
    const trip: Trip = {
      ...insertTrip,
      id,
      status: "pending",
      itinerary: null,
      createdAt: new Date(),
    };
    this.trips.set(id, trip);
    return trip;
  }

  async updateTrip(id: string, updates: Partial<Trip>): Promise<Trip | undefined> {
    const trip = this.trips.get(id);
    if (!trip) return undefined;
    
    const updatedTrip = { ...trip, ...updates };
    this.trips.set(id, updatedTrip);
    return updatedTrip;
  }
}

export const storage = new MemStorage();
