// Import environment variables first
import './env';

import express, { type Request, Response, NextFunction } from "express";
import { setupVite, serveStatic, log } from "./vite";

// Import getStorage directly to avoid early initialization
import { getStorage } from "./storage";

// Force re-initialization of storage after environment variables are loaded
const storage = getStorage();

// Import routes after storage is initialized
import { registerRoutes } from "./routes";

const app = express();
const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    const origin = req.headers.origin;

    // Always set Vary: Origin so caches don't get confused between origins
    res.setHeader('Vary', 'Origin');

    if (origin) {
      if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      } else {
        // Fallback: if no explicit CORS_ORIGIN set but request comes from browser,
        // echo back origin (for dev/staging; production should set CORS_ORIGIN).
        if (allowedOrigins.length === 0) {
          res.setHeader('Access-Control-Allow-Origin', origin);
        }
      }
    } else if (allowedOrigins.length === 0) {
      // No origin header and no explicit allow-list (local curl, health checks)
      res.setHeader('Access-Control-Allow-Origin', '*');
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Expose-Headers', 'Set-Cookie');

    if (req.method === 'OPTIONS') {
      // Set cookie-related headers for preflight as well
      res.setHeader('Access-Control-Max-Age', '86400');
      return res.status(204).end();
    }

    next();
  });
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen(port, '0.0.0.0', () => {
    log(`serving on port ${port}`);
  });
})();
