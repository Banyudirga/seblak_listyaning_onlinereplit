import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import type {
  OverviewReport,
  ProfitEstimateReport,
  PurchasesReport,
  ReportsFilters,
  SalesReport,
  StockReport,
} from "@/types/reports";

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDefaultReportsFilters(): ReportsFilters {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 29);

  return {
    startDate: formatDateInput(startDate),
    endDate: formatDateInput(endDate),
  };
}

function buildReportUrl(path: string, filters: ReportsFilters) {
  const params = new URLSearchParams();

  if (filters.startDate) params.set("startDate", filters.startDate);
  if (filters.endDate) params.set("endDate", filters.endDate);

  const queryString = params.toString();
  return queryString ? `${path}?${queryString}` : path;
}

export function useReportsDashboard(filters: ReportsFilters) {
  const urls = useMemo(
    () => ({
      overview: buildReportUrl("/api/admin/reports/overview", filters),
      stock: buildReportUrl("/api/admin/reports/stock", filters),
      purchases: buildReportUrl("/api/admin/reports/purchases", filters),
      sales: buildReportUrl("/api/admin/reports/sales", filters),
      profit: buildReportUrl("/api/admin/reports/profit-estimate", filters),
    }),
    [filters],
  );

  const overviewQuery = useQuery<OverviewReport>({
    queryKey: [urls.overview],
  });

  const stockQuery = useQuery<StockReport>({
    queryKey: [urls.stock],
  });

  const purchasesQuery = useQuery<PurchasesReport>({
    queryKey: [urls.purchases],
  });

  const salesQuery = useQuery<SalesReport>({
    queryKey: [urls.sales],
  });

  const profitQuery = useQuery<ProfitEstimateReport>({
    queryKey: [urls.profit],
  });

  return {
    overview: overviewQuery.data,
    stock: stockQuery.data,
    purchases: purchasesQuery.data,
    sales: salesQuery.data,
    profit: profitQuery.data,
    isLoading:
      overviewQuery.isLoading ||
      stockQuery.isLoading ||
      purchasesQuery.isLoading ||
      salesQuery.isLoading ||
      profitQuery.isLoading,
    isFetching:
      overviewQuery.isFetching ||
      stockQuery.isFetching ||
      purchasesQuery.isFetching ||
      salesQuery.isFetching ||
      profitQuery.isFetching,
    error:
      overviewQuery.error ||
      stockQuery.error ||
      purchasesQuery.error ||
      salesQuery.error ||
      profitQuery.error,
    refetchAll: async () => {
      await Promise.all([
        overviewQuery.refetch(),
        stockQuery.refetch(),
        purchasesQuery.refetch(),
        salesQuery.refetch(),
        profitQuery.refetch(),
      ]);
    },
  };
}
