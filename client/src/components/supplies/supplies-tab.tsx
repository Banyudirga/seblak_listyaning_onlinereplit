import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Supply } from "@shared/schema";

type SuppliesTabProps = {
  supplies: Supply[];
  filteredSupplies: Supply[];
  supplySearch: string;
  onSupplySearchChange: (value: string) => void;
};

export function SuppliesTab({
  supplies,
  filteredSupplies,
  supplySearch,
  onSupplySearchChange,
}: SuppliesTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Stok barang</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <Input
            value={supplySearch}
            onChange={(e) => onSupplySearchChange(e.target.value)}
            placeholder="Cari barang, supplier, atau satuan"
            className="md:max-w-sm"
          />
          <p className="text-sm text-muted-foreground">
            {filteredSupplies.length} dari {supplies.length} barang ditampilkan
          </p>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Satuan</TableHead>
              <TableHead>Stok</TableHead>
              <TableHead>Batas minimum</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSupplies.map((supply) => (
              <TableRow key={supply.id}>
                <TableCell className="font-medium">{supply.name}</TableCell>
                <TableCell>{supply.unit}</TableCell>
                <TableCell>{supply.stockQuantity} {supply.unit}</TableCell>
                <TableCell>{supply.lowStockThreshold} {supply.unit}</TableCell>
                <TableCell>{supply.supplierName || "-"}</TableCell>
                <TableCell>
                  <Badge className={supply.stockQuantity <= supply.lowStockThreshold ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}>
                    {supply.stockQuantity <= supply.lowStockThreshold ? "Stok menipis" : "Aman"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {filteredSupplies.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500 py-10">
                  {supplies.length === 0
                    ? "Belum ada barang. Tambahkan bahan pertama untuk mulai memantau stok."
                    : "Tidak ada barang yang cocok dengan pencarian Anda."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
