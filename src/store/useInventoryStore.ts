import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import type { CartEntry, InventoryItem, RoomDef } from '../types';
import { SEED_ITEMS } from '../data/seedItems';
import { DEFAULT_ROOMS } from '../data/rooms';

interface InventoryState {
  rooms: RoomDef[];
  items: InventoryItem[];
  cart: CartEntry[];
  selectedItemId: string | null;
  isCartOpen: boolean;
  isAddModalOpen: boolean;
  isFloorPlanEditorOpen: boolean;

  selectItem: (id: string | null) => void;
  openCart: () => void;
  closeCart: () => void;
  openAddModal: () => void;
  closeAddModal: () => void;
  openFloorPlanEditor: () => void;
  closeFloorPlanEditor: () => void;

  setRooms: (rooms: RoomDef[]) => void;

  addItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateItem: (id: string, patch: Partial<InventoryItem>) => void;
  removeItem: (id: string) => void;

  addToCart: (itemId: string, qty?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQty: (itemId: string, qty: number) => void;
  clearCart: () => void;
}

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      rooms: DEFAULT_ROOMS,
      items: SEED_ITEMS,
      cart: [],
      selectedItemId: null,
      isCartOpen: false,
      isAddModalOpen: false,
      isFloorPlanEditorOpen: false,

      selectItem: (id) => set({ selectedItemId: id }),
      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
      openAddModal: () => set({ isAddModalOpen: true }),
      closeAddModal: () => set({ isAddModalOpen: false }),
      openFloorPlanEditor: () => set({ isFloorPlanEditorOpen: true }),
      closeFloorPlanEditor: () => set({ isFloorPlanEditorOpen: false }),

      setRooms: (rooms) => set({ rooms }),

      addItem: (item) =>
        set((state) => ({ items: [...state.items, { ...item, id: nanoid(8) }] })),

      updateItem: (id, patch) =>
        set((state) => ({
          items: state.items.map((it) => (it.id === id ? { ...it, ...patch } : it)),
        })),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((it) => it.id !== id),
          cart: state.cart.filter((c) => c.itemId !== id),
          selectedItemId: state.selectedItemId === id ? null : state.selectedItemId,
        })),

      addToCart: (itemId, qty = 1) => {
        const existing = get().cart.find((c) => c.itemId === itemId);
        if (existing) {
          set((state) => ({
            cart: state.cart.map((c) =>
              c.itemId === itemId ? { ...c, qty: c.qty + qty } : c,
            ),
          }));
        } else {
          set((state) => ({
            cart: [...state.cart, { itemId, qty, addedAt: new Date().toISOString() }],
          }));
        }
      },

      removeFromCart: (itemId) =>
        set((state) => ({ cart: state.cart.filter((c) => c.itemId !== itemId) })),

      updateCartQty: (itemId, qty) =>
        set((state) => ({
          cart: state.cart.map((c) => (c.itemId === itemId ? { ...c, qty: Math.max(1, qty) } : c)),
        })),

      clearCart: () => set({ cart: [] }),
    }),
    {
      name: 'pixel-home-inventory',
      partialize: (state) => ({ items: state.items, cart: state.cart, rooms: state.rooms }),
    },
  ),
);
