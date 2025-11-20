export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  fullName: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  category: Category;
}

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
}

export interface OrderItem {
  id: number;
  product: Product;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: number;
  code?: string; // New field
  orderDate: string;
  status: string;
  totalAmount: number;
  shippingAddress: string;
  items: OrderItem[];
}

export interface AuthResponse {
  token: string;
  role: string;
}
