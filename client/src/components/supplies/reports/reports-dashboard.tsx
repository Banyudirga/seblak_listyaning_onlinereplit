import { useState } from "react";
import { Activity, BarChart3, Coins, PackageOpen, RefreshCw, ShoppingBag } from "lucide-react";

import { useReportsDashboard, getDefaultReportsFilters } from "@/hooks/use-reports-dashboard";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportsFiltersBar } from "./reports-filters";
import { OverviewReportTab } from "./overview-report-tab";
import { StockReportTab } from "./stock-report-tab";
import { PurchasesReportTab } from "./purchases-report-tab";
import { SalesReportTab } from "./sales-report-tab";
import { ProfitReportTab } from "./profit-report-tab";

export function ReportsDashboard() {
  const { toast } = useToast();
  const [filters, setFilters] = useState(getDefaultReportsFilters);
  const { overview, stock, purchases, sales, profit, isLoading, isFetching, error, refetchAll } = useReportsDashboard(filters);

  const handleRefresh = async () => {
    await refetchAll();
    toast({
      title: "Laporan diperbarui",
      description: "Data dashboard laporan berhasil dimuat ulang.",
    });
  };

  if (isLoading || !overview || !stock || !purchases || !sales || !profit) {
    return (
      <Card>
        <CardContent className="flex min-h-[260px] items-center justify-center">
          <div className="text-center">
            <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin text-indonesian-red" />
            <p className="font-medium">Memuat dashboard laporan...</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Kami sedang menyiapkan ringkasan stok, pembelian, dan penjualan.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error instanceof Error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dashboard laporan belum bisa dimuat</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{error.message}</p>
          <ReportsFiltersBar
            filters={filters}
            onChange={setFilters}
            onRefresh={handleRefresh}
            isRefreshing={isFetching}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <ReportsFiltersBar
        filters={filters}
        onChange={setFilters}
        onRefresh={handleRefresh}
        isRefreshing={isFetching}
      />

      <Card className="border-none shadow-none">
        <CardContent className="p-0">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="h-auto flex-wrap justify-start gap-1 bg-transparent p-0">
              <TabsTrigger value="overview">
                <BarChart3 className="mr-2 h-4 w-4" />
                Ringkasan
              </TabsTrigger>
              <TabsTrigger value="stock">
                <PackageOpen className="mr-2 h-4 w-4" />
                Stok
              </TabsTrigger>
              <TabsTrigger value="purchases">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Pembelian
              </TabsTrigger>
              <TabsTrigger value="sales">
                <Activity className="mr-2 h-4 w-4" />
                Penjualan
              </TabsTrigger>
              <TabsTrigger value="profit">
                <Coins className="mr-2 h-4 w-4" />
                Estimasi Profit
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <OverviewReportTab report={overview} />
            </TabsContent>

            <TabsContent value="stock">
              <StockReportTab report={stock} />
            </TabsContent>

            <TabsContent value="purchases">
              <PurchasesReportTab report={purchases} />
            </TabsContent>

            <TabsContent value="sales">
              <SalesReportTab report={sales} />
            </TabsContent>

            <TabsContent value="profit">
              <ProfitReportTab report={profit} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
