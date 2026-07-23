import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Phone, ShoppingCart } from "lucide-react";
import { formatPhoneNumberDisplay } from "@/lib/format";

export default function Header() {
  const { openCart, getTotalItems } = useCart();
  const totalItems = getTotalItems();

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between sm:h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-indonesian-red sm:text-2xl">
                Seblak Listyaning
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-dark-grey">
              <Phone className="h-4 w-4 text-fresh-green" />
              <span className="text-sm">{formatPhoneNumberDisplay("+6281533121536")}</span>
            </div>
            <Button 
              onClick={openCart}
              className="relative h-10 bg-indonesian-red px-3 text-white hover:bg-red-600 sm:px-4"
            >
              <ShoppingCart className="h-4 w-4 sm:mr-2" />
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
