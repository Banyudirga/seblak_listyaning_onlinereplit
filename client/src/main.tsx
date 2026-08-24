import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Disable/unregister any existing service worker (they cause cross-origin
// login/cookie issues between Vercel frontend & Railway backend).
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) =>
        Promise.all(
          registrations.map((registration) =>
            registration
              .unregister()
              .catch((error) =>
                console.warn(
                  "Service Worker unregistration warning (safe to ignore):",
                  error
                )
              )
          )
        )
      )
      .catch((error) =>
        console.warn("Service Worker cleanup warning (safe to ignore):", error)
      );

    // Also try to forcibly clear controller on next navigation
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage?.({ type: "SKIP_WAITING" });
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);
