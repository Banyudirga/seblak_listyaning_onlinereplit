export function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

export function formatPhoneNumber(phone: string): string {
  // Remove non-digits and ensure it starts with +62
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('08')) {
    return `+62${cleaned.substring(1)}`;
  }
  if (cleaned.startsWith('62')) {
    return `+${cleaned}`;
  }
  return `+62${cleaned}`;
}
