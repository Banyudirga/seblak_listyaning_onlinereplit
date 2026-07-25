import { MapPin, Phone, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatPhoneNumberDisplay } from "@/lib/format";

export default function ContactSection() {
  const googleMapsUrl =
    "https://www.google.com/maps/search/?api=1&query=Jl.%20Raya%20Rw.%20Kuning%20No.22%2C%20RT.1%2FRW.2%2C%20Pulo%20Gebang%2C%20Kec.%20Cakung%2C%20Kota%20Jakarta%20Timur%2C%20Daerah%20Khusus%20Ibukota%20Jakarta%2013950";
  const googleMapsEmbedUrl =
    "https://maps.google.com/maps?q=Jl.%20Raya%20Rw.%20Kuning%20No.22%2C%20RT.1%2FRW.2%2C%20Pulo%20Gebang%2C%20Kec.%20Cakung%2C%20Kota%20Jakarta%20Timur%2C%20Daerah%20Khusus%20Ibukota%20Jakarta%2013950&t=&z=16&ie=UTF8&iwloc=&output=embed";

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
                Jl. Raya Rw. Kuning No.22, RT.1/RW.2, Pulo Gebang, Kec. Cakung,
                Kota Jakarta Timur, Daerah Khusus Ibukota Jakarta 13950
              </p>
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 block cursor-pointer"
                aria-label="Buka lokasi di Google Maps"
              >
                <div className="relative overflow-hidden rounded-xl border border-gray-200">
                  <iframe
                    src={googleMapsEmbedUrl}
                    title="Peta lokasi Seblak Listyaning"
                    className="pointer-events-none h-32 w-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </a>
            </CardContent>
          </Card>
          
          <Card className="text-center shadow-md">
            <CardContent className="p-6">
              <div className="w-16 h-16 bg-fresh-green rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-dark-grey mb-2">Telepon</h3>
              <p className="text-gray-600">{formatPhoneNumberDisplay("+6281533121536")}</p>
              <a 
                href="tel:+6281533121536"
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
