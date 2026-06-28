import { Activity, AlertTriangle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Supply, SupplyStockMovement } from "@shared/schema";

type ReportsTabProps = {
  lowStockSupplies: Supply[];
  stockMovements: SupplyStockMovement[];
  supplyNameById: Record<number, string>;
};

export function ReportsTab({
  lowStockSupplies,
  stockMovements,
  supplyNameById,
}: ReportsTabProps) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.25fr] gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            Low-Stock Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {lowStockSupplies.length === 0 ? (
            <p className="text-muted-foreground">All supplies are above their alert threshold.</p>
          ) : (
            lowStockSupplies.map((supply) => (
              <div key={supply.id} className="rounded-lg border p-3">
                <div className="font-medium">{supply.name}</div>
                <div className="text-muted-foreground">
                  Current: {supply.stockQuantity} {supply.unit} · Alert at {supply.lowStockThreshold} {supply.unit}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-indonesian-red" />
            Usage History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Supply</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Change</TableHead>
                <TableHead>Reference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stockMovements.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell>{movement.createdAt ? new Date(movement.createdAt).toLocaleString("id-ID") : "-"}</TableCell>
                  <TableCell className="font-medium">{supplyNameById[movement.supplyId] || `Supply #${movement.supplyId}`}</TableCell>
                  <TableCell className="capitalize">{movement.movementType}</TableCell>
                  <TableCell className={movement.quantityChange >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                    {movement.quantityChange > 0 ? `+${movement.quantityChange}` : movement.quantityChange} {movement.unit}
                  </TableCell>
                  <TableCell>
                    {movement.referenceType}
                    {movement.referenceId ? ` #${movement.referenceId}` : ""}
                  </TableCell>
                </TableRow>
              ))}
              {stockMovements.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500 py-10">
                    No stock movements yet. Purchases and sales will appear here.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}