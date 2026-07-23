import { ExternalLink, MapPin, Phone, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatPhoneNumberDisplay } from "@/lib/format";

export default function ContactSection() {
  const googleMapsUrl =
    "https://www.google.com/maps/place/Angkringan+Seblak+Prasmanan+Listyaning/@-6.1931294,106.9628834,868m/data=!3m2!1e3!4b1!4m6!3m5!1s0x2e698bab8eb36127:0xb6d4d9b91a1eb24c!8m2!3d-6.1931294!4d106.9654583!16s%2Fg%2F11y8t7fbx3?entry=ttu&g_ep=EgoyMDI2MDcyMC4wIKXMDSoASAFQAw%3D%3D";
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
                className="group mt-4 block"
              >
                <div className="relative overflow-hidden rounded-xl border border-gray-200">
                  <iframe
                    src={googleMapsEmbedUrl}
                    title="Peta lokasi Seblak Listyaning"
                    className="h-32 w-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                  <div className="absolute right-2 top-2 rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-indonesian-red shadow-sm">
                    Cek map
                  </div>
                </div>
              </a>
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-indonesian-red font-medium hover:underline"
              >
                Lihat di Google Maps
                <ExternalLink className="h-4 w-4" />
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
