import { Clock, Truck } from "lucide-react";

export default function AboutSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-dark-grey mb-6">
              Tentang Seblak Listyaning
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Seblak Listyaning adalah warung seblak terpercaya yang telah melayani pelanggan 
              selama lebih dari 10 tahun. Kami menggunakan bumbu rahasia turun temurun untuk 
              menghadirkan cita rasa seblak yang autentik dan tak terlupakan.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-12 h-12 bg-indonesian-red rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-dark-grey">Buka Setiap Hari</h3>
                  <p className="text-sm text-gray-600">10:00 - 22:00 WIB</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-12 h-12 bg-fresh-green rounded-lg flex items-center justify-center">
                  <Truck className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-dark-grey">Antar Cepat</h3>
                  <p className="text-sm text-gray-600">30-45 menit</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
              alt="Dapur Seblak Listyaning" 
              className="rounded-2xl shadow-xl w-full h-auto"
            />
            <div className="absolute inset-0 bg-indonesian-red bg-opacity-10 rounded-2xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
