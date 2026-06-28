import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SupplyForm } from "@/components/supplies/supplies-types";

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
  const formError =
    !form.name.trim()
      ? "Nama barang harus diisi"
      : !form.unit.trim()
        ? "Unit is required."
        : stockQuantity < 0 || lowStockThreshold < 0
          ? "Stock and threshold must be zero or greater."
          : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Tambahkan barang</DialogTitle>
          <DialogDescription>Upload gambar dari perangkat Anda atau isi link gambar bila sudah tersedia.</DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          <div className="rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground">
            Gunakan satuan stok terkecil untuk barang, misalnya `pcs`, `gram`, atau `ml`.
          </div>
          <div className="space-y-2">
            <Label>Nama barang</Label>
            <Input
              placeholder="Contoh: Kerupuk, Sosis, Cabai Bubuk"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Upload gambar barang</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setForm({ ...form, imageFile: e.target.files?.[0] ?? null })}
            />
            <p className="text-xs text-muted-foreground">Opsional. Pilih gambar dari perangkat Anda atau gunakan link di bawah.</p>
          </div>
          <div className="space-y-2">
            <Label>Atau link gambar</Label>
            <Input
              placeholder="https://contoh.com/gambar-barang.jpg"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value, imageFile: null })}
            />
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
              <Select value={form.unit} onValueChange={(value) => setForm({ ...form, unit: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih satuan stok" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pcs">pcs</SelectItem>
                  <SelectItem value="gram">gram</SelectItem>
                  <SelectItem value="ml">ml</SelectItem>
                </SelectContent>
              </Select>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Stok awal</Label>
              <Input
                type="number"
                placeholder="Contoh: 100"
                value={form.stockQuantity}
                onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Batas stok minimum</Label>
              <Input
                type="number"
                placeholder="Contoh: 20"
                value={form.lowStockThreshold}
                onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })}
              />
            </div>
          </div>
          <div className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
            Ringkasan: item ini mulai dengan <span className="font-semibold text-foreground">{stockQuantity}</span> {form.unit}
            {" "}dan akan diberi peringatan saat stok mencapai <span className="font-semibold text-foreground">{lowStockThreshold}</span> {form.unit}.
          </div>
          {formError && <p className="text-sm text-destructive">{formError}</p>}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button className="flex-1" disabled={isSubmitting || !!formError} onClick={() => onSubmit(form)}>
              Save Supply
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}