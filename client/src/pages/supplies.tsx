import { useState } from "react";
import { Activity, BookOpen, RefreshCw, ShoppingCart, Warehouse } from "lucide-react";

import { formatRupiah } from "@/lib/format";
import { useSuppliesPage } from "@/hooks/use-supplies-page";
import { SuppliesHeader } from "@/components/supplies/supplies-header";
import { SuppliesOverview } from "@/components/supplies/supplies-overview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { MenuItem } from "@shared/schema";
import { AddSupplyDialog } from "@/components/supplies/add-supply-dialog";
import { PurchasesTab } from "@/components/supplies/purchases-tab";
import { RecipeEditorDialog } from "@/components/supplies/recipe-editor-dialog";
import { RecipesTab } from "@/components/supplies/recipes-tab";
import { RecordPurchaseDialog } from "@/components/supplies/record-purchase-dialog";
import { ReportsTab } from "@/components/supplies/reports-tab";
import { SuppliesTab } from "@/components/supplies/supplies-tab";


export default function SuppliesPage() {
  const [isAddSupplyOpen, setIsAddSupplyOpen] = useState(false);
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [supplySearch, setSupplySearch] = useState("");
  const [recipeSearch, setRecipeSearch] = useState("");

  const {
    supplies,
    purchases,
    stockMovements,
    recipes,
    recipesLoading,
    isPageLoading,
    lowStockSupplies,
    totalPurchaseValue,
    filteredSupplies,
    filteredMenuItems,
    totalSupplyUnits,
    recentPurchases,
    supplyNameById,
    recipeCoverageByMenuItem,
    supplyById,
    refreshAll,
    addSupplyMutation,
    addPurchaseMutation,
    saveRecipeMutation,
  } = useSuppliesPage({
    editingMenuItem,
    supplySearch,
    recipeSearch,
    onAddSupplySuccess: () => setIsAddSupplyOpen(false),
    onAddPurchaseSuccess: () => setIsPurchaseOpen(false),
    onRecipeSaveSuccess: () => setEditingMenuItem(null),
  });

  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-light-grey flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading supplies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-grey">
      <SuppliesHeader
        onAddSupply={() => setIsAddSupplyOpen(true)}
        onRecordPurchase={() => setIsPurchaseOpen(true)}
        onRefresh={refreshAll}
      />

      <div className="max-w-7xl mx-auto p-6">
        <SuppliesOverview
          totalSupplies={supplies.length}
          lowStockCount={lowStockSupplies.length}
          purchasesCount={purchases.length}
          totalPurchaseValue={formatRupiah(totalPurchaseValue)}
          totalSupplyUnits={totalSupplyUnits}
          recentPurchasesCount={recentPurchases.length}
        />
        <Tabs defaultValue="supplies">
          <TabsList className="mb-6 h-auto flex-wrap justify-start gap-1 bg-transparent p-0">
            <TabsTrigger value="supplies"><Warehouse className="h-4 w-4 mr-2" />Supplies</TabsTrigger>
            <TabsTrigger value="purchases"><ShoppingCart className="h-4 w-4 mr-2" />Purchases</TabsTrigger>
            <TabsTrigger value="recipes"><BookOpen className="h-4 w-4 mr-2" />Recipes</TabsTrigger>
            <TabsTrigger value="reports"><Activity className="h-4 w-4 mr-2" />Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="supplies">
            <SuppliesTab
              supplies={supplies}
              filteredSupplies={filteredSupplies}
              supplySearch={supplySearch}
              onSupplySearchChange={setSupplySearch}
            />
          </TabsContent>

          <TabsContent value="purchases">
            <PurchasesTab purchases={purchases} supplyById={supplyById} supplyNameById={supplyNameById} />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsTab lowStockSupplies={lowStockSupplies} stockMovements={stockMovements} supplyNameById={supplyNameById} />
          </TabsContent>

          <TabsContent value="recipes">
            <RecipesTab
              filteredMenuItems={filteredMenuItems}
              recipeCoverageByMenuItem={recipeCoverageByMenuItem}
              recipeSearch={recipeSearch}
              onRecipeSearchChange={setRecipeSearch}
              onEditRecipe={setEditingMenuItem}
            />
          </TabsContent>
        </Tabs>
      </div>

      <AddSupplyDialog
        open={isAddSupplyOpen}
        onClose={() => setIsAddSupplyOpen(false)}
        onSubmit={(form) => addSupplyMutation.mutate(form)}
        isSubmitting={addSupplyMutation.isPending}
      />

      <RecordPurchaseDialog
        open={isPurchaseOpen}
        onClose={() => setIsPurchaseOpen(false)}
        onSubmit={(form) => addPurchaseMutation.mutate(form)}
        isSubmitting={addPurchaseMutation.isPending}
        supplies={supplies}
      />

      <RecipeEditorDialog
        open={!!editingMenuItem}
        onClose={() => setEditingMenuItem(null)}
        onSubmit={(items) => editingMenuItem && saveRecipeMutation.mutate({ menuItemId: editingMenuItem.id, items })}
        isSubmitting={saveRecipeMutation.isPending || recipesLoading}
        menuItem={editingMenuItem}
        supplies={supplies}
        recipes={recipes}
      />
    </div>
  );
}

