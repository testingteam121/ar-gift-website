export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  phone?: string;
  createdAt?: string;
}

export interface ProductImage {
  url: string;
  publicId: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: 'greeting-card' | 'photo-frame' | 'mug' | 'keychain' | 'led-frame';
  images: ProductImage[];
  features: string[];
  isActive: boolean;
  stock: number;
  inStock: boolean;
  ratings: {
    average: number;
    count: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Template {
  _id: string;
  name: string;
  category: 'birthday' | 'anniversary' | 'wedding' | 'love' | 'festival';
  imageUrl: string;
  publicId: string;
  thumbnailUrl: string;
  isActive: boolean;
  createdAt: string;
}

export interface PresetVideo {
  _id: string;
  name: string;
  category: 'birthday' | 'romantic' | 'wedding' | 'festival' | 'general';
  videoUrl: string;
  publicId: string;
  thumbnailUrl: string;
  duration?: number;
  isActive: boolean;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  customization: {
    uploadedImage?: {
      file?: File;
      preview?: string;
      url?: string;
      publicId?: string;
    };
    selectedTemplate?: Template;
    selectedVideo?: {
      url: string;
      publicId?: string;
      type: 'preset' | 'upload';
      presetVideo?: PresetVideo;
      file?: File;
      preview?: string;
    };
  };
}

export interface Address {
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface OrderCustomer {
  name: string;
  email: string;
  phone: string;
  address: Address;
}

export interface OrderProduct {
  productId: string | Product;
  name: string;
  price: number;
  quantity: number;
}

export type OrderStatus = 'pending' | 'processing' | 'printing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'razorpay' | 'cod';

export interface Order {
  _id: string;
  orderId: string;
  customer: OrderCustomer;
  product: OrderProduct;
  customization: {
    uploadedImage?: { url: string; publicId: string };
    selectedVideo?: {
      url: string;
      publicId?: string;
      type: 'preset' | 'upload';
      presetVideoId?: string | PresetVideo;
    };
    templateId?: string | Template;
  };
  payment: {
    method: PaymentMethod;
    status: PaymentStatus;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    amount: number;
    currency: string;
    paidAt?: string;
  };
  orderStatus: OrderStatus;
  arTarget?: {
    url?: string;
    publicId?: string;
    mindFileUrl?: string;
  };
  trackingNumber?: string;
  estimatedDelivery?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ARTarget {
  _id: string;
  orderId: string;
  orderIdString: string;
  imageUrl: string;
  videoUrl: string;
  targetFileUrl?: string;
  isActive: boolean;
  scanCount: number;
  lastScannedAt?: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  count: number;
  total: number;
  totalPages: number;
  currentPage: number;
  data: T[];
}

export type ProductCategory = 'all' | 'greeting-card' | 'photo-frame' | 'mug' | 'keychain' | 'led-frame';
export type TemplateCategory = 'all' | 'birthday' | 'anniversary' | 'wedding' | 'love' | 'festival';
export type VideoCategory = 'all' | 'birthday' | 'romantic' | 'wedding' | 'festival' | 'general';
