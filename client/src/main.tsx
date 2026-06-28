import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { registerServiceWorker } from "./service-worker-registration";

// #region debug-point A:main-module
fetch("http://127.0.0.1:7777/event",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sessionId:"tooltip-useref-null",runId:"pre-fix",hypothesisId:"A",location:"client/src/main.tsx:6",msg:"[DEBUG] main module evaluated",data:{hasRootElement:!!document.getElementById("root"),userAgent:navigator.userAgent},ts:Date.now()})}).catch(()=>{});
// #endregion

// Register service worker for offline functionality
registerServiceWorker();

// #region debug-point A:main-render
fetch("http://127.0.0.1:7777/event",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sessionId:"tooltip-useref-null",runId:"pre-fix",hypothesisId:"A",location:"client/src/main.tsx:11",msg:"[DEBUG] createRoot about to render App",data:{rootElementTag:document.getElementById("root")?.tagName ?? null},ts:Date.now()})}).catch(()=>{});
// #endregion

createRoot(document.getElementById("root")!).render(<App />);
