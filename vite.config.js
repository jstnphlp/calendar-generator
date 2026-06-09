import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { fetchTidesForMonth, deleteTideData } from "./scripts/tideApi.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "tide-api",
      configureServer(server) {
        server.middlewares.use("/api/tides/", (req, res) => {
          if (req.method !== "GET") {
            res.statusCode = 405;
            res.end("Method Not Allowed");
            return;
          }
          const year = req.url.replace(/^\//, "");
          const filePath = join(__dirname, "src", "data", "tides", `tides-${year}.json`);
          if (!existsSync(filePath)) {
            res.statusCode = 404;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Not found" }));
            return;
          }
          res.setHeader("Content-Type", "application/json");
          res.end(readFileSync(filePath, "utf-8"));
        });

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
