import { ArrowLeft, BarChart3 } from "lucide-react";
import { Link } from "wouter";

import { ReportsDashboard } from "@/components/supplies/reports/reports-dashboard";
import { Button } from "@/components/ui/button";
import AdminAuthGuard from "@/components/admin-auth-guard";

export default function ReportsPage() {
  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-light-grey">
      <div className="bg-indonesian-red text-white">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-b-[28px] bg-indonesian-red px-4 py-5 sm:px-6 sm:py-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0">
                <Link href="/admin" className="inline-block">
                  <Button
                    variant="outline"
                    size="sm"
                    className="mb-4 h-9 border-white/80 bg-white text-indonesian-red hover:bg-white/90"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali ke Admin
                  </Button>
                </Link>

                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-[0.25em] text-red-100">
                    Laporan
                  </p>
                  <h1 className="max-w-xl text-2xl font-bold leading-tight sm:text-3xl">
                    Dashboard Laporan Operasional
                  </h1>
                  <p className="max-w-2xl text-sm leading-6 text-red-100 sm:text-base">
                    Pantau ringkasan stok, pembelian, penjualan, dan estimasi profit dari satu halaman admin.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 text-sm text-red-50">
                <BarChart3 className="h-5 w-5" />
                <span>Filter dan muat ulang tersedia di dalam dashboard laporan.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl p-6">
        <ReportsDashboard />
      </div>
    </div>
    </AdminAuthGuard>
  );
}
