import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import Header from "@/components/header";
import MenuSection from "@/components/menu-section";
import CartSidebar from "@/components/cart-sidebar";
import CheckoutModal from "@/components/checkout-modal";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";

export default function MenuPage() {
  return (
    <div className="min-h-screen bg-light-grey">
      <Header />
      <main>
        <div className="bg-white py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Link href="/">
              <Button
                variant="outline"
                className="mb-4 border-gray-200 bg-white text-dark-grey hover:bg-gray-50"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali ke Beranda
              </Button>
            </Link>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-indonesian-red">
              Menu
            </p>
            <h1 className="mt-2 text-3xl font-bold text-dark-grey md:text-4xl">
              Jelajahi Semua Menu Seblak Listyaning
            </h1>
            <p className="mt-3 max-w-2xl text-base text-gray-600">
              Pilih kategori yang Anda inginkan, lalu tambahkan menu favorit langsung ke keranjang.
            </p>
          </div>
        </div>

        <MenuSection mode="full" />
      </main>
      <Footer />
      <CartSidebar />
      <CheckoutModal />
    </div>
  );
}
