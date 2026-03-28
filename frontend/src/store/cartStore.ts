import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem, Product, Template, PresetVideo } from '@/types';

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem: CartItem) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.product._id === newItem.product._id
          );

          if (existingIndex >= 0) {
            // Update existing item
            const updatedItems = [...state.items];
            updatedItems[existingIndex] = {
              ...updatedItems[existingIndex],
              quantity: updatedItems[existingIndex].quantity + newItem.quantity,
              customization: newItem.customization,
            };
            return { items: updatedItems };
          }

          return { items: [...state.items, newItem] };
        });
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.product._id !== productId),
        }));
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.product._id === productId ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        return get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') return localStorage;
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({
        items: state.items.map((item) => ({
          ...item,
          customization: {
            ...item.customization,
            uploadedImage: item.customization.uploadedImage
              ? {
                  url: item.customization.uploadedImage.url,
                  publicId: item.customization.uploadedImage.publicId,
                  preview: item.customization.uploadedImage.preview,
                }
              : undefined,
            selectedVideo: item.customization.selectedVideo
              ? {
                  url: item.customization.selectedVideo.url,
                  publicId: item.customization.selectedVideo.publicId,
                  type: item.customization.selectedVideo.type,
                  presetVideo: item.customization.selectedVideo.presetVideo,
                  preview: item.customization.selectedVideo.preview,
                }
              : undefined,
          },
        })),
      }),
    }
  )
);
