// src/utils/analytics.ts

import { AnalyticsEvent, AnalyticsSummary, EventCountByType, TimeSeriesPoint } from "../types";

/** Bucket an ISO timestamp down to the minute */
function minuteBucket(iso: string): string {
  return iso.slice(0, 16); // "YYYY-MM-DDTHH:MM"
}

export function computeSummary(events: AnalyticsEvent[]): AnalyticsSummary {
  const totalEvents = events.length;

  // Unique users & sessions
  const uniqueUsers = new Set(
    events.map((e) => e.payload.userId).filter(Boolean)
  ).size;
  const uniqueSessions = new Set(
    events.map((e) => e.payload.sessionId).filter(Boolean)
  ).size;

  // Counts by type
  const typeCounts = new Map<string, number>();
  for (const e of events) {
    typeCounts.set(e.type, (typeCounts.get(e.type) ?? 0) + 1);
  }
  const eventsByType: EventCountByType[] = [...typeCounts.entries()]
    .map(([type, count]) => ({ type: type as EventCountByType["type"], count }))
    .sort((a, b) => b.count - a.count);

  // Counts by source
  const sourceCounts = new Map<string, number>();
  for (const e of events) {
    sourceCounts.set(e.source, (sourceCounts.get(e.source) ?? 0) + 1);
  }
  const eventsBySource = [...sourceCounts.entries()]
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count);

  // Time series (per-minute buckets, last 60 minutes shown)
  const bucketCounts = new Map<string, number>();
  for (const e of events) {
    const b = minuteBucket(e.timestamp);
    bucketCounts.set(b, (bucketCounts.get(b) ?? 0) + 1);
  }
  const timeSeries: TimeSeriesPoint[] = [...bucketCounts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-60)
    .map(([timestamp, count]) => ({ timestamp, count }));

  // Conversion rate: ride_requested → ride_completed
  const ridesRequested = typeCounts.get("ride_requested") ?? 0;
  const ridesCompleted = typeCounts.get("ride_completed") ?? 0;
  const conversionRate =
    ridesRequested > 0
      ? Math.round((ridesCompleted / ridesRequested) * 10000) / 100
      : null;

  // Avg ride duration
  const rideDurations = events
    .filter((e) => e.type === "ride_completed" && e.payload.durationSeconds != null)
    .map((e) => e.payload.durationSeconds as number);
  const avgRideDurationSeconds =
    rideDurations.length > 0
      ? Math.round(rideDurations.reduce((a, b) => a + b, 0) / rideDurations.length)
      : null;

  // Avg driver rating
  const ratings = events
    .filter((e) => e.type === "ride_completed" && e.payload.driverRating != null)
    .map((e) => e.payload.driverRating as number);
  const avgDriverRating =
    ratings.length > 0
      ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 100) / 100
      : null;

  // Revenue & failed payments
  const totalRevenue = events
    .filter((e) => e.type === "payment_success" && e.payload.amount != null)
    .reduce((sum, e) => sum + (e.payload.amount as number), 0);
  const failedPayments = typeCounts.get("payment_failed") ?? 0;

  // Most recent 20 events (newest first)
  const recentEvents = [...events]
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 20);

  return {
    totalEvents,
    uniqueUsers,
    uniqueSessions,
    eventsByType,
    eventsBySource,
    recentEvents,
    timeSeries,
    conversionRate,
    avgRideDurationSeconds,
    avgDriverRating,
    totalRevenue,
    failedPayments,
  };
}
