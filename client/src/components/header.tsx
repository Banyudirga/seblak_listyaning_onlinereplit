import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Phone, ShoppingCart } from "lucide-react";

export default function Header() {
  const { openCart, getTotalItems } = useCart();
  const totalItems = getTotalItems();

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-indonesian-red">
                Seblak Listyaning
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-dark-grey">
              <Phone className="h-4 w-4 text-fresh-green" />
              <span className="text-sm">+62-812-3456-7890</span>
            </div>
            <Button 
              onClick={openCart}
              className="relative bg-indonesian-red text-white hover:bg-red-600"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Keranjang</span>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-warm-orange text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
