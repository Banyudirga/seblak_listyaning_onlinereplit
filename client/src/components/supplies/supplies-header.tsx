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
    <div className="bg-indonesian-red text-white p-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Supply Management</h1>
          <p className="text-red-100">Manage ingredients, purchases, and menu recipes</p>
          <Link href="/admin" className="inline-block mt-1">
            <Button
              variant="outline"
              size="sm"
              className="text-indonesian-red border-white hover:bg-white text-xs py-1 h-auto"
            >
              <ArrowLeft className="h-3 w-3 mr-1" />
              Back to Admin
            </Button>
          </Link>
        </div>

        <div className="flex gap-2">
          <Button onClick={onAddSupply} variant="outline" className="text-indonesian-red border-white hover:bg-white">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Supply
          </Button>
          <Button onClick={onRecordPurchase} variant="outline" className="text-indonesian-red border-white hover:bg-white">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Record Purchase
          </Button>
          <Button onClick={onRefresh} variant="outline" className="text-indonesian-red border-white hover:bg-white">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
}