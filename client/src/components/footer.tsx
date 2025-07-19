import { Facebook, Instagram, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-dark-grey text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold text-indonesian-red mb-4">
              Seblak Listyaning
            </h3>
            <p className="text-gray-300 mb-4">
              Warung seblak terpercaya dengan cita rasa autentik dan pelayanan terbaik 
              untuk kepuasan pelanggan.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-indonesian-red transition-colors">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-indonesian-red transition-colors">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-indonesian-red transition-colors">
                <MessageCircle className="h-6 w-6" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-medium mb-4">Menu</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a href="#menu" className="hover:text-white transition-colors">
                  Seblak Original
                </a>
              </li>
              <li>
                <a href="#menu" className="hover:text-white transition-colors">
                  Seblak Seafood
                </a>
              </li>
              <li>
                <a href="#menu" className="hover:text-white transition-colors">
                  Seblak Keju
                </a>
              </li>
              <li>
                <a href="#menu" className="hover:text-white transition-colors">
                  Minuman
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-medium mb-4">Informasi</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Tentang Kami
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Kebijakan Privasi
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Syarat & Ketentuan
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="/admin" className="hover:text-indonesian-red transition-colors text-sm">
                  Admin Dashboard
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-600 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; 2024 Seblak Listyaning. Semua hak dilindungi undang-undang.</p>
        </div>
      </div>
    </footer>
  );
}
