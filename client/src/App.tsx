import { useEffect, useState, type ComponentType } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient, getApiUrl } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Receipt from "@/pages/receipt";
import Admin from "@/pages/admin";
import Inventory from "@/pages/inventory";
import Supplies from "@/pages/supplies";
import AdminLogin from "@/pages/admin-login";
import NotFound from "@/pages/not-found";

function ProtectedAdminRoute({ component: Component }: { component: ComponentType }) {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"loading" | "allowed" | "denied">("loading");

  useEffect(() => {
    let isMounted = true;

    fetch(getApiUrl("/api/admin/session"), { credentials: "include" })
      .then(async (res) => {
        const data = (await res.json()) as { authenticated?: boolean };
        if (isMounted) {
          setStatus(data.authenticated ? "allowed" : "denied");
        }
      })
      .catch(() => {
        if (isMounted) {
          setStatus("denied");
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (status === "denied") {
      setLocation("/admin/login");
    }
  }, [setLocation, status]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-light-grey flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Memeriksa akses admin...</p>
        </div>
      </div>
    );
  }

  if (status === "denied") {
    return null;
  }

  return <Component />;
}

const ProtectedAdminPage = () => <ProtectedAdminRoute component={Admin} />;
const ProtectedInventoryPage = () => <ProtectedAdminRoute component={Inventory} />;
const ProtectedSuppliesPage = () => <ProtectedAdminRoute component={Supplies} />;

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/receipt" component={Receipt} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={ProtectedAdminPage} />
      <Route path="/inventory" component={ProtectedInventoryPage} />
      <Route path="/supplies" component={ProtectedSuppliesPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
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
