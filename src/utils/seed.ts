// src/utils/seed.ts
// Generates realistic-looking demo events spread over the last 2 hours.

import { v4 as uuidv4 } from "uuid";
import { eventStore } from "../api/store";
import { AnalyticsEvent, EventType } from "../types";

const SOURCES = ["web", "ios", "android"];
const PAGES = ["/", "/book", "/ride-history", "/profile", "/promo"];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function minutesAgo(n: number): string {
  return new Date(Date.now() - n * 60_000).toISOString();
}

export function seedDemoEvents(): void {
  const now = Date.now();
  const twoHoursAgo = now - 120 * 60_000;

  // Spread 120 events randomly over the last 120 minutes
  for (let i = 0; i < 120; i++) {
    const tsMs = twoHoursAgo + Math.random() * (now - twoHoursAgo);
    const timestamp = new Date(tsMs).toISOString();
    const userId = `user_${randomInt(1, 30)}`;
    const sessionId = `sess_${randomInt(1, 60)}`;
    const source = randomFrom(SOURCES);

    // Pick a weighted event type that reflects a realistic funnel
    const roll = Math.random();
    let type: EventType;
    let payload: Record<string, unknown> = { userId, sessionId };

    if (roll < 0.25) {
      type = "page_view";
      payload.page = randomFrom(PAGES);
    } else if (roll < 0.35) {
      type = "button_click";
      payload.buttonId = randomFrom(["book-now", "see-prices", "view-history", "apply-promo"]);
      payload.page = randomFrom(PAGES);
    } else if (roll < 0.55) {
      type = "ride_requested";
      payload.rideId = `ride_${uuidv4().slice(0, 8)}`;
    } else if (roll < 0.70) {
      type = "driver_assigned";
      payload.rideId = `ride_${uuidv4().slice(0, 8)}`;
    } else if (roll < 0.72) {
      type = "driver_arrived";
      payload.rideId = `ride_${uuidv4().slice(0, 8)}`;
    } else if (roll < 0.82) {
      type = "ride_completed";
      payload.rideId = `ride_${uuidv4().slice(0, 8)}`;
      payload.durationSeconds = randomInt(180, 2400);
      payload.driverRating = +(Math.random() * 2 + 3).toFixed(1); // 3.0–5.0
    } else if (roll < 0.86) {
      type = "ride_cancelled";
      payload.rideId = `ride_${uuidv4().slice(0, 8)}`;
    } else if (roll < 0.93) {
      type = "payment_success";
      payload.amount = +(Math.random() * 45 + 5).toFixed(2);
    } else if (roll < 0.96) {
      type = "payment_failed";
      payload.errorMessage = randomFrom(["insufficient_funds", "card_declined", "network_error"]);
    } else if (roll < 0.98) {
      type = "user_signup";
    } else {
      type = "user_login";
    }

    const event: AnalyticsEvent = {
      id: uuidv4(),
      type,
      timestamp,
      source,
      payload,
    };
    eventStore.add(event);
  }

  // Add a burst of activity in the last 5 minutes to make the chart interesting
  for (let i = 0; i < 15; i++) {
    const tsMs = now - Math.random() * 5 * 60_000;
    eventStore.add({
      id: uuidv4(),
      type: randomFrom<EventType>(["page_view", "ride_requested", "button_click"]),
      timestamp: new Date(tsMs).toISOString(),
      source: randomFrom(SOURCES),
      payload: { userId: `user_${randomInt(1, 30)}`, sessionId: `sess_${randomInt(1, 60)}` },
    });
  }

  console.log(`✅ Seeded ${eventStore.size} demo events.`);
}
