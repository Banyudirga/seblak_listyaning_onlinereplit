import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Plus, Flame, Crown, Leaf, ChefHat, Snowflake } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { formatRupiah } from "@/lib/format";
import type { MenuItem } from "@shared/schema";

const categoryIcons = {
  "Pedas": Flame,
  "Spesial": Crown,
  "Tidak Pedas": Leaf,
  "Keju": ChefHat,
  "Dingin": Snowflake,
  "Cemilan": ChefHat,
  "Gurih": ChefHat,
};

const categoryColors = {
  "Pedas": "bg-red-500",
  "Spesial": "bg-orange-500", 
  "Tidak Pedas": "bg-green-500",
  "Keju": "bg-orange-500",
  "Dingin": "bg-green-500",
  "Cemilan": "bg-orange-500",
  "Gurih": "bg-yellow-500",
};

export default function MenuSection() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { addItem } = useCart();

  const { data: menuItems = [], isLoading } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu"],
  });

  const categories = [
    { id: "all", name: "Semua Menu" },
    { id: "seblak", name: "Seblak" },
    { id: "makanan", name: "Makanan" },
    { id: "minuman", name: "Minuman" },
    { id: "cemilan", name: "Cemilan" },
  ];

  const filteredItems = selectedCategory === "all" 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

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
          <div className="text-center">Loading menu...</div>
        </div>
      </section>
    );
  }

  return (
    <section id="menu" className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-dark-grey mb-4">
            Menu Seblak Favorit
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Pilih seblak favorit Anda dengan berbagai tingkat kepedasan dan topping lezat
          </p>
        </div>

        {/* Menu Categories */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {categories.map((category) => (
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

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const IconComponent = categoryIcons[item.spicyLevel as keyof typeof categoryIcons] || ChefHat;
            const badgeColor = categoryColors[item.spicyLevel as keyof typeof categoryColors] || "bg-gray-500";
            
            return (
              <Card key={item.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-48 object-cover"
                  />
                  <Badge className={`absolute top-3 right-3 ${badgeColor} text-white`}>
                    <IconComponent className="h-3 w-3 mr-1" />
                    {item.spicyLevel}
                  </Badge>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-dark-grey mb-2">
                    {item.name}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-indonesian-red">
                      {formatRupiah(item.price)}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">
                        {(item.rating! / 10).toFixed(1)} ({item.reviewCount})
                      </span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleAddToCart(item)}
                    className="w-full bg-indonesian-red text-white hover:bg-red-600"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah ke Keranjang
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
