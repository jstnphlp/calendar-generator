import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fetchTidesForMonth, deleteTideData } from "./scripts/tideApi.js";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "tide-api",
      configureServer(server) {
        server.middlewares.use("/api/fetch-tides", async (req, res) => {
          if (req.method !== "POST") {
            res.statusCode = 405;
            res.end("Method Not Allowed");
            return;
          }
          let body = "";
          req.on("data", (chunk) => (body += chunk));
          req.on("end", async () => {
            try {
              const { year, month } = JSON.parse(body);
              const result = await fetchTidesForMonth(year, month);
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ success: true, ...result }));
            } catch (e) {
              res.statusCode = 500;
              res.end(JSON.stringify({ success: false, error: e.message }));
            }
          });
        });

        server.middlewares.use("/api/delete-tides", async (req, res) => {
          if (req.method !== "POST") {
            res.statusCode = 405;
            res.end("Method Not Allowed");
            return;
          }
          let body = "";
          req.on("data", (chunk) => (body += chunk));
          req.on("end", async () => {
            try {
              const { year, month } = JSON.parse(body);
              const result = await deleteTideData(year, month);
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ success: true, ...result }));
            } catch (e) {
              res.statusCode = 500;
              res.end(JSON.stringify({ success: false, error: e.message }));
            }
          });
        });
      },
    },
  ],
});
