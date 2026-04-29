// src/server.ts

import express from "express";
import cors from "cors";
import path from "path";
import { router } from "./api/routes";
import { seedDemoEvents } from "./utils/seed";

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(cors());
app.use(express.json());

// API routes
app.use("/api", router);

// Serve the dashboard HTML
app.use(express.static(path.join(__dirname, "../public")));
app.get("*path", (_req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Seed some demo data so the dashboard isn't empty on first load
seedDemoEvents();

app.listen(PORT, () => {
  console.log(`\n🚗 Kamel Ride Analytics running at http://localhost:${PORT}`);
  console.log(`   API:       http://localhost:${PORT}/api/events`);
  console.log(`   Analytics: http://localhost:${PORT}/api/analytics`);
  console.log(`   Dashboard: http://localhost:${PORT}\n`);
});

export default app;
