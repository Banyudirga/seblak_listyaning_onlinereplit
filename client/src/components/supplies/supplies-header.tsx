import { Link } from "wouter";
import { ArrowLeft, PlusCircle, RefreshCw, ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";

type SuppliesHeaderProps = {
  onAddSupply: () => void;
  onRecordPurchase: () => void;
  onRefresh: () => void;
};

export function SuppliesHeader({
  onAddSupply,
  onRecordPurchase,
  onRefresh,
}: SuppliesHeaderProps) {
  return (
    <div className="bg-indonesian-red text-white">
      <div className="max-w-7xl mx-auto">
        <div className="rounded-b-[28px] bg-indonesian-red px-4 py-5 sm:px-6 sm:py-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <Link href="/admin" className="inline-block">
                <Button
                  variant="outline"
                  size="sm"
                  className="mb-4 h-9 border-white/80 bg-white text-indonesian-red hover:bg-white/90"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kembali ke Admin
                </Button>
              </Link>

              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-[0.25em] text-red-100">
                  Barang & Resep
                </p>
                <h1 className="max-w-xl text-2xl font-bold leading-tight sm:text-3xl">
                  Manajemen Barang
                </h1>
                <p className="max-w-md text-sm leading-6 text-red-100 sm:text-base">
                  Kelola bahan, pembelian, dan resep menu dari satu tampilan yang lebih rapi di mobile.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:min-w-[520px]">
              <Button
                onClick={onAddSupply}
                variant="outline"
                className="h-11 w-full border-white bg-white text-indonesian-red hover:bg-white/90"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Tambah barang
              </Button>
              <Button
                onClick={onRecordPurchase}
                variant="outline"
                className="h-11 w-full border-white bg-white text-indonesian-red hover:bg-white/90"
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Catat pembelian
              </Button>
              <Button
                onClick={onRefresh}
                variant="outline"
                className="h-11 w-full border-white bg-white text-indonesian-red hover:bg-white/90"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Muat ulang
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
