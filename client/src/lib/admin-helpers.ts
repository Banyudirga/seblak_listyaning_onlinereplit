export const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'confirmed': return 'bg-blue-100 text-blue-800';
    case 'preparing': return 'bg-orange-100 text-orange-800';
    case 'ready': return 'bg-green-100 text-green-800';
    case 'delivered': return 'bg-gray-100 text-gray-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const getStatusText = (status: string) => {
  switch (status) {
    case 'pending': return 'Menunggu';
    case 'confirmed': return 'Dikonfirmasi';
    case 'preparing': return 'Sedang Dimasak';
    case 'ready': return 'Siap';
    case 'delivered': return 'Selesai';
    case 'cancelled': return 'Dibatalkan';
    default: return status;
  }
};

export const getPaymentMethodText = (method: string) => {
  switch (method) {
    case 'cash': return 'Tunai';
    case 'bank_transfer': return 'Transfer Bank';
    case 'gopay': return 'GoPay';
    case 'ovo': return 'OVO';
    case 'dana': return 'DANA';
    default: return method?.toUpperCase();
  }
};
