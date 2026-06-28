import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Receipt from "@/pages/receipt";
import Admin from "@/pages/admin";
import Inventory from "@/pages/inventory";
import Supplies from "@/pages/supplies";
import NotFound from "@/pages/not-found";

// #region debug-point B:app-module
fetch("http://127.0.0.1:7777/event",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sessionId:"tooltip-useref-null",runId:"pre-fix",hypothesisId:"B",location:"client/src/App.tsx:12",msg:"[DEBUG] App module evaluated",data:{tooltipProviderType:typeof TooltipProvider,hasQueryClient:!!queryClient},ts:Date.now()})}).catch(()=>{});
// #endregion

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/receipt" component={Receipt} />
      <Route path="/admin" component={Admin} />
      <Route path="/inventory" component={Inventory} />
      <Route path="/supplies" component={Supplies} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // #region debug-point B:app-render
  fetch("http://127.0.0.1:7777/event",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sessionId:"tooltip-useref-null",runId:"pre-fix",hypothesisId:"B",location:"client/src/App.tsx:31",msg:"[DEBUG] App render entered",data:{tooltipProviderType:typeof TooltipProvider},ts:Date.now()})}).catch(()=>{});
  // #endregion
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
