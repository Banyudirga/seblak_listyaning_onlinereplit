import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Plus, Flame, Crown, Leaf, ChefHat, Snowflake, ArrowRight } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { formatRupiah } from "@/lib/format";
import { menuCategories } from "@/lib/menu-categories";
import type { MenuItem } from "@shared/schema";

type MenuSectionProps = {
  mode?: "full" | "categories";
};

const categoryIcons = {
  Pedas: Flame,
  Spesial: Crown,
  "Tidak Pedas": Leaf,
  Keju: ChefHat,
  Dingin: Snowflake,
  Cemilan: ChefHat,
  Gurih: ChefHat,
  Sedang: Flame,
  "Sangat pedas": Flame,
  "Super pedas": Flame,
};

const categoryColors = {
  Pedas: "bg-red-500",
  Spesial: "bg-orange-500",
  "Tidak Pedas": "bg-green-500",
  Keju: "bg-orange-500",
  Dingin: "bg-green-500",
  Cemilan: "bg-orange-500",
  Gurih: "bg-yellow-500",
  Sedang: "bg-orange-500",
  "Sangat pedas": "bg-red-600",
  "Super pedas": "bg-red-700",
};

const spicyLevelLabels: Record<string, string> = {
  none: "Tidak pedas",
  mild: "Sedang",
  medium: "Pedas",
  hot: "Sangat pedas",
  "extra-hot": "Super pedas",
};

