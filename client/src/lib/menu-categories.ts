import {
  ChefHat,
  Coffee,
  CookingPot,
  Flame,
  type LucideIcon,
  UtensilsCrossed,
} from "lucide-react";

export type MenuCategoryId =
  | "all"
  | "prasmanan"
  | "seblak"
  | "makanan"
  | "minuman"
  | "cemilan";

export type MenuCategory = {
  id: MenuCategoryId;
  name: string;
  description: string;
  icon: LucideIcon;
};

export const menuCategories: MenuCategory[] = [
  {
    id: "all",
    name: "Semua Menu",
    description: "Lihat seluruh pilihan menu favorit Seblak Listyaning.",
    icon: UtensilsCrossed,
  },
  {
    id: "prasmanan",
    name: "Seblak Prasmanan",
    description: "Pilihan topping bebas dengan rasa khas yang bisa disesuaikan.",
    icon: CookingPot,
  },
  {
    id: "seblak",
    name: "Seblak",
    description: "Menu seblak andalan dengan level pedas sesuai selera.",
    icon: Flame,
  },
  {
    id: "makanan",
    name: "Makanan",
    description: "Pilihan menu kenyang seperti nasi bakar dan sajian gurih lainnya.",
    icon: ChefHat,
  },
  {
    id: "minuman",
    name: "Minuman",
    description: "Minuman segar untuk menemani menu pedas favorit Anda.",
    icon: Coffee,
  },
  {
    id: "cemilan",
    name: "Cemilan",
    description: "Camilan ringan untuk tambahan teman makan atau ngemil.",
    icon: UtensilsCrossed,
  },
];
