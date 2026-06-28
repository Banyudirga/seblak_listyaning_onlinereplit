import { useEffect, useState } from "react";

import { formatRupiah } from "@/lib/format";
import { PURCHASE_UNIT_OPTIONS, getSuggestedConversion, type PurchaseForm } from "@/components/supplies/supplies-types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Supply } from "@shared/schema";

type RecordPurchaseDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (form: PurchaseForm) => void;
  isSubmitting: boolean;
  supplies: Supply[];
};

export function RecordPurchaseDialog({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  supplies,
}: RecordPurchaseDialogProps) {
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
            <Input
              type="number"
              placeholder="How many units purchased"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            />
            <Select value={form.purchaseUnit} onValueChange={(value) => setForm({ ...form, purchaseUnit: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Purchase unit" />
              </SelectTrigger>
              <SelectContent>
                {Array.from(new Set([selectedSupply?.unit ?? "pcs", ...PURCHASE_UNIT_OPTIONS])).map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              type="number"
              placeholder={`How many ${selectedSupply?.unit ?? "base units"} in 1 ${form.purchaseUnit}`}
              value={form.baseUnitsPerPurchaseUnit}
              onChange={(e) => setForm({ ...form, baseUnitsPerPurchaseUnit: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Unit cost"
              value={form.unitCost}
              onChange={(e) => setForm({ ...form, unitCost: e.target.value })}
            />
          </div>

          {selectedSupply && (
            <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
              {getSuggestedConversion(form.purchaseUnit, selectedSupply.unit) !== null
                ? `Preset applied: 1 ${form.purchaseUnit} = ${getSuggestedConversion(form.purchaseUnit, selectedSupply.unit)} ${selectedSupply.unit}`
                : `Custom conversion: set how many ${selectedSupply.unit} are inside 1 ${form.purchaseUnit}`}
            </div>
          )}

          <Input
            placeholder="Supplier name"
            value={form.supplierName}
            onChange={(e) => setForm({ ...form, supplierName: e.target.value })}
          />
          <Textarea
            placeholder="Notes (optional)"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />

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
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button className="flex-1" disabled={isSubmitting || !!formError} onClick={() => onSubmit(form)}>
              Save Purchase
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}