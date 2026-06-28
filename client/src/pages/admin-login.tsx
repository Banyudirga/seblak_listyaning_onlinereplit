import { type FormEvent, useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { LockKeyhole, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { getApiUrl } from "@/lib/queryClient";

type AdminSessionResponse = {
  authenticated?: boolean;
};

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

export default function AdminLogin() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [password, setPassword] = useState("");
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    let isMounted = true;

    fetchAdminSession()
      .then((data) => {
        if (!isMounted) return;

        if (data.authenticated) {
          setLocation("/admin");
          return;
        }

        setIsCheckingSession(false);
      })
      .catch(() => {
        if (isMounted) {
          setIsCheckingSession(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [setLocation]);

  const loginMutation = useMutation({
    mutationFn: async (adminPassword: string) => {
      const res = await fetch(getApiUrl("/api/admin/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: adminPassword }),
        credentials: "include",
      });

      if (!res.ok) {
        const text = (await res.text()) || res.statusText;
        throw new Error(text);
      }

      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Berhasil masuk",
        description: "Akses admin telah dibuka.",
      });
      setLocation("/admin");
    },
    onError: (error: Error) => {
      toast({
        title: "Login gagal",
        description: error.message || "Password admin tidak valid.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    loginMutation.mutate(password);
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-light-grey flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Memeriksa sesi admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-grey flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indonesian-red/10">
            <LockKeyhole className="h-6 w-6 text-indonesian-red" />
          </div>
          <CardTitle className="text-center text-2xl">Login Admin</CardTitle>
          <CardDescription className="text-center">
            Masukkan password admin untuk membuka dashboard pengelolaan.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="admin-password" className="text-sm font-medium">
                Password Admin
              </label>
              <Input
                id="admin-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Masukkan password admin"
                autoComplete="current-password"
                disabled={loginMutation.isPending}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-indonesian-red hover:bg-red-700"
              disabled={loginMutation.isPending || !password.trim()}
            >
              {loginMutation.isPending ? "Memproses..." : "Masuk"}
            </Button>

            <Link href="/" className="block">
              <Button type="button" variant="outline" className="w-full">
                Kembali ke Beranda
              </Button>
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}