import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Activity, AlertTriangle, ArrowLeft, BookOpen, PlusCircle, RefreshCw, ShoppingCart, Warehouse } from "lucide-react";

import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatRupiah } from "@/lib/format";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import type { MenuItem, MenuItemRecipe, Supply, SupplyPurchase, SupplyStockMovement } from "@shared/schema";

type RecipeCoverageSummary = {
  menuItemId: number;
  ingredientCount: number;
};

const PURCHASE_UNIT_OPTIONS = ["pcs", "gram", "kg", "ml", "liter", "pack", "box"];

function getSuggestedConversion(purchaseUnit: string, baseUnit: string) {
  if (purchaseUnit === baseUnit) return 1;
  if (purchaseUnit === "kg" && baseUnit === "gram") return 1000;
  if (purchaseUnit === "liter" && baseUnit === "ml") return 1000;
  return null;
}

type SupplyForm = {
  name: string;
  unit: string;
  stockQuantity: string;
  lowStockThreshold: string;
  supplierName: string;
};

type PurchaseForm = {
  supplyId: string;
  quantity: string;
  purchaseUnit: string;
  baseUnitsPerPurchaseUnit: string;
  unitCost: string;
  supplierName: string;
  notes: string;
};

type RecipeDraft = {
  supplyId: string;
  quantityRequired: string;
};

