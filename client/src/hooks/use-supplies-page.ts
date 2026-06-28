import { useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import { apiRequest, getApiUrl, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { PurchaseForm, RecipeCoverageSummary, RecipeDraft, SupplyForm } from "@/components/supplies/supplies-types";
import type { MenuItem, MenuItemRecipe, Supply, SupplyPurchase, SupplyStockMovement } from "@shared/schema";

type UseSuppliesPageOptions = {
  editingMenuItem: MenuItem | null;
  supplySearch: string;
  recipeSearch: string;
  onAddSupplySuccess: () => void;
  onAddPurchaseSuccess: () => void;
  onRecipeSaveSuccess: () => void;
};

export function useSuppliesPage({
  editingMenuItem,
  supplySearch,
  recipeSearch,
  onAddSupplySuccess,
  onAddPurchaseSuccess,
  onRecipeSaveSuccess,
}: UseSuppliesPageOptions) {
  const { toast } = useToast();

  const { data: supplies = [], isLoading: suppliesLoading } = useQuery<Supply[]>({
    queryKey: ["/api/admin/supplies"],
  });

  const { data: purchases = [], isLoading: purchasesLoading } = useQuery<SupplyPurchase[]>({
    queryKey: ["/api/admin/supply-purchases"],
  });

  const { data: menuItems = [], isLoading: menuItemsLoading } = useQuery<MenuItem[]>({
    queryKey: ["/api/admin/inventory"],
  });

  const { data: recipeCoverage = [] } = useQuery<RecipeCoverageSummary[]>({
    queryKey: ["/api/admin/recipes/summary"],
  });

  const { data: stockMovements = [] } = useQuery<SupplyStockMovement[]>({
    queryKey: ["/api/admin/stock-movements"],
  });

  const { data: recipes = [], isLoading: recipesLoading } = useQuery<MenuItemRecipe[]>({
    queryKey: [editingMenuItem ? `/api/admin/menu-items/${editingMenuItem.id}/recipes` : "/api/admin/menu-items/0/recipes"],
    enabled: !!editingMenuItem,
  });

  const supplyNameById = useMemo(
    () => Object.fromEntries(supplies.map((supply) => [supply.id, supply.name])) as Record<number, string>,
    [supplies]
  );

  const recipeCoverageByMenuItem = useMemo(
    () => Object.fromEntries(recipeCoverage.map((item) => [item.menuItemId, item.ingredientCount])) as Record<number, number>,
    [recipeCoverage]
  );

  const supplyById = useMemo(
    () => Object.fromEntries(supplies.map((supply) => [supply.id, supply])) as Record<number, Supply>,
    [supplies]
  );

  const refreshAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["/api/admin/supplies"] }),
      queryClient.invalidateQueries({ queryKey: ["/api/admin/supply-purchases"] }),
      queryClient.invalidateQueries({ queryKey: ["/api/admin/inventory"] }),
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stock-movements"] }),
    ]);

    toast({
      title: "Data diperbarui",
      description: "Data barang berhasil dimuat ulang.",
    });
  };

  const uploadSupplyImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(getApiUrl("/api/admin/uploads/supply-image"), {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!res.ok) {
      const text = (await res.text()) || res.statusText;
      throw new Error(`${res.status}: ${text}`);
    }

    const data = (await res.json()) as { imageUrl: string };
    return data.imageUrl;
  };

  const addSupplyMutation = useMutation({
    mutationFn: async (form: SupplyForm) => {
      const imageUrl = form.imageFile
        ? await uploadSupplyImage(form.imageFile)
        : form.imageUrl.trim() || undefined;

      return apiRequest("POST", "/api/admin/supplies", {
        name: form.name,
        imageUrl,
        unit: form.unit,
        stockQuantity: Number(form.stockQuantity),
        lowStockThreshold: Number(form.lowStockThreshold),
        supplierName: form.supplierName || null,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/supplies"] });
      onAddSupplySuccess();
      toast({
        title: "Barang ditambahkan",
        description: "Barang baru berhasil dibuat.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Terjadi kesalahan",
        description: error.message || "Gagal menambahkan barang.",
        variant: "destructive",
      });
    },
  });

  const addPurchaseMutation = useMutation({
    mutationFn: async (form: PurchaseForm) =>
      apiRequest("POST", "/api/admin/supply-purchases", {
        supplyId: Number(form.supplyId),
        quantity: Number(form.quantity),
        purchaseUnit: form.purchaseUnit,
        baseUnitsPerPurchaseUnit: Number(form.baseUnitsPerPurchaseUnit),
        unitCost: Number(form.unitCost),
        supplierName: form.supplierName || null,
        notes: form.notes || null,
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api/admin/supplies"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/admin/supply-purchases"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/admin/stock-movements"] }),
      ]);
      onAddPurchaseSuccess();
      toast({
        title: "Pembelian dicatat",
        description: "Stok barang berhasil ditambahkan.",
      });
    },
    onError: () => {
      toast({
        title: "Terjadi kesalahan",
        description: "Gagal mencatat pembelian.",
        variant: "destructive",
      });
    },
  });

  const lowStockSupplies = supplies.filter((supply) => supply.stockQuantity <= supply.lowStockThreshold);
  const totalPurchaseValue = purchases.reduce((sum, item) => sum + item.totalCost, 0);
  const filteredSupplies = supplies.filter((supply) =>
    `${supply.name} ${supply.supplierName ?? ""} ${supply.unit}`.toLowerCase().includes(supplySearch.toLowerCase())
  );
  const filteredMenuItems = menuItems.filter((item) =>
    `${item.name} ${item.category}`.toLowerCase().includes(recipeSearch.toLowerCase())
  );
  const totalSupplyUnits = supplies.reduce((sum, supply) => sum + supply.stockQuantity, 0);
  const recentPurchases = purchases.slice(0, 5);
  const isPageLoading = suppliesLoading || purchasesLoading || menuItemsLoading;

  const saveRecipeMutation = useMutation({
    mutationFn: async ({ menuItemId, items }: { menuItemId: number; items: RecipeDraft[] }) =>
      apiRequest(
        "PUT",
        `/api/admin/menu-items/${menuItemId}/recipes`,
        items.map((item) => ({
          supplyId: Number(item.supplyId),
          quantityRequired: Number(item.quantityRequired),
        }))
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/inventory"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/recipes/summary"] });

      if (editingMenuItem) {
        await queryClient.invalidateQueries({
          queryKey: [`/api/admin/menu-items/${editingMenuItem.id}/recipes`],
        });
      }

      onRecipeSaveSuccess();
      toast({
        title: "Resep disimpan",
        description: "Resep siap digunakan untuk pengurangan stok saat penjualan.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Terjadi kesalahan",
        description: error.message || "Gagal menyimpan resep.",
        variant: "destructive",
      });
    },
  });

  return {
    supplies,
    purchases,
    menuItems,
    stockMovements,
    recipes,
    recipesLoading,
    suppliesLoading,
    purchasesLoading,
    menuItemsLoading,
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
  };
}
