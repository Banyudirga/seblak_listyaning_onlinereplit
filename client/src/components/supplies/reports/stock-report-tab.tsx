import { Package2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ReportKpiCards } from "./report-kpi-cards";
import { formatRupiah } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { StockReport } from "@/types/reports";

type StockReportTabProps = {
  report: StockReport;
};

function getStockBadgeClassName(status: StockReport["items"][number]["stockStatus"]) {
  if (status === "out") return "bg-red-100 text-red-800 hover:bg-red-100";
  if (status === "low") return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
  return "bg-green-100 text-green-800 hover:bg-green-100";
}

function getStockStatusText(status: StockReport["items"][number]["stockStatus"]) {
  if (status === "out") return "Habis";
  if (status === "low") return "Menipis";
  return "Aman";
}

export function StockReportTab({ report }: StockReportTabProps) {
  return (
    <div className="space-y-6">
      <ReportKpiCards
        items={[
          {
            label: "Total barang",
            value: report.summary.totalSupplies,
            accentClassName: "text-indonesian-red",
          },
          {
            label: "Stok aman",
            value: report.summary.healthyStockCount,
            accentClassName: "text-green-600",
          },
          {
            label: "Stok menipis",
            value: report.summary.lowStockCount,
            accentClassName: "text-yellow-600",
          },
          {
            label: "Stok habis",
            value: report.summary.outOfStockCount,
            accentClassName: "text-red-600",
          },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package2 className="h-4 w-4 text-indonesian-red" />
            Snapshot stok bahan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Barang</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Stok saat ini</TableHead>
                  <TableHead>Batas minimum</TableHead>
                  <TableHead>Info beli</TableHead>
                  <TableHead>Harga jual dasar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.items.map((item) => (
                  <TableRow key={item.supplyId}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex h-12 w-12 items-center justify-center overflow-hidden rounded-md border bg-muted text-xs text-muted-foreground",
                            item.imageUrl ? "p-0" : "px-2 text-center",
                          )}
                        >
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            "No image"
                          )}
                        </div>
                        <div className="min-w-[180px]">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.supplierName || "Supplier belum diisi"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStockBadgeClassName(item.stockStatus)}>
                        {getStockStatusText(item.stockStatus)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {item.currentStock} {item.unit}
                    </TableCell>
                    <TableCell>
                      {item.lowStockThreshold} {item.unit}
                    </TableCell>
                    <TableCell>
                      1 {item.defaultPurchaseUnit} = {item.defaultBaseUnitsPerPurchaseUnit} {item.unit}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{formatRupiah(item.defaultSalePricePerUnit)}</div>
                      <div className="text-xs text-muted-foreground">
                        Estimasi stok: {formatRupiah(item.estimatedSaleValue)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {report.items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                      Belum ada barang untuk ditampilkan.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat pergerakan stok</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Barang</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Perubahan</TableHead>
                  <TableHead>Referensi</TableHead>
                  <TableHead>Catatan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.movements.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell>{new Date(movement.createdAt).toLocaleString("id-ID")}</TableCell>
                    <TableCell className="font-medium">{movement.supplyName}</TableCell>
                    <TableCell className="capitalize">{movement.movementType}</TableCell>
                    <TableCell className={movement.quantityChange >= 0 ? "font-medium text-green-600" : "font-medium text-red-600"}>
                      {movement.quantityChange > 0 ? `+${movement.quantityChange}` : movement.quantityChange} {movement.unit}
                    </TableCell>
                    <TableCell>
                      {movement.referenceType}
                      {movement.referenceId ? ` #${movement.referenceId}` : ""}
                    </TableCell>
                    <TableCell>{movement.notes || "-"}</TableCell>
                  </TableRow>
                ))}
                {report.movements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                      Tidak ada pergerakan stok pada periode ini.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
