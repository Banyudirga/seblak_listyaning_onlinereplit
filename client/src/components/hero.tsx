import { Button } from "@/components/ui/button";
import { Utensils, MessageCircle } from "lucide-react";
import { useLocation } from "wouter";

export default function Hero() {
  const [, setLocation] = useLocation();

  return (
    <section className="bg-indonesian-red text-white py-8 md:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-8 items-center">
          <div className="space-y-4">
            <h2 className="text-2xl leading-tight md:text-5xl font-bold">
              Seblak Pedas Terenak !
            </h2>
            <p className="max-w-xl text-base leading-8 md:text-xl text-red-100">
              Pesan seblak autentik dengan cita rasa khas Indonesia. Antar
              gratis untuk pesanan di atas Rp 50.000!
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                onClick={() => setLocation("/menu")}
                className="h-10 bg-warm-orange px-4 text-sm text-white hover:bg-orange-600"
              >
                <Utensils className="h-4 w-4 mr-2" />
                Lihat Menu
              </Button>
              <a
                href="https://wa.me/6281533121536"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center justify-center rounded-md bg-[#25D366] px-4 text-sm font-medium text-white transition-colors hover:bg-[#128C7E]"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Hubungi Kami
              </a>
            </div>
          </div>
          <div className="relative md:justify-self-end">
            <img
              src="https://images.pexels.com/photos/6646351/pexels-photo-6646351.jpeg?auto=compress&cs=tinysrgb&w=800&h=600"
              alt="Seblak Listyaning - Hidangan Seblak Lezat"
              className="h-64 w-full rounded-2xl object-cover shadow-2xl sm:h-80 md:h-[360px] md:max-w-md"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
