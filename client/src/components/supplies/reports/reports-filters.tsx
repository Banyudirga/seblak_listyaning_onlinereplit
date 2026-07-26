import { CalendarRange, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import type { ReportsFilters } from "@/types/reports";

type ReportsFiltersProps = {
  filters: ReportsFilters;
  onChange: (filters: ReportsFilters) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
};

export function ReportsFiltersBar({
  filters,
  onChange,
  onRefresh,
  isRefreshing,
}: ReportsFiltersProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <CalendarRange className="h-4 w-4 text-indonesian-red" />
            Filter periode laporan
          </div>
          <p className="text-sm text-muted-foreground">
            Ringkasan pembelian dan penjualan dihitung dari rentang tanggal ini.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:min-w-[520px]">
          <div className="space-y-2">
            <label htmlFor="reports-start-date" className="text-xs font-medium text-muted-foreground">
              Dari tanggal
            </label>
            <Input
              id="reports-start-date"
              type="date"
              value={filters.startDate}
              onChange={(event) => onChange({ ...filters, startDate: event.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="reports-end-date" className="text-xs font-medium text-muted-foreground">
              Sampai tanggal
            </label>
            <Input
              id="reports-end-date"
              type="date"
              value={filters.endDate}
              onChange={(event) => onChange({ ...filters, endDate: event.target.value })}
            />
          </div>

          <Button
            type="button"
            onClick={onRefresh}
            variant="outline"
            className="h-10 self-end"
            disabled={isRefreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Muat ulang
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
