import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Rihhadatul Aisy",
    initials: "RA",
    source: "Ulasan Google",
    quote:
      "Langganan kapan pun, makan istirahat kantor atau jajan, lengkap semua ada, dan rasanya mantul.",
  },
  {
    name: "Piko Sobari",
    initials: "PS",
    source: "Ulasan Google",
    quote:
      "Seblaknya bukan seblak biasa bro, gurih gurih nyo. Dan nasi bakarnya best lah, rasanya wajib mampir dan dicoba bro.",
  },
  {
    name: "Muhamad Hakim",
    initials: "MH",
    source: "Ulasan Google",
    quote:
      "Masakannya semua mantul, nasi bakar seblak, tempatnya juga bikin males pulang. Pelayanannya ramah banget.",
  },
];

const scrollingTestimonials = [...testimonials, ...testimonials];

export default function TestimonialSection() {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-indonesian-red">
            Testimoni
          </p>
          <h2 className="mt-2 text-3xl font-bold text-dark-grey md:text-4xl">
            Kata Pelanggan Kami
          </h2>
          <div className="mx-auto mt-3 h-1 w-24 rounded-full bg-fresh-green" />
          <p className="mx-auto mt-4 max-w-2xl text-sm text-gray-600 md:text-base">
            Ulasan publik asli dari Google Maps untuk Angkringan Seblak
            Prasmanan Listyaning.
          </p>
          <p className="mt-2 text-sm font-medium text-gray-700">
            Rating 5.0 dari 13 ulasan
          </p>
        </div>

        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-white to-transparent" />

          <div className="animate-testimonials pause-on-hover flex w-max gap-6 py-2">
            {scrollingTestimonials.map((testimonial, index) => (
              <article
                key={`${testimonial.name}-${index}`}
                className="flex min-h-[280px] w-[320px] flex-col rounded-[32px] border border-gray-200 bg-white p-6 shadow-sm sm:w-[360px]"
              >
                <div className="mb-5 flex items-center gap-2 text-[#f4b400]">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <Star
                      key={`${testimonial.name}-star-${starIndex}`}
                      className="h-5 w-5 fill-current"
                    />
                  ))}
                </div>

                <p className="flex-1 text-base leading-7 text-gray-700">
                  "{testimonial.quote}"
                </p>

                <div className="my-5 h-px bg-gray-200" />

                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indonesian-red/10 text-sm font-semibold text-indonesian-red">
                    {testimonial.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-dark-grey">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-gray-500">{testimonial.source}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
