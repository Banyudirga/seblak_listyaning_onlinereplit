import { AlertTriangle, Coins, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ReportKpiCards } from "./report-kpi-cards";
import { formatRupiah } from "@/lib/format";
import { getStatusText } from "@/lib/admin-helpers";
import type { ProfitEstimateReport } from "@/types/reports";

type ProfitReportTabProps = {
  report: ProfitEstimateReport;
};

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

export function ProfitReportTab({ report }: ProfitReportTabProps) {
  return (
    <div className="space-y-6">
      <ReportKpiCards
        items={[
          {
            label: "Omzet periode ini",
            value: formatRupiah(report.summary.totalRevenue),
            accentClassName: "text-indonesian-red",
          },
          {
            label: "Estimasi biaya bahan",
            value: formatRupiah(report.summary.estimatedIngredientCost),
            accentClassName: "text-blue-600",
          },
          {
            label: "Estimasi profit kotor",
            value: formatRupiah(report.summary.grossProfit),
            accentClassName: report.summary.grossProfit >= 0 ? "text-green-600" : "text-red-600",
          },
          {
            label: "Margin kotor",
            value: formatPercent(report.summary.grossMarginPercent),
            accentClassName: "text-orange-600",
            helperText: `${report.summary.orderCount} pesanan terhitung`,
          },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              Catatan akurasi estimasi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-yellow-900">Order tanpa resep lengkap</p>
                <Badge className="bg-yellow-200 text-yellow-900 hover:bg-yellow-200">
                  {report.summary.ordersWithoutRecipe}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-yellow-800">
                Menu tanpa resep tidak bisa dihitung biaya bahannya secara penuh.
              </p>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-blue-900">Bahan tanpa dasar biaya</p>
                <Badge className="bg-blue-200 text-blue-900 hover:bg-blue-200">
                  {report.summary.itemsWithoutCostBasisCount}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-blue-800">
                Terjadi saat resep ada, tetapi histori pembelian bahan itu belum cukup untuk menghitung biaya per unit.
              </p>
            </div>

            <p className="text-sm text-muted-foreground">
              Perhitungan ini adalah estimasi profit kotor berbasis resep dan rata-rata biaya bahan dari histori pembelian sampai akhir periode filter.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Profit per menu
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {report.byMenuItem.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Belum ada penjualan pada periode ini.
              </p>
            ) : (
              report.byMenuItem.slice(0, 10).map((item) => (
                <div key={item.menuItemId} className="rounded-lg border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.category}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${item.estimatedProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {formatRupiah(item.estimatedProfit)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Margin {formatPercent(item.marginPercent)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <Badge variant="outline">{item.quantitySold} porsi</Badge>
                    <Badge variant="outline">Omzet {formatRupiah(item.revenue)}</Badge>
                    <Badge variant="outline">Bahan {formatRupiah(item.estimatedIngredientCost)}</Badge>
                    {!item.hasRecipe ? <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Resep belum lengkap</Badge> : null}
                    {!item.hasCostBasis ? <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Biaya belum lengkap</Badge> : null}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-blue-600" />
              Bahan paling besar biayanya
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {report.topIngredientCosts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Belum ada data biaya bahan yang bisa dihitung.
              </p>
            ) : (
              report.topIngredientCosts.map((item) => (
                <div key={item.supplyId} className="rounded-lg border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Terpakai {item.estimatedUsedQuantity} {item.unit}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-blue-600">{formatRupiah(item.estimatedCost)}</p>
                      <p className="text-xs text-muted-foreground">
                        Avg {formatRupiah(item.averageCostPerUnit)}/{item.unit}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estimasi profit per pesanan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pesanan</TableHead>
                    <TableHead>Pelanggan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Omzet</TableHead>
                    <TableHead>Biaya bahan</TableHead>
                    <TableHead>Profit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <div className="font-medium">#{row.id}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(row.createdAt).toLocaleString("id-ID")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>{row.customerName}</div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {row.hasMissingRecipe ? (
                            <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                              Resep belum lengkap
                            </Badge>
                          ) : null}
                          {row.hasMissingCostBasis ? (
                            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                              Biaya belum lengkap
                            </Badge>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getStatusText(row.status)}</Badge>
                      </TableCell>
                      <TableCell>{formatRupiah(row.totalAmount)}</TableCell>
                      <TableCell>{formatRupiah(row.estimatedIngredientCost)}</TableCell>
                      <TableCell className={row.estimatedProfit >= 0 ? "font-semibold text-green-600" : "font-semibold text-red-600"}>
                        <div>{formatRupiah(row.estimatedProfit)}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatPercent(row.marginPercent)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {report.rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                        Tidak ada penjualan pada periode ini.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