export default function SuppliesPage() {
  const { toast } = useToast();
  const [isAddSupplyOpen, setIsAddSupplyOpen] = useState(false);
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [supplySearch, setSupplySearch] = useState("");
  const [recipeSearch, setRecipeSearch] = useState("");

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
    () => Object.fromEntries(supplies.map((s) => [s.id, s.name])),
    [supplies]
  );
  const recipeCoverageByMenuItem = useMemo(
    () => Object.fromEntries(recipeCoverage.map((item) => [item.menuItemId, item.ingredientCount])),
    [recipeCoverage]
  );

  const refreshAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["/api/admin/supplies"] }),
      queryClient.invalidateQueries({ queryKey: ["/api/admin/supply-purchases"] }),
      queryClient.invalidateQueries({ queryKey: ["/api/admin/inventory"] }),
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stock-movements"] }),
    ]);
    toast({ title: "Refreshed", description: "Supply data has been refreshed." });
  };

  const supplyById = useMemo(
    () => Object.fromEntries(supplies.map((supply) => [supply.id, supply])),
    [supplies]
  );

  const addSupplyMutation = useMutation({
    mutationFn: async (form: SupplyForm) =>
      apiRequest("POST", "/api/admin/supplies", {
        name: form.name,
        unit: form.unit,
        stockQuantity: Number(form.stockQuantity),
        lowStockThreshold: Number(form.lowStockThreshold),
        supplierName: form.supplierName || null,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/supplies"] });
      setIsAddSupplyOpen(false);
      toast({ title: "Supply added", description: "New supply item has been created." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add supply.", variant: "destructive" });
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
      setIsPurchaseOpen(false);
      toast({ title: "Purchase recorded", description: "Supply stock has been increased." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to record purchase.", variant: "destructive" });
    },
  });

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
      setEditingMenuItem(null);
      toast({ title: "Recipe saved", description: "Recipe is ready for stock deduction on sales." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to save recipe.", variant: "destructive" });
    },
  });

  const lowStockSupplies = supplies.filter((s) => s.stockQuantity <= s.lowStockThreshold);
  const totalPurchaseValue = purchases.reduce((sum, item) => sum + item.totalCost, 0);
  const filteredSupplies = supplies.filter((supply) =>
    `${supply.name} ${supply.supplierName ?? ""} ${supply.unit}`
      .toLowerCase()
      .includes(supplySearch.toLowerCase())
  );
  const filteredMenuItems = menuItems.filter((item) =>
    `${item.name} ${item.category}`.toLowerCase().includes(recipeSearch.toLowerCase())
  );
  const totalSupplyUnits = supplies.reduce((sum, supply) => sum + supply.stockQuantity, 0);
  const recentPurchases = purchases.slice(0, 5);

  if (suppliesLoading || purchasesLoading || menuItemsLoading) {
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
      <div className="bg-indonesian-red text-white p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Supply Management</h1>
            <p className="text-red-100">Manage ingredients, purchases, and menu recipes</p>
            <Link href="/admin" className="inline-block mt-1">
              <Button variant="outline" size="sm" className="text-indonesian-red border-white hover:bg-white text-xs py-1 h-auto">
                <ArrowLeft className="h-3 w-3 mr-1" />
                Back to Admin
              </Button>
            </Link>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => setIsAddSupplyOpen(true)} variant="outline" className="text-indonesian-red border-white hover:bg-white">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Supply
            </Button>
            <Button onClick={() => setIsPurchaseOpen(true)} variant="outline" className="text-indonesian-red border-white hover:bg-white">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Record Purchase
            </Button>
            <Button onClick={refreshAll} variant="outline" className="text-indonesian-red border-white hover:bg-white">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Total Supplies</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-indonesian-red">{supplies.length}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Low Stock</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-yellow-600">{lowStockSupplies.length}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Purchases</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-green-600">{purchases.length}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Purchase Value</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-blue-600">{formatRupiah(totalPurchaseValue)}</div></CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">How This Flow Works</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>1. Add your raw supplies like crackers, noodles, eggs, or chili.</p>
              <p>2. Record purchases to increase stock immediately.</p>
              <p>3. Connect menu items to supplies in Recipes so confirmed sales can deduct ingredient stock.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tracked units</span>
                <span className="font-semibold">{totalSupplyUnits}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Recent purchases</span>
                <span className="font-semibold">{recentPurchases.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Need attention</span>
                <Badge className={lowStockSupplies.length > 0 ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}>
                  {lowStockSupplies.length > 0 ? `${lowStockSupplies.length} low stock` : "All healthy"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="supplies">
          <TabsList className="mb-6 h-auto flex-wrap justify-start gap-1 bg-transparent p-0">
            <TabsTrigger value="supplies"><Warehouse className="h-4 w-4 mr-2" />Supplies</TabsTrigger>
            <TabsTrigger value="purchases"><ShoppingCart className="h-4 w-4 mr-2" />Purchases</TabsTrigger>
            <TabsTrigger value="recipes"><BookOpen className="h-4 w-4 mr-2" />Recipes</TabsTrigger>
            <TabsTrigger value="reports"><Activity className="h-4 w-4 mr-2" />Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="supplies">
            <Card>
              <CardHeader>
                <CardTitle>Supply Stock</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                  <Input
                    value={supplySearch}
                    onChange={(e) => setSupplySearch(e.target.value)}
                    placeholder="Search by supply, supplier, or unit"
                    className="md:max-w-sm"
                  />
                  <p className="text-sm text-muted-foreground">
                    {filteredSupplies.length} of {supplies.length} supplies shown
                  </p>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Threshold</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSupplies.map((supply) => (
                      <TableRow key={supply.id}>
                        <TableCell className="font-medium">{supply.name}</TableCell>
                        <TableCell>{supply.unit}</TableCell>
                        <TableCell>{supply.stockQuantity} {supply.unit}</TableCell>
                        <TableCell>{supply.lowStockThreshold} {supply.unit}</TableCell>
                        <TableCell>{supply.supplierName || "-"}</TableCell>
                        <TableCell>
                          <Badge className={supply.stockQuantity <= supply.lowStockThreshold ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}>
                            {supply.stockQuantity <= supply.lowStockThreshold ? "Low stock" : "Healthy"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredSupplies.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-gray-500 py-10">
                          {supplies.length === 0 ? "No supplies yet. Add your first ingredient to start tracking stock." : "No supplies match your search."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="purchases">
            <Card>
              <CardHeader>
                <CardTitle>Purchase History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Purchases are shown newest first and increase supply stock as soon as they are recorded.
                </p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Supply</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Cost</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchases.map((purchase) => (
                      <TableRow key={purchase.id}>
                        <TableCell>{purchase.purchasedAt ? new Date(purchase.purchasedAt).toLocaleDateString("id-ID") : "-"}</TableCell>
                        <TableCell className="font-medium">{supplyNameById[purchase.supplyId] || `Supply #${purchase.supplyId}`}</TableCell>
                        <TableCell>{purchase.supplierName || "-"}</TableCell>
                        <TableCell>
                          <div className="font-medium">{purchase.quantity} {purchase.purchaseUnit}</div>
                          <div className="text-xs text-muted-foreground">Adds {purchase.convertedQuantity} {supplyById[purchase.supplyId]?.unit ?? "base units"}</div>
                        </TableCell>
                        <TableCell>{formatRupiah(purchase.unitCost)}</TableCell>
                        <TableCell>{formatRupiah(purchase.totalCost)}</TableCell>
                      </TableRow>
                    ))}
                    {purchases.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-gray-500 py-10">
                          No purchases recorded yet. Use "Record Purchase" to add incoming stock.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <div className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.25fr] gap-6">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-yellow-600" />Low-Stock Alerts</CardTitle></CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {lowStockSupplies.length === 0 ? <p className="text-muted-foreground">All supplies are above their alert threshold.</p> : lowStockSupplies.map((supply) => (
                    <div key={supply.id} className="rounded-lg border p-3">
                      <div className="font-medium">{supply.name}</div>
                      <div className="text-muted-foreground">Current: {supply.stockQuantity} {supply.unit} · Alert at {supply.lowStockThreshold} {supply.unit}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="h-4 w-4 text-indonesian-red" />Usage History</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Supply</TableHead><TableHead>Type</TableHead><TableHead>Change</TableHead><TableHead>Reference</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {stockMovements.map((movement) => (
                        <TableRow key={movement.id}>
                          <TableCell>{movement.createdAt ? new Date(movement.createdAt).toLocaleString("id-ID") : "-"}</TableCell>
                          <TableCell className="font-medium">{supplyNameById[movement.supplyId] || `Supply #${movement.supplyId}`}</TableCell>
                          <TableCell className="capitalize">{movement.movementType}</TableCell>
                          <TableCell className={movement.quantityChange >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>{movement.quantityChange > 0 ? `+${movement.quantityChange}` : movement.quantityChange} {movement.unit}</TableCell>
                          <TableCell>{movement.referenceType}{movement.referenceId ? ` #${movement.referenceId}` : ""}</TableCell>
                        </TableRow>
                      ))}
                      {stockMovements.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-gray-500 py-10">No stock movements yet. Purchases and sales will appear here.</TableCell></TableRow>}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="recipes">
            <Card>
              <CardHeader>
                <CardTitle>Menu Recipes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                  <Input
                    value={recipeSearch}
                    onChange={(e) => setRecipeSearch(e.target.value)}
                    placeholder="Search menu items by name or category"
                    className="md:max-w-sm"
                  />
                  <p className="text-sm text-muted-foreground">
                    Recipes tell the app which supplies should be deducted after a sale.
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
                              {hasRecipe ? `${ingredientCount} ingredients` : "Recipe missing"}
                            </Badge>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => setEditingMenuItem(item)}>
                            {hasRecipe ? "Edit Recipe" : "Set Recipe"}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                  {filteredMenuItems.length === 0 && (
                    <div className="col-span-full rounded-lg border border-dashed bg-background p-8 text-center text-sm text-muted-foreground">
                      No menu items match your search.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
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

function AddSupplyDialog({
  open,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (form: SupplyForm) => void;
  isSubmitting: boolean;
}) {
  const [form, setForm] = useState<SupplyForm>({
    name: "",
    unit: "pcs",
    stockQuantity: "0",
    lowStockThreshold: "0",
    supplierName: "",
  });

  useEffect(() => {
    if (open) {
      setForm({ name: "", unit: "pcs", stockQuantity: "0", lowStockThreshold: "0", supplierName: "" });
    }
  }, [open]);

  const stockQuantity = Number(form.stockQuantity || 0);
  const lowStockThreshold = Number(form.lowStockThreshold || 0);
  const formError =
    !form.name.trim()
      ? "Supply name is required."
      : !form.unit.trim()
        ? "Unit is required."
        : stockQuantity < 0 || lowStockThreshold < 0
          ? "Stock and threshold must be zero or greater."
          : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Supply</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Add the ingredient using the smallest stock unit used by recipes, like gram, ml, or pcs.
          </p>
          <Input placeholder="Supply name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select value={form.unit} onValueChange={(value) => setForm({ ...form, unit: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select base unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pcs">pcs</SelectItem>
                <SelectItem value="gram">gram</SelectItem>
                <SelectItem value="ml">ml</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Default supplier (optional)" value={form.supplierName} onChange={(e) => setForm({ ...form, supplierName: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input type="number" placeholder="Initial stock" value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })} />
            <Input type="number" placeholder="Low stock threshold" value={form.lowStockThreshold} onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })} />
          </div>
          <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
            This item will start with <span className="font-semibold text-foreground">{stockQuantity}</span> {form.unit}
            and show low-stock alerts at <span className="font-semibold text-foreground">{lowStockThreshold}</span> {form.unit}.
          </div>
          {formError && <p className="text-sm text-destructive">{formError}</p>}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button className="flex-1" disabled={isSubmitting || !!formError} onClick={() => onSubmit(form)}>
              Save Supply
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RecordPurchaseDialog({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  supplies,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (form: PurchaseForm) => void;
  isSubmitting: boolean;
  supplies: Supply[];
}) {
  const [form, setForm] = useState<PurchaseForm>({
    supplyId: "",
    quantity: "1",
    purchaseUnit: "pcs",
    baseUnitsPerPurchaseUnit: "1",
    unitCost: "0",
    supplierName: "",
    notes: "",
  });

  useEffect(() => {
    if (open) {
      const defaultUnit = supplies[0]?.unit ?? "pcs";
      setForm({
        supplyId: supplies[0] ? String(supplies[0].id) : "",
        quantity: "1",
        purchaseUnit: defaultUnit,
        baseUnitsPerPurchaseUnit: String(getSuggestedConversion(defaultUnit, defaultUnit) ?? 1),
        unitCost: "0",
        supplierName: "",
        notes: "",
      });
    }
  }, [open, supplies]);

  const selectedSupply = supplies.find((supply) => String(supply.id) === form.supplyId) ?? null;

  useEffect(() => {
    if (!selectedSupply) return;
    const suggested = getSuggestedConversion(form.purchaseUnit, selectedSupply.unit);
    if (suggested !== null) {
      setForm((current) => ({ ...current, baseUnitsPerPurchaseUnit: String(suggested) }));
    }
  }, [form.purchaseUnit, selectedSupply]);
  const quantity = Number(form.quantity || 0);
  const baseUnitsPerPurchaseUnit = Number(form.baseUnitsPerPurchaseUnit || 0);
  const unitCost = Number(form.unitCost || 0);
  const formError =
    !form.supplyId
      ? "Select a supply first."
      : quantity <= 0
        ? "Quantity must be greater than 0."
        : baseUnitsPerPurchaseUnit <= 0
          ? "Base unit conversion must be greater than 0."
          : unitCost < 0
            ? "Unit cost cannot be negative."
            : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Purchase</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Recording a purchase adds stock immediately for the selected supply.
          </p>
          <Select value={form.supplyId} onValueChange={(value) => setForm({ ...form, supplyId: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select a supply" />
            </SelectTrigger>
            <SelectContent>
              {supplies.map((supply) => (
                <SelectItem key={supply.id} value={String(supply.id)}>
                  {supply.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedSupply && (
            <div className="rounded-md bg-muted p-3 text-sm">
              Current stock: <span className="font-semibold">{selectedSupply.stockQuantity} {selectedSupply.unit}</span>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input type="number" placeholder="How many units purchased" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
            <Select value={form.purchaseUnit} onValueChange={(value) => setForm({ ...form, purchaseUnit: value })}>
              <SelectTrigger><SelectValue placeholder="Purchase unit" /></SelectTrigger>
              <SelectContent>
                {Array.from(new Set([selectedSupply?.unit ?? "pcs", ...PURCHASE_UNIT_OPTIONS])).map((unit) => (
                  <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input type="number" placeholder={`How many ${selectedSupply?.unit ?? "base units"} in 1 ${form.purchaseUnit}`} value={form.baseUnitsPerPurchaseUnit} onChange={(e) => setForm({ ...form, baseUnitsPerPurchaseUnit: e.target.value })} />
            <Input type="number" placeholder="Unit cost" value={form.unitCost} onChange={(e) => setForm({ ...form, unitCost: e.target.value })} />
          </div>
          {selectedSupply && (
            <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
              {getSuggestedConversion(form.purchaseUnit, selectedSupply.unit) !== null
                ? `Preset applied: 1 ${form.purchaseUnit} = ${getSuggestedConversion(form.purchaseUnit, selectedSupply.unit)} ${selectedSupply.unit}`
                : `Custom conversion: set how many ${selectedSupply.unit} are inside 1 ${form.purchaseUnit}`}
            </div>
          )}
          <Input placeholder="Supplier name" value={form.supplierName} onChange={(e) => setForm({ ...form, supplierName: e.target.value })} />
          <Textarea placeholder="Notes (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="rounded-md bg-muted p-3 text-sm">
            <div>
              Estimated total: <span className="font-semibold">{formatRupiah(quantity * unitCost)}</span>
            </div>
            {selectedSupply && (
              <>
                <div className="mt-1 text-muted-foreground">
                  Stock increase: <span className="font-semibold text-foreground">{Math.max(quantity, 0) * Math.max(baseUnitsPerPurchaseUnit, 0)} {selectedSupply.unit}</span>
                </div>
                <div className="mt-1 text-muted-foreground">
                  Stock after purchase: <span className="font-semibold text-foreground">{selectedSupply.stockQuantity + Math.max(quantity, 0) * Math.max(baseUnitsPerPurchaseUnit, 0)} {selectedSupply.unit}</span>
                </div>
              </>
            )}
          </div>
          {formError && <p className="text-sm text-destructive">{formError}</p>}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button className="flex-1" disabled={isSubmitting || !!formError} onClick={() => onSubmit(form)}>
              Save Purchase
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RecipeEditorDialog({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  menuItem,
  supplies,
  recipes,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (items: RecipeDraft[]) => void;
  isSubmitting: boolean;
  menuItem: MenuItem | null;
  supplies: Supply[];
  recipes: MenuItemRecipe[];
}) {
  const [items, setItems] = useState<RecipeDraft[]>([]);

  useEffect(() => {
    if (!open) return;
    setItems(
      recipes.length > 0
        ? recipes.map((recipe) => ({
            supplyId: String(recipe.supplyId),
            quantityRequired: String(recipe.quantityRequired),
          }))
        : [{ supplyId: supplies[0] ? String(supplies[0].id) : "", quantityRequired: "1" }]
    );
  }, [open, recipes, supplies]);

  const updateItem = (index: number, next: Partial<RecipeDraft>) => {
    setItems((current) => current.map((item, i) => (i === index ? { ...item, ...next } : item)));
  };
  const selectedSupplyIds = items.map((item) => item.supplyId).filter(Boolean);
  const hasDuplicateSupplies = new Set(selectedSupplyIds).size !== selectedSupplyIds.length;
  const formError =
    supplies.length === 0
      ? "Add supplies before creating recipes."
      : hasDuplicateSupplies
        ? "Each supply should only appear once in a recipe."
        : items.some((item) => !item.supplyId || Number(item.quantityRequired) <= 0)
          ? "Each ingredient needs a supply and a quantity greater than 0."
          : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Recipe - {menuItem?.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Set how much of each supply is consumed every time this menu item is sold, using the supply base unit.
          </p>
          <Separator />
          {items.map((item, index) => (
            <div key={index} className="rounded-lg border p-3 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_160px_96px] gap-2 items-center">
                <Select value={item.supplyId} onValueChange={(value) => updateItem(index, { supplyId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ingredient" />
                  </SelectTrigger>
                  <SelectContent>
                    {supplies.map((supply) => (
                      <SelectItem key={supply.id} value={String(supply.id)}>
                        {supply.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder={supplies.find((supply) => String(supply.id) === item.supplyId)?.unit ? `Qty per sale (${supplies.find((supply) => String(supply.id) === item.supplyId)?.unit})` : "Qty per sale"}
                  value={item.quantityRequired}
                  onChange={(e) => updateItem(index, { quantityRequired: e.target.value })}
                />
                <Button
                  variant="outline"
                  onClick={() => setItems((current) => current.filter((_, i) => i !== index))}
                  disabled={items.length === 1}
                >
                  Remove
                </Button>
              </div>
              {item.supplyId && (() => {
                const selectedSupply = supplies.find((supply) => String(supply.id) === item.supplyId);
                if (!selectedSupply) return null;
                return (
                  <div className="text-sm text-muted-foreground">
                    Available now: <span className="font-medium text-foreground">{selectedSupply.stockQuantity} {selectedSupply.unit}</span>
                    {selectedSupply.stockQuantity <= selectedSupply.lowStockThreshold && (
                      <span className="ml-2 text-yellow-700">This ingredient is already low on stock.</span>
                    )}
                  </div>
                );
              })()}
            </div>
          ))}

          <Button
            variant="outline"
            disabled={supplies.length === 0}
            onClick={() => setItems((current) => [...current, { supplyId: supplies[0] ? String(supplies[0].id) : "", quantityRequired: "1" }])}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Ingredient
          </Button>

          {formError && <p className="text-sm text-destructive">{formError}</p>}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button
              className="flex-1"
              disabled={isSubmitting || !!formError}
              onClick={() => onSubmit(items)}
            >
              Save Recipe
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
