export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  priceCents: number;
  emoji: string;
  displayOrder: number;
  active?: boolean;
  isVegetarian?: boolean;
  imageUrl?: string;
}

export interface MenuResponse {
  products: Product[];
  taxRate: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'manager' | 'admin';
  username?: string;
  mustChangePassword?: boolean;
}

export interface CustomerAddress {
  id: string;
  label: 'Home' | 'Work' | 'Other';
  recipientName: string;
  phone: string;
  house: string;
  locality: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  instructions: string;
  isDefault: boolean;
  formatted: string;
}

export interface CartItems {
  [productId: string]: number;
}

export interface OrderResponse {
  message: string;
  order: {
    id: string;
    trackingToken: string;
    items: Array<{ productId: string; name: string; quantity: number; priceCents: number }>;
    subtotalCents: number;
    taxCents: number;
    deliveryFeeCents: number;
    totalCents: number;
    status: string;
    paymentStatus: string;
    paymentMethod: PaymentMethod;
    currency: string;
  };
  payment?: {
    provider: 'razorpay';
    keyId: string;
    gatewayOrderId: string;
    amount: number;
    currency: string;
  } | {
    provider: 'demo';
    demoPaymentToken: string;
    amount: number;
    currency: string;
  };
}

export interface DeliveryPaymentConfig {
  onlinePaymentsEnabled: boolean;
  mode: 'razorpay' | 'demo' | null;
  keyId: string | null;
  currency: string;
  deliveryFeeCents: number;
}

export type PaymentMethod = 'cash_on_delivery' | 'razorpay' | 'demo_online';