export default function MenuSection({ mode = "full" }: MenuSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState(() => {
    if (typeof window === "undefined") {
      return "all";
    }

    const categoryFromUrl = new URLSearchParams(window.location.search).get("category");
    const isKnownCategory = menuCategories.some((category) => category.id === categoryFromUrl);

    return isKnownCategory && categoryFromUrl ? categoryFromUrl : "all";
  });
  const { addItem } = useCart();

  const { data: menuItems = [], isLoading } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu"],
  });

  const filteredItems =
    selectedCategory === "all"
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory);

  const groupedMenuItems = useMemo(
    () =>
      menuCategories
        .filter((category) => category.id !== "all")
        .map((category) => ({
          ...category,
          items: menuItems.filter((item) => item.category === category.id),
        }))
        .filter((category) => category.items.length > 0),
    [menuItems]
  );

  const categorySummaries = useMemo(
    () =>
      menuCategories
        .filter((category) => category.id !== "all")
        .map((category) => {
          const items = menuItems.filter((item) => item.category === category.id);

          return {
            ...category,
            totalItems: items.length,
            image: items[0]?.image ?? "",
          };
        })
        .filter((category) => category.totalItems > 0),
    [menuItems]
  );

  const handleAddToCart = (item: MenuItem) => {
    addItem({
      id: item.id.toString(),
      name: item.name,
      price: item.price,
      image: item.image,
    });
  };

  if (isLoading) {
    return (
      <section id="menu" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Memuat menu...</div>
        </div>
      </section>
    );
  }

  if (mode === "categories") {
    return (
      <section id="menu" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-dark-grey mb-4">
              Klasifikasi Menu
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Pilih kategori menu yang ingin Anda lihat, lalu buka halaman menu lengkap untuk mulai pesan.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categorySummaries.map((category) => {
              const Icon = category.icon;

              return (
                <a
                  key={category.id}
                  href={`/menu?category=${category.id}`}
                  className="block"
                >
                  <Card className="h-full overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="h-40 w-full object-cover"
                      />
                    ) : null}
                    <CardContent className="p-5">
                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indonesian-red/10 text-indonesian-red">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-dark-grey">
                            {category.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {category.totalItems} menu
                          </p>
                        </div>
                      </div>

                      <p className="mb-4 text-sm leading-6 text-gray-600">
                        {category.description}
                      </p>

                      <div className="inline-flex items-center gap-2 text-sm font-medium text-indonesian-red">
                        Lihat kategori
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </CardContent>
                  </Card>
                </a>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="menu" className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-dark-grey mb-4">
            Daftar Menu Lengkap
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Pilih menu favorit Anda dengan berbagai tingkat kepedasan dan topping lezat.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {menuCategories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              className={`rounded-full font-medium ${
                selectedCategory === category.id
                  ? "bg-indonesian-red text-white hover:bg-red-600"
                  : "bg-white text-dark-grey hover:bg-gray-100 border"
              }`}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </Button>
          ))}
        </div>

        {selectedCategory === "all" ? (
          <div className="space-y-10">
            {groupedMenuItems.map((group) => (
              <div key={group.id} className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-6 flex items-center gap-4">
                  <div className="h-px flex-1 bg-gray-200" />
                  <h3 className="text-center text-lg font-bold uppercase tracking-[0.25em] text-dark-grey sm:text-xl">
                    {group.name}
                  </h3>
                  <div className="h-px flex-1 bg-gray-200" />
                </div>

                <div className="space-y-5">
                  {group.items.map((item, index) => (
                    <div key={item.id}>
                      <div className="flex items-start gap-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-16 w-16 shrink-0 rounded-full border-2 border-white object-cover shadow-sm"
                        />

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-3">
                                <h4 className="line-clamp-1 text-lg font-bold text-dark-grey">
                                  {item.name}
                                </h4>
                                <div className="hidden h-px flex-1 bg-gray-200 sm:block" />
                              </div>
                              <p className="mt-1 text-sm leading-6 text-gray-600 sm:text-base">
                                {item.description}
                              </p>
                            </div>

                            <div className="shrink-0 text-right">
                              <p className="text-base font-semibold text-indonesian-red sm:text-lg">
                                {formatRupiah(item.price)}
                              </p>
                              <div className="mt-1 flex items-center justify-end gap-1">
                                <Star className="h-4 w-4 fill-current text-yellow-400" />
                                <span className="text-xs text-gray-500 sm:text-sm">
                                  {(item.rating! / 10).toFixed(1)} ({item.reviewCount})
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                            <Badge className="bg-gray-100 text-dark-grey hover:bg-gray-100">
                              {spicyLevelLabels[item.spicyLevel ?? ""] ??
                                item.spicyLevel ??
                                "Menu"}
                            </Badge>

                            <Button
                              onClick={() => handleAddToCart(item)}
                              className="bg-indonesian-red text-white hover:bg-red-600"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Tambah ke Keranjang
                            </Button>
                          </div>
                        </div>
                      </div>

                      {index < group.items.length - 1 ? (
                        <div className="mt-5 h-px bg-gray-100" />
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const spicyLabel =
                spicyLevelLabels[item.spicyLevel ?? ""] ??
                item.spicyLevel ??
                "Menu";
              const IconComponent =
                categoryIcons[spicyLabel as keyof typeof categoryIcons] || ChefHat;
              const badgeColor =
                categoryColors[spicyLabel as keyof typeof categoryColors] ||
                "bg-gray-500";

              return (
                <Card key={item.id} className="overflow-hidden transition-shadow hover:shadow-xl">
                  <div className="flex gap-4 p-4 lg:flex-col lg:p-0">
                    <div className="relative shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-28 w-28 rounded-xl object-cover sm:h-32 sm:w-32 lg:h-48 lg:w-full lg:rounded-none"
                      />
                      <Badge className={`absolute right-2 top-2 ${badgeColor} text-white`}>
                        <IconComponent className="mr-1 h-3 w-3" />
                        {spicyLabel}
                      </Badge>
                    </div>
                    <CardContent className="flex min-w-0 flex-1 flex-col p-0 lg:p-6">
                      <h3 className="mb-1 line-clamp-2 text-lg font-bold text-dark-grey lg:text-xl">
                        {item.name}
                      </h3>
                      <p className="mb-3 line-clamp-3 text-sm text-gray-600 lg:text-base">
                        {item.description}
                      </p>
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <span className="text-xl font-bold text-indonesian-red lg:text-2xl">
                          {formatRupiah(item.price)}
                        </span>
                        <div className="flex shrink-0 items-center gap-1">
                          <Star className="h-4 w-4 fill-current text-yellow-400" />
                          <span className="text-sm text-gray-600">
                            {(item.rating! / 10).toFixed(1)} ({item.reviewCount})
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleAddToCart(item)}
                        className="mt-auto w-full bg-indonesian-red text-white hover:bg-red-600"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah ke Keranjang
                      </Button>
                    </CardContent>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
