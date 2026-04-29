// src/api/routes.ts

import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { eventStore } from "./store";
import { computeSummary } from "../utils/analytics";
import { AnalyticsEvent, IngestEventRequest } from "../types";

export const router = Router();

// ── POST /events  (ingest) ─────────────────────────────────────────────────
router.post("/events", (req: Request, res: Response) => {
  const body = req.body as Partial<IngestEventRequest>;

  if (!body.type || !body.source) {
    res.status(400).json({ error: "`type` and `source` are required." });
    return;
  }

  const event: AnalyticsEvent = {
    id: uuidv4(),
    type: body.type,
    source: body.source,
    timestamp: new Date().toISOString(),
    payload: body.payload ?? {},
  };

  eventStore.add(event);
  res.status(201).json({ success: true, event });
});

// ── GET /events  (list all) ────────────────────────────────────────────────
router.get("/events", (_req: Request, res: Response) => {
  res.json(eventStore.getAll());
});

// ── GET /analytics  (computed summary) ────────────────────────────────────
router.get("/analytics", (_req: Request, res: Response) => {
  const summary = computeSummary(eventStore.getAll());
  res.json(summary);
});

// ── DELETE /events  (reset – useful for testing) ──────────────────────────
router.delete("/events", (_req: Request, res: Response) => {
  eventStore.clear();
  res.json({ success: true, message: "All events cleared." });
});
