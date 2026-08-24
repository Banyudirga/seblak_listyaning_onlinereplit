import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, LogIn } from "lucide-react";
import { getApiUrl } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

const loginSchema = z.object({
  password: z.string().min(1, "Password wajib diisi"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // When user clicks "Dashboard Admin" from footer, we always want them to SEE
  // the login screen (even if they are already logged in from a previous
  // session). Footer navigates here with ?force=1.
  const params = new URLSearchParams(window.location.search);
  const forcePrompt = params.get("force") === "1" || params.get("force") === "true";

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { password: "" },
  });

  const [pageState, setPageState] = useState<
    "initializing" | "show-login" | "auto-redirecting"
  >("initializing");

  useEffect(() => {
    let cancelled = false;

    async function checkAndDecide() {
      try {
        // === ?force=1 branch: ALWAYS show login, clear current session ===
        if (forcePrompt) {
          try {
            await fetch(getApiUrl("/api/admin/logout"), {
              method: "POST",
              credentials: "include",
            });
          } catch {
            /* ignore */
          }
          if (!cancelled) {
            setPageState("show-login");
          }
          return;
        }

        // === No ?force=1: skip to dashboard if session exists ===
        const res = await fetch(getApiUrl("/api/admin/session"), {
          credentials: "include",
        });
        const data = (await res.json()) as { authenticated?: boolean };

        if (!cancelled && data.authenticated) {
          setPageState("auto-redirecting");
          setTimeout(() => {
            setLocation("/admin");
          }, 0);
        } else if (!cancelled) {
          setPageState("show-login");
        }
      } catch {
        if (!cancelled) {
          setPageState("show-login");
        }
      }
    }

    checkAndDecide();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forcePrompt]);

  async function onSubmit(values: LoginValues) {
    setIsLoggingIn(true);
    try {
      const res = await fetch(getApiUrl("/api/admin/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password: values.password }),
      });

      const data = (await res.json()) as {
        success?: boolean;
        message?: string;
        error?: string;
      };

      if (!res.ok || !data.success) {
        toast({
          title: "Login gagal",
          description: data.message || data.error || "Password admin tidak valid.",
          variant: "destructive",
        });
        setIsLoggingIn(false);
        return;
      }

      toast({
        title: "Berhasil masuk",
        description: "Memverifikasi sesi admin...",
      });

      // Confirm the session is actually set, then go to dashboard.
      // Retry a couple times so cross-domain cookies take effect in production.
      let verified = false;
      for (let i = 0; i < 5; i++) {
        const sess = await fetch(getApiUrl("/api/admin/session"), {
          credentials: "include",
        });
        const sessData = (await sess.json()) as { authenticated?: boolean };
        if (sessData.authenticated) {
          verified = true;
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      if (!verified) {
        toast({
          title: "Sesi belum terdeteksi",
          description: "Silakan refresh halaman / login ulang.",
          variant: "destructive",
        });
        setIsLoggingIn(false);
        return;
      }

      setLocation("/admin");
    } catch (err) {
      toast({
        title: "Login gagal",
        description: "Terjadi kesalahan jaringan, coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingIn(false);
    }
  }

  if (pageState === "initializing") {
    return (
      <div className="min-h-screen bg-light-grey flex items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-indonesian-red" />
      </div>
    );
  }

  if (pageState === "auto-redirecting") {
    return (
      <div className="min-h-screen bg-light-grey flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-indonesian-red" />
          <p>Masuk ke dashboard admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-grey flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button
          type="button"
          onClick={() => setLocation("/")}
          className="mb-4 flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Beranda
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-100 mb-3">
              <LogIn className="h-7 w-7 text-indonesian-red" />
            </div>
            <h1 className="text-xl font-bold mb-1">Login Admin</h1>
            <p className="text-sm text-gray-600">
              {forcePrompt
                ? "Masukkan password admin untuk masuk ke dashboard."
                : "Masukkan password admin untuk mengakses panel manajemen."}
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password Admin</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Masukkan password admin..."
                          autoComplete="off"
                          autoFocus
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((s) => !s)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-800 px-2 py-1 rounded"
                        >
                          {showPassword ? "Sembunyikan" : "Lihat"}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-indonesian-red hover:bg-red-700 text-white"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <LogIn className="h-4 w-4 mr-2" />
                )}
                Masuk
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
