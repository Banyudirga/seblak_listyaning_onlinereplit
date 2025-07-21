import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit } from "lucide-react";
import { formatRupiah } from "@/lib/format";
import { getStockStatus, getStockStatusText } from "@/lib/inventory-helpers";
import type { MenuItem } from "@shared/schema";

interface InventoryCardProps {
  item: MenuItem;
  onEditStock: (item: MenuItem) => void;
  onToggleAvailability: (item: MenuItem) => void;
  isTogglingAvailability: boolean;
}

export default function InventoryCard({ item, onEditStock, onToggleAvailability, isTogglingAvailability }: InventoryCardProps) {
  const stockStatus = getStockStatus(item);

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2">{item.name}</CardTitle>
            <p className="text-sm text-gray-600 capitalize">{item.category}</p>
            <p className="text-lg font-bold text-indonesian-red mt-1">
              {formatRupiah(item.price)}
            </p>
          </div>
          <Badge className={stockStatus.color}>
            {getStockStatusText(stockStatus.status)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        {item.image && (
          <img 
            src={item.image} 
            alt={item.name}
            className="w-full h-32 object-cover rounded-md mb-4"
          />
        )}
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Current Stock:</span>
            <span className="font-bold">{item.stockQuantity} {item.unit}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Low Stock Alert:</span>
            <span className="text-sm">{item.lowStockThreshold} {item.unit}</span>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onEditStock(item)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit Stock
            </Button>
            
            <Button
              variant={item.isAvailable ? "destructive" : "default"}
              size="sm"
              onClick={() => onToggleAvailability(item)}
              disabled={isTogglingAvailability}
            >
              {item.isAvailable ? "Disable" : "Enable"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
