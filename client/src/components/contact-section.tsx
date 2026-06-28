import { MapPin, Phone, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function ContactSection() {
  return (
    <section className="py-16 bg-light-grey">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-dark-grey mb-4">
            Hubungi Kami
          </h2>
          <p className="text-lg text-gray-600">
            Siap melayani pesanan Anda dengan sepenuh hati
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center shadow-md">
            <CardContent className="p-6">
              <div className="w-16 h-16 bg-indonesian-red rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-dark-grey mb-2">Alamat</h3>
              <p className="text-gray-600">
                Jl. Raya Sukabumi No. 123<br />
                Bandung, Jawa Barat 40123
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center shadow-md">
            <CardContent className="p-6">
              <div className="w-16 h-16 bg-fresh-green rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-dark-grey mb-2">Telepon</h3>
              <p className="text-gray-600">+62-812-3456-7890</p>
              <a 
                href="tel:+6281234567890" 
                className="text-indonesian-red font-medium hover:underline"
              >
                Hubungi Sekarang
              </a>
            </CardContent>
          </Card>
          
          <Card className="text-center shadow-md">
            <CardContent className="p-6">
              <div className="w-16 h-16 bg-warm-orange rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-dark-grey mb-2">Email</h3>
              <p className="text-gray-600">info@seblaklistyaning.com</p>
              <a 
                href="mailto:info@seblaklistyaning.com" 
                className="text-indonesian-red font-medium hover:underline"
              >
                Kirim Email
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
