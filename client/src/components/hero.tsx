import { Button } from "@/components/ui/button";
import { Utensils, Phone } from "lucide-react";

export default function Hero() {
  const scrollToMenu = () => {
    const menuSection = document.getElementById('menu');
    if (menuSection) {
      menuSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-indonesian-red text-white py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Seblak Pedas Terenak di Bandung!
            </h2>
            <p className="text-lg md:text-xl mb-6 text-red-100">
              Pesan seblak autentik dengan cita rasa khas Indonesia. Antar gratis untuk pesanan di atas Rp 50.000!
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={scrollToMenu}
                className="bg-warm-orange text-white hover:bg-orange-600"
              >
                <Utensils className="h-4 w-4 mr-2" />
                Lihat Menu
              </Button>
              <Button 
                variant="outline" 
                className="border-2 border-white text-white hover:bg-white hover:text-indonesian-red"
                asChild
              >
                <a href="tel:+6281234567890" className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  Hubungi Kami
                </a>
              </Button>
            </div>
          </div>
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
              alt="Seblak Listyaning - Hidangan Seblak Lezat" 
              className="rounded-2xl shadow-2xl w-full h-auto"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
