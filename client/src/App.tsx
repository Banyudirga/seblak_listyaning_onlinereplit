import { useEffect, useState, type ComponentType } from "react";
import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient, getApiUrl } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import MenuPage from "@/pages/menu";
import Receipt from "@/pages/receipt";
import Admin from "@/pages/admin";
import Inventory from "@/pages/inventory";
import Supplies from "@/pages/supplies";
import Reports from "@/pages/reports";
import AdminLogin from "@/pages/admin-login";
import NotFound from "@/pages/not-found";

const LOGIN_PATH = "/admin/login";

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
      setLocation(LOGIN_PATH);
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
    // User will be redirected via effect above. Return null during transition.
    return null;
  }

  return <Component />;
}

const ProtectedAdminPage = () => <ProtectedAdminRoute component={Admin} />;
const ProtectedInventoryPage = () => <ProtectedAdminRoute component={Inventory} />;
const ProtectedSuppliesPage = () => <ProtectedAdminRoute component={Supplies} />;
const ProtectedReportsPage = () => <ProtectedAdminRoute component={Reports} />;

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/menu" component={MenuPage} />
      <Route path="/receipt" component={Receipt} />
      <Route path="/login">
        <Redirect to={LOGIN_PATH} />
      </Route>
      <Route path="/admin-login">
        <Redirect to={LOGIN_PATH} />
      </Route>
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={ProtectedAdminPage} />
      <Route path="/inventory" component={ProtectedInventoryPage} />
      <Route path="/supplies" component={ProtectedSuppliesPage} />
      <Route path="/reports" component={ProtectedReportsPage} />
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
