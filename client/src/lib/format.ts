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

export function formatPhoneNumberDisplay(phone: string): string {
  const international = formatPhoneNumber(phone);
  const digits = international.replace(/\D/g, "");

  if (digits.startsWith("62") && digits.length >= 12) {
    const localDigits = digits.slice(2);
    const parts = [
      `+62`,
      localDigits.slice(0, 3),
      localDigits.slice(3, 7),
      localDigits.slice(7),
    ].filter(Boolean);

    return parts.join(" ");
  }

  return international;
}
