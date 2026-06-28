import { formatRupiah } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Supply, SupplyPurchase } from "@shared/schema";

type PurchasesTabProps = {
  purchases: SupplyPurchase[];
  supplyById: Record<number, Supply>;
  supplyNameById: Record<number, string>;
};

export function PurchasesTab({
  purchases,
  supplyById,
  supplyNameById,
}: PurchasesTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Riwayat pembelian</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Pembelian ditampilkan dari yang terbaru dan langsung menambah stok barang saat dicatat.
        </p>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Barang</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Jumlah</TableHead>
              <TableHead>Harga per unit</TableHead>
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchases.map((purchase) => (
              <TableRow key={purchase.id}>
                <TableCell>{purchase.purchasedAt ? new Date(purchase.purchasedAt).toLocaleDateString("id-ID") : "-"}</TableCell>
                <TableCell className="font-medium">{supplyNameById[purchase.supplyId] || `Barang #${purchase.supplyId}`}</TableCell>
                <TableCell>{purchase.supplierName || "-"}</TableCell>
                <TableCell>
                  <div className="font-medium">{purchase.quantity} {purchase.purchaseUnit}</div>
                  <div className="text-xs text-muted-foreground">
                    Menambah {purchase.convertedQuantity} {supplyById[purchase.supplyId]?.unit ?? "satuan dasar"}
                  </div>
                </TableCell>
                <TableCell>{formatRupiah(purchase.unitCost)}</TableCell>
                <TableCell>{formatRupiah(purchase.totalCost)}</TableCell>
              </TableRow>
            ))}
            {purchases.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500 py-10">
                  Belum ada pembelian tercatat. Gunakan "Catat pembelian" untuk menambah stok masuk.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
