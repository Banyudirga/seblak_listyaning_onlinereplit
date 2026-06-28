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
        <CardTitle>Purchase History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Purchases are shown newest first and increase supply stock as soon as they are recorded.
        </p>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Supply</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit Cost</TableHead>
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchases.map((purchase) => (
              <TableRow key={purchase.id}>
                <TableCell>{purchase.purchasedAt ? new Date(purchase.purchasedAt).toLocaleDateString("id-ID") : "-"}</TableCell>
                <TableCell className="font-medium">{supplyNameById[purchase.supplyId] || `Supply #${purchase.supplyId}`}</TableCell>
                <TableCell>{purchase.supplierName || "-"}</TableCell>
                <TableCell>
                  <div className="font-medium">{purchase.quantity} {purchase.purchaseUnit}</div>
                  <div className="text-xs text-muted-foreground">
                    Adds {purchase.convertedQuantity} {supplyById[purchase.supplyId]?.unit ?? "base units"}
                  </div>
                </TableCell>
                <TableCell>{formatRupiah(purchase.unitCost)}</TableCell>
                <TableCell>{formatRupiah(purchase.totalCost)}</TableCell>
              </TableRow>
            ))}
            {purchases.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500 py-10">
                  No purchases recorded yet. Use "Record Purchase" to add incoming stock.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}