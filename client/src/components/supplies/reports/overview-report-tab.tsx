import { AlertTriangle, ClipboardList, CookingPot, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReportKpiCards } from "./report-kpi-cards";
import { formatRupiah } from "@/lib/format";
import type { OverviewReport } from "@/types/reports";

type OverviewReportTabProps = {
  report: OverviewReport;
};

export function OverviewReportTab({ report }: OverviewReportTabProps) {
  return (
    <div className="space-y-6">
      <ReportKpiCards
        items={[
          {
            label: "Omzet penjualan",
            value: formatRupiah(report.kpis.totalSalesRevenue),
            accentClassName: "text-indonesian-red",
          },
          {
            label: "Belanja bahan",
            value: formatRupiah(report.kpis.totalPurchaseCost),
            accentClassName: "text-blue-600",
          },
          {
            label: "Nilai stok saat ini",
            value: formatRupiah(report.kpis.totalStockSaleValueEstimate),
            accentClassName: "text-green-600",
          },
          {
            label: "Rata-rata order",
            value: formatRupiah(report.kpis.averageOrderValue),
            accentClassName: "text-orange-600",
            helperText: `${report.kpis.totalOrders} pesanan tercatat`,
          },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indonesian-red" />
              Menu paling laku
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {report.topSellingItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Belum ada penjualan pada periode ini.
              </p>
            ) : (
              report.topSellingItems.map((item, index) => (
                <div key={item.menuItemId} className="flex items-start justify-between gap-3 rounded-lg border p-3">
                  <div className="min-w-0">
                    <p className="font-medium">
                      {index + 1}. {item.name}
                    </p>
                    <p className="text-sm text-muted-foreground">{item.category}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-semibold">{item.quantitySold} porsi</p>
                    <p className="text-muted-foreground">{formatRupiah(item.revenue)}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CookingPot className="h-4 w-4 text-blue-600" />
              Pembelian terbesar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {report.topPurchasedSupplies.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Belum ada pembelian bahan pada periode ini.
              </p>
            ) : (
              report.topPurchasedSupplies.map((item, index) => (
                <div key={item.supplyId} className="flex items-start justify-between gap-3 rounded-lg border p-3">
                  <div className="min-w-0">
                    <p className="font-medium">
                      {index + 1}. {item.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.totalConvertedQuantity} {item.unit} dari {item.purchaseCount} transaksi
                    </p>
                  </div>
                  <div className="text-right text-sm font-semibold text-blue-600">
                    {formatRupiah(item.totalCost)}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              Prioritas tindak lanjut
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-yellow-900">Stok menipis</p>
                <Badge className="bg-yellow-200 text-yellow-900 hover:bg-yellow-200">
                  {report.kpis.lowStockCount} barang
                </Badge>
              </div>
              <p className="mt-2 text-sm text-yellow-800">
                {report.kpis.lowStockCount > 0
                  ? "Segera cek bahan yang mendekati batas minimum."
                  : "Semua bahan masih berada di atas batas minimum."}
              </p>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-blue-900">Resep belum lengkap</p>
                <Badge className="bg-blue-200 text-blue-900 hover:bg-blue-200">
                  {report.kpis.menuItemsWithoutRecipeCount} menu
                </Badge>
              </div>
              <p className="mt-2 text-sm text-blue-800">
                Menu tanpa resep tidak bisa mengurangi stok bahan otomatis saat penjualan.
              </p>
            </div>

            {report.recipeCoverage.menuItemsWithoutRecipe.slice(0, 4).map((item) => (
              <div key={item.menuItemId} className="rounded-lg border p-3 text-sm">
                <p className="font-medium">{item.name}</p>
                <p className="text-muted-foreground">{item.category}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-green-600" />
              Aktivitas stok terbaru
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {report.recentActivities.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Belum ada aktivitas stok pada periode ini.
              </p>
            ) : (
              report.recentActivities.map((activity) => (
                <div key={activity.id} className="rounded-lg border p-3">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.createdAt).toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
