import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { MenuItem } from "@shared/schema";

type RecipesTabProps = {
  filteredMenuItems: MenuItem[];
  recipeCoverageByMenuItem: Record<number, number>;
  recipeSearch: string;
  onRecipeSearchChange: (value: string) => void;
  onEditRecipe: (item: MenuItem) => void;
};

export function RecipesTab({
  filteredMenuItems,
  recipeCoverageByMenuItem,
  recipeSearch,
  onRecipeSearchChange,
  onEditRecipe,
}: RecipesTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resep menu</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <Input
            value={recipeSearch}
            onChange={(e) => onRecipeSearchChange(e.target.value)}
            placeholder="Cari menu berdasarkan nama atau kategori"
            className="md:max-w-sm"
          />
          <p className="text-sm text-muted-foreground">
            Resep memberi tahu aplikasi barang mana yang harus dikurangi setelah penjualan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredMenuItems.map((item) => {
            const ingredientCount = recipeCoverageByMenuItem[item.id] ?? 0;
            const hasRecipe = ingredientCount > 0;

            return (
              <Card key={item.id} className="border">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-gray-500 capitalize">{item.category}</p>
                    </div>
                    <Badge className={hasRecipe ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                      {hasRecipe ? `${ingredientCount} bahan` : "Resep belum ada"}
                    </Badge>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => onEditRecipe(item)}>
                    {hasRecipe ? "Ubah resep" : "Atur resep"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}

          {filteredMenuItems.length === 0 && (
            <div className="col-span-full rounded-lg border border-dashed bg-background p-8 text-center text-sm text-muted-foreground">
              Tidak ada menu yang cocok dengan pencarian Anda.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
