'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Order item structure
export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  imageUrl?: string;
}

// Order structure
export interface Order {
  id: string;
  orderNumber: string;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  items: OrderItem[];
  totals: {
    subtotal: number;
    shipping: number;
    discount: number;
    total: number;
  };
  shippingAddress?: {
    firstName: string;
    lastName: string;
    address1: string;
    city: string;
    phone: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface OrdersState {
  orders: Order[];
  isLoading: boolean;

  // Actions
  createOrder: (orderData: {
    items: Array<{
      id: string;
      productId: string;
      productName: string;
      variantId?: string;
      variantName?: string;
      quantity: number;
      unitPrice: number;
      imageUrl?: string;
    }>;
    subtotal: number;
  }) => Order;
  getOrders: () => Order[];
  getOrder: (orderId: string) => Order | undefined;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  clearOrders: () => void;
}

// Generate unique order number
const generateOrderNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `MOS-${year}${month}-${random}`;
};

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 15);

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: [],
      isLoading: false,

      createOrder: (orderData) => {
        const now = new Date().toISOString();

        const newOrder: Order = {
          id: generateId(),
          orderNumber: generateOrderNumber(),
          status: 'PENDING',
          items: orderData.items.map(item => ({
            id: item.id,
            productId: item.productId,
            productName: item.productName,
            variantId: item.variantId,
            variantName: item.variantName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            imageUrl: item.imageUrl,
          })),
          totals: {
            subtotal: orderData.subtotal,
            shipping: 0, // Free shipping for now
            discount: 0,
            total: orderData.subtotal,
          },
          createdAt: now,
          updatedAt: now,
        };

        set(state => ({
          orders: [newOrder, ...state.orders],
        }));

        return newOrder;
      },

      getOrders: () => {
        return get().orders;
      },

      getOrder: (orderId: string) => {
        return get().orders.find(order => order.id === orderId);
      },

      updateOrderStatus: (orderId: string, status: Order['status']) => {
        set(state => ({
          orders: state.orders.map(order =>
            order.id === orderId
              ? { ...order, status, updatedAt: new Date().toISOString() }
              : order
          ),
        }));
      },

      clearOrders: () => {
        set({ orders: [] });
      },
    }),
    {
      name: 'moshayov-orders',
    }
  )
);
