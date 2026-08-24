import { useEffect, useState, type ReactNode } from "react";
import { useLocation } from "wouter";
import { RefreshCw } from "lucide-react";
import { getApiUrl } from "@/lib/queryClient";

type AdminSessionResponse = {
  authenticated?: boolean;
};

const LOGIN_PATH = "/admin/login";

async function fetchAdminSession() {
  const res = await fetch(getApiUrl("/api/admin/session"), {
    credentials: "include",
  });

  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(text);
  }

  return (await res.json()) as AdminSessionResponse;
}

interface AdminAuthGuardProps {
  children: ReactNode;
}

export default function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const [, setLocation] = useLocation();
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    let isMounted = true;

    fetchAdminSession()
      .then((data) => {
        if (!isMounted) return;

        if (!data.authenticated) {
          setLocation(LOGIN_PATH);
          return;
        }

        setIsCheckingSession(false);
      })
      .catch(() => {
        if (isMounted) {
          setLocation(LOGIN_PATH);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [setLocation]);

  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-light-grey flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Memverifikasi sesi admin...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
