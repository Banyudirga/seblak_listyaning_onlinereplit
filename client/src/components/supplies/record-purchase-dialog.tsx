import { type FormEvent, useEffect, useState } from "react";

import { formatRupiah } from "@/lib/format";
import { COMMON_UNIT_SUGGESTIONS, getSuggestedConversion, type PurchaseForm } from "@/components/supplies/supplies-types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
      const firstSupply = supplies[0];
      const defaultUnit = firstSupply?.defaultPurchaseUnit ?? firstSupply?.unit ?? "pcs";
      setForm({
        supplyId: firstSupply ? String(firstSupply.id) : "",
        quantity: "1",
        purchaseUnit: defaultUnit,
        baseUnitsPerPurchaseUnit: String(firstSupply?.defaultBaseUnitsPerPurchaseUnit ?? getSuggestedConversion(defaultUnit, firstSupply?.unit ?? defaultUnit) ?? 1),
        unitCost: "0",
        supplierName: "",
        notes: "",
      });
    }
  }, [open, supplies]);

  const selectedSupply = supplies.find((supply) => String(supply.id) === form.supplyId) ?? null;

  const handleSupplyChange = (value: string) => {
    const supply = supplies.find((item) => String(item.id) === value) ?? null;
    setForm((current) => ({
      ...current,
      supplyId: value,
      purchaseUnit: supply?.defaultPurchaseUnit ?? supply?.unit ?? "pcs",
      baseUnitsPerPurchaseUnit: String(supply?.defaultBaseUnitsPerPurchaseUnit ?? 1),
      supplierName: supply?.supplierName ?? current.supplierName,
    }));
  };

  useEffect(() => {
    if (!selectedSupply) return;
    if (form.purchaseUnit === selectedSupply.defaultPurchaseUnit) {
      setForm((current) => ({ ...current, baseUnitsPerPurchaseUnit: String(selectedSupply.defaultBaseUnitsPerPurchaseUnit) }));
      return;
    }
    const suggested = getSuggestedConversion(form.purchaseUnit, selectedSupply.unit);
    if (suggested !== null) {
      setForm((current) => ({ ...current, baseUnitsPerPurchaseUnit: String(suggested) }));
    }
  }, [form.purchaseUnit, selectedSupply]);

  const quantity = Number(form.quantity || 0);
  const baseUnitsPerPurchaseUnit = Number(form.baseUnitsPerPurchaseUnit || 0);
  const unitCost = Number(form.unitCost || 0);
  const totalCost = Math.max(quantity, 0) * Math.max(unitCost, 0);
  const formError =
    !form.supplyId
      ? "Pilih barang terlebih dahulu."
      : quantity <= 0
        ? "Jumlah pembelian harus lebih dari 0."
        : baseUnitsPerPurchaseUnit <= 0
          ? "Konversi ke satuan dasar harus lebih dari 0."
          : unitCost < 0
            ? "Harga satuan tidak boleh negatif."
            : null;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting || formError) return;
    onSubmit(form);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="top-4 flex max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-xl translate-y-0 flex-col gap-0 overflow-hidden p-0 sm:top-[50%] sm:max-h-[90vh] sm:w-full sm:translate-y-[-50%]"
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader className="shrink-0 border-b px-4 py-4 text-left sm:px-6">
          <DialogTitle>Catat pembelian</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6">
          <p className="text-sm text-muted-foreground">
            Pencatatan pembelian akan langsung menambah stok barang yang dipilih.
          </p>

          <Select value={form.supplyId} onValueChange={handleSupplyChange}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih barang" />
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
              Stok saat ini: <span className="font-semibold">{selectedSupply.stockQuantity} {selectedSupply.unit}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input type="number" inputMode="numeric" placeholder="Jumlah unit yang dibeli" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
            <Input list="purchase-unit-suggestions" placeholder="Satuan beli, mis. box, bungkus, pack" value={form.purchaseUnit} onChange={(e) => setForm({ ...form, purchaseUnit: e.target.value })} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Nilai konversi</Label>
              <Input
                type="number"
                inputMode="numeric"
                placeholder={`Berapa ${selectedSupply?.unit ?? "satuan dasar"} dalam 1 ${form.purchaseUnit}`}
                value={form.baseUnitsPerPurchaseUnit}
                onChange={(e) => setForm({ ...form, baseUnitsPerPurchaseUnit: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Harga satuan</Label>
              <Input
                type="number"
                inputMode="numeric"
                placeholder="Contoh: 25000"
                value={form.unitCost}
                onChange={(e) => setForm({ ...form, unitCost: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Total harga</Label>
            <Input value={formatRupiah(totalCost)} readOnly className="bg-muted" />
          </div>

          {selectedSupply && (
            <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
              {form.purchaseUnit === selectedSupply.defaultPurchaseUnit
                ? `Default barang: 1 ${selectedSupply.defaultPurchaseUnit} = ${selectedSupply.defaultBaseUnitsPerPurchaseUnit} ${selectedSupply.unit}`
                : getSuggestedConversion(form.purchaseUnit, selectedSupply.unit) !== null
                  ? `Preset diterapkan: 1 ${form.purchaseUnit} = ${getSuggestedConversion(form.purchaseUnit, selectedSupply.unit)} ${selectedSupply.unit}`
                  : `Konversi manual: isi berapa ${selectedSupply.unit} di dalam 1 ${form.purchaseUnit}`}
            </div>
          )}
          <datalist id="purchase-unit-suggestions">
            {Array.from(new Set([selectedSupply?.defaultPurchaseUnit ?? "", selectedSupply?.unit ?? "", ...COMMON_UNIT_SUGGESTIONS])).filter(Boolean).map((unit) => <option key={unit} value={unit} />)}
          </datalist>

          <Input
            placeholder="Nama supplier"
            value={form.supplierName}
            onChange={(e) => setForm({ ...form, supplierName: e.target.value })}
          />
          <Textarea
            placeholder="Catatan (opsional)"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />

          <div className="rounded-md bg-muted p-3 text-sm">
            <div>
              Total pembelian: <span className="font-semibold">{formatRupiah(totalCost)}</span>
            </div>
            {selectedSupply && (
              <>
                <div className="mt-1 text-muted-foreground">
                  Penambahan stok: <span className="font-semibold text-foreground">{Math.max(quantity, 0) * Math.max(baseUnitsPerPurchaseUnit, 0)} {selectedSupply.unit}</span>
                </div>
                <div className="mt-1 text-muted-foreground">
                  Stok setelah pembelian: <span className="font-semibold text-foreground">{selectedSupply.stockQuantity + Math.max(quantity, 0) * Math.max(baseUnitsPerPurchaseUnit, 0)} {selectedSupply.unit}</span>
                </div>
              </>
            )}
          </div>

          {formError && <p className="text-sm text-destructive">{formError}</p>}
          </div>
          <div className="shrink-0 border-t bg-background/95 px-4 py-4 backdrop-blur sm:px-6">
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                Batal
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting || !!formError}>
                Simpan pembelian
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
