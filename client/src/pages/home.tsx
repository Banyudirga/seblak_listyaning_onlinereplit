import Header from "@/components/header";
import Hero from "@/components/hero";
import MenuSection from "@/components/menu-section";
import CartSidebar from "@/components/cart-sidebar";
import CheckoutModal from "@/components/checkout-modal";
import AboutSection from "@/components/about-section";
import ContactSection from "@/components/contact-section";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-light-grey">
      <Header />
      <Hero />
      <MenuSection />
      <AboutSection />
      <ContactSection />
      <Footer />
      <CartSidebar />
      <CheckoutModal />
    </div>
  );
}
