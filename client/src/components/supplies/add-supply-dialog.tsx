import { type FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SupplyForm } from "@/components/supplies/supplies-types";
import { COMMON_UNIT_SUGGESTIONS } from "@/components/supplies/supplies-types";

type AddSupplyDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (form: SupplyForm) => void;
  isSubmitting: boolean;
};

export function AddSupplyDialog({
  open,
  onClose,
  onSubmit,
  isSubmitting,
}: AddSupplyDialogProps) {
  const [form, setForm] = useState<SupplyForm>({
    name: "",
    imageUrl: "",
    imageFile: null,
    unit: "pcs",
    defaultPurchaseUnit: "box",
    defaultBaseUnitsPerPurchaseUnit: "1",
    stockQuantity: "",
    lowStockThreshold: "",
    supplierName: "",
  });
  const [localPreviewUrl, setLocalPreviewUrl] = useState("");

  useEffect(() => {
    if (open) {
      setForm({
        name: "",
        imageUrl: "",
        imageFile: null,
        unit: "pcs",
        defaultPurchaseUnit: "box",
        defaultBaseUnitsPerPurchaseUnit: "1",
        stockQuantity: "",
        lowStockThreshold: "",
        supplierName: "",
      });
    }
  }, [open]);

  useEffect(() => {
    if (!form.imageFile) {
      setLocalPreviewUrl("");
      return;
    }
    const objectUrl = URL.createObjectURL(form.imageFile);
    setLocalPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [form.imageFile]);

  const stockQuantity = Number(form.stockQuantity || 0);
  const imagePreviewUrl = localPreviewUrl || form.imageUrl.trim();
  const lowStockThreshold = Number(form.lowStockThreshold || 0);
  const defaultConversion = Number(form.defaultBaseUnitsPerPurchaseUnit || 0);
  const selectedFileName = form.imageFile?.name ?? "Belum ada file dipilih";
  const formError =
    !form.name.trim()
      ? "Nama barang harus diisi"
      : !form.unit.trim()
        ? "Satuan stok wajib diisi."
        : !form.defaultPurchaseUnit.trim()
          ? "Satuan beli default wajib diisi."
          : defaultConversion <= 0
            ? "Nilai konversi default harus lebih dari 0."
            : stockQuantity < 0 || lowStockThreshold < 0
              ? "Stok dan batas minimum harus bernilai 0 atau lebih."
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
          <DialogTitle>Tambahkan barang</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6">
          <div className="space-y-2">
            <Label>Nama barang</Label>
            <Input
              placeholder="Contoh: Kerupuk, Sosis, Cabai Bubuk"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="supply-image-file">Upload gambar atau isikan link gambar barang</Label>
            <Input
              id="supply-image-file"
              className="sr-only"
              type="file"
              accept="image/*"
              onChange={(e) => setForm({ ...form, imageFile: e.target.files?.[0] ?? null, imageUrl: "" })}
            />
            <div className="flex items-stretch">
              <label
                htmlFor="supply-image-file"
                className="inline-flex h-10 shrink-0 cursor-pointer items-center justify-center rounded-l-md border border-r-0 border-input bg-background px-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {form.imageFile ? "Ganti file" : "Pilih file"}
              </label>
              <Input
                id="supply-image-url"
                className="rounded-l-none"
                placeholder="https://contoh.com/gambar-barang.jpg"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value, imageFile: null })}
              />
            </div>
            <p className="truncate text-xs text-muted-foreground">{selectedFileName}</p>
          </div>
          {imagePreviewUrl && (
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="mb-2 text-xs text-muted-foreground">Preview gambar</p>
              <img src={imagePreviewUrl} alt={form.name || "Preview barang"} className="h-32 w-full rounded-md bg-muted object-cover" />
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Satuan stok</Label>
              <Input list="supply-unit-suggestions" placeholder="Contoh: pcs, gram, ml, lembar, butir" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Supplier default</Label>
              <Input
                placeholder="Contoh: Toko Sembako Jaya"
                value={form.supplierName}
                onChange={(e) => setForm({ ...form, supplierName: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Satuan beli default</Label>
              <Input list="supply-unit-suggestions" placeholder="Contoh: box, bungkus, pack" value={form.defaultPurchaseUnit} onChange={(e) => setForm({ ...form, defaultPurchaseUnit: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Nilai konversi default</Label>
              <Input type="number" inputMode="numeric" placeholder={`Berapa ${form.unit || "satuan stok"} dalam 1 ${form.defaultPurchaseUnit || "satuan beli"}`} value={form.defaultBaseUnitsPerPurchaseUnit} onChange={(e) => setForm({ ...form, defaultBaseUnitsPerPurchaseUnit: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Stok awal</Label>
              <Input
                type="number"
                inputMode="numeric"
                placeholder="Contoh: 100"
                value={form.stockQuantity}
                onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Batas stok minimum</Label>
              <Input
                type="number"
                inputMode="numeric"
                placeholder="Contoh: 20"
                value={form.lowStockThreshold}
                onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })}
              />
            </div>
          </div>
          <datalist id="supply-unit-suggestions">
            {COMMON_UNIT_SUGGESTIONS.map((unit) => <option key={unit} value={unit} />)}
          </datalist>
          <div className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
            Ringkasan: item ini mulai dengan <span className="font-semibold text-foreground">{stockQuantity}</span> {form.unit}, memakai default pembelian <span className="font-semibold text-foreground">1 {form.defaultPurchaseUnit}</span> = <span className="font-semibold text-foreground">{defaultConversion || 0} {form.unit}</span>, dan akan diberi peringatan saat stok mencapai <span className="font-semibold text-foreground">{lowStockThreshold}</span> {form.unit}.
          </div>
          </div>
          <div className="shrink-0 border-t bg-background/95 px-4 py-4 backdrop-blur sm:px-6">
            {formError && <p className="mb-3 text-sm text-destructive">{formError}</p>}
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                Batal
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting || !!formError}>
                {isSubmitting ? "Menyimpan..." : "Simpan barang"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
