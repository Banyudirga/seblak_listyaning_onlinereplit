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
            <CardTitle className="text-sm font-medium">Total barang</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indonesian-red">{totalSupplies}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Stok menipis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lowStockCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pembelian</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{purchasesCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Nilai pembelian</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalPurchaseValue}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Cara kerja alur ini</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>1. Tambahkan bahan baku seperti kerupuk, mie, telur, atau cabai.</p>
            <p>2. Catat pembelian agar stok langsung bertambah.</p>
            <p>3. Hubungkan menu dengan barang di tab Resep agar penjualan yang dikonfirmasi dapat mengurangi stok bahan.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Ringkasan cepat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total unit tercatat</span>
              <span className="font-semibold">{totalSupplyUnits}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Pembelian terbaru</span>
              <span className="font-semibold">{recentPurchasesCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Perlu perhatian</span>
              <Badge className={lowStockCount > 0 ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}>
                {lowStockCount > 0 ? `${lowStockCount} stok menipis` : "Semua aman"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
