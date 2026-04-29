// src/api/store.ts
// In-memory event store — swap for a DB in production.

import { AnalyticsEvent } from "../types";

class EventStore {
  private events: AnalyticsEvent[] = [];

  add(event: AnalyticsEvent): void {
    this.events.push(event);
  }

  getAll(): AnalyticsEvent[] {
    // Return a shallow copy so callers can't mutate the store directly.
    return [...this.events];
  }

  clear(): void {
    this.events = [];
  }

  get size(): number {
    return this.events.length;
  }
}

// Singleton
export const eventStore = new EventStore();
