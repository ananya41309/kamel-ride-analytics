// src/types/index.ts

export type EventType =
  | "page_view"
  | "button_click"
  | "form_submit"
  | "ride_requested"
  | "ride_completed"
  | "ride_cancelled"
  | "user_signup"
  | "user_login"
  | "payment_success"
  | "payment_failed"
  | "driver_assigned"
  | "driver_arrived";

export interface EventPayload {
  userId?: string;
  sessionId?: string;
  page?: string;
  buttonId?: string;
  rideId?: string;
  amount?: number;
  driverRating?: number;
  durationSeconds?: number;
  errorMessage?: string;
  [key: string]: unknown;
}

export interface AnalyticsEvent {
  id: string;
  type: EventType;
  timestamp: string; // ISO 8601
  source: string;    // e.g. "web", "ios", "android"
  payload: EventPayload;
}

export interface IngestEventRequest {
  type: EventType;
  source: string;
  payload?: EventPayload;
}

// ── Analytics response shapes ──────────────────────────────────────────────

export interface EventCountByType {
  type: EventType;
  count: number;
}

export interface TimeSeriesPoint {
  timestamp: string; // minute bucket
  count: number;
}

export interface AnalyticsSummary {
  totalEvents: number;
  uniqueUsers: number;
  uniqueSessions: number;
  eventsByType: EventCountByType[];
  eventsBySource: { source: string; count: number }[];
  recentEvents: AnalyticsEvent[];
  timeSeries: TimeSeriesPoint[];
  conversionRate: number | null; // ride_requested → ride_completed
  avgRideDurationSeconds: number | null;
  avgDriverRating: number | null;
  totalRevenue: number;
  failedPayments: number;
}
