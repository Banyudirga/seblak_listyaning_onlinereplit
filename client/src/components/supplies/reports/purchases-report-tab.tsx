import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ReportKpiCards } from "./report-kpi-cards";
import { formatRupiah } from "@/lib/format";
import type { PurchasesReport } from "@/types/reports";

type PurchasesReportTabProps = {
  report: PurchasesReport;
};

export function PurchasesReportTab({ report }: PurchasesReportTabProps) {
  return (
    <div className="space-y-6">
      <ReportKpiCards
        items={[
          {
            label: "Jumlah pembelian",
            value: report.summary.purchaseCount,
            accentClassName: "text-indonesian-red",
          },
          {
            label: "Total biaya",
            value: formatRupiah(report.summary.totalCost),
            accentClassName: "text-blue-600",
          },
          {
            label: "Barang unik dibeli",
            value: report.summary.uniqueSupplies,
            accentClassName: "text-green-600",
          },
          {
            label: "Rata-rata per transaksi",
            value: formatRupiah(report.summary.averagePurchaseValue),
            accentClassName: "text-orange-600",
          },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle>Akumulasi per barang</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {report.bySupply.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Belum ada pembelian pada periode ini.
              </p>
            ) : (
              report.bySupply.map((item) => (
                <div key={item.supplyId} className="rounded-lg border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.totalConvertedQuantity} {item.unit} dari {item.purchaseCount} transaksi
                      </p>
                    </div>
                    <p className="font-semibold text-blue-600">{formatRupiah(item.totalCost)}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detail transaksi pembelian</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Barang</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Harga/unit</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{new Date(row.purchasedAt).toLocaleDateString("id-ID")}</TableCell>
                      <TableCell className="font-medium">{row.supplyName}</TableCell>
                      <TableCell>{row.supplierName || "-"}</TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {row.quantity} {row.purchaseUnit}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          +{row.convertedQuantity} {row.convertedUnit}
                        </div>
                      </TableCell>
                      <TableCell>{formatRupiah(row.unitCost)}</TableCell>
                      <TableCell>{formatRupiah(row.totalCost)}</TableCell>
                    </TableRow>
                  ))}
                  {report.rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                        Tidak ada pembelian pada periode ini.
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
