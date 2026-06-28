import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SuppliesOverviewProps = {
  totalSupplies: number;
  lowStockCount: number;
  purchasesCount: number;
  totalPurchaseValue: string;
  totalSupplyUnits: number;
  recentPurchasesCount: number;
};

export function SuppliesOverview({
  totalSupplies,
  lowStockCount,
  purchasesCount,
  totalPurchaseValue,
  totalSupplyUnits,
  recentPurchasesCount,
}: SuppliesOverviewProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Supplies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indonesian-red">{totalSupplies}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lowStockCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Purchases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{purchasesCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Purchase Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalPurchaseValue}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">How This Flow Works</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>1. Add your raw supplies like crackers, noodles, eggs, or chili.</p>
            <p>2. Record purchases to increase stock immediately.</p>
            <p>3. Connect menu items to supplies in Recipes so confirmed sales can deduct ingredient stock.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Tracked units</span>
              <span className="font-semibold">{totalSupplyUnits}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Recent purchases</span>
              <span className="font-semibold">{recentPurchasesCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Need attention</span>
              <Badge className={lowStockCount > 0 ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}>
                {lowStockCount > 0 ? `${lowStockCount} low stock` : "All healthy"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}