import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ReportKpiCards } from "./report-kpi-cards";
import { formatRupiah } from "@/lib/format";
import { getPaymentMethodText, getStatusText } from "@/lib/admin-helpers";
import type { SalesReport } from "@/types/reports";

type SalesReportTabProps = {
  report: SalesReport;
};

function getServiceTypeLabel(serviceType: string) {
  switch (serviceType) {
    case "diantar":
      return "Diantar";
    case "diambil":
      return "Diambil";
    case "makan ditempat":
      return "Makan di tempat";
    default:
      return serviceType;
  }
}

export function SalesReportTab({ report }: SalesReportTabProps) {
  return (
    <div className="space-y-6">
      <ReportKpiCards
        items={[
          {
            label: "Total omzet",
            value: formatRupiah(report.summary.totalRevenue),
            accentClassName: "text-indonesian-red",
          },
          {
            label: "Jumlah pesanan",
            value: report.summary.orderCount,
            accentClassName: "text-blue-600",
          },
          {
            label: "Porsi terjual",
            value: report.summary.totalItemsSold,
            accentClassName: "text-green-600",
          },
          {
            label: "Rata-rata nilai order",
            value: formatRupiah(report.summary.averageOrderValue),
            accentClassName: "text-orange-600",
          },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle>Penjualan per menu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {report.byMenuItem.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Belum ada penjualan pada periode ini.
              </p>
            ) : (
              report.byMenuItem.slice(0, 12).map((item) => (
                <div key={item.menuItemId} className="rounded-lg border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{item.quantitySold} porsi</p>
                      <p className="text-sm text-muted-foreground">{formatRupiah(item.revenue)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daftar pesanan yang masuk laporan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pesanan</TableHead>
                    <TableHead>Pelanggan</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Layanan</TableHead>
                    <TableHead>Pembayaran</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total</TableHead>
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
                      <TableCell>{row.customerName}</TableCell>
                      <TableCell>
                        <div className="font-medium">{row.itemCount} item</div>
                        <div className="text-xs text-muted-foreground">{row.itemsSummary}</div>
                      </TableCell>
                      <TableCell>{getServiceTypeLabel(row.serviceType)}</TableCell>
                      <TableCell>{getPaymentMethodText(row.paymentMethod)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{getStatusText(row.status)}</Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-indonesian-red">
                        {formatRupiah(row.totalAmount)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {report.rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
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
