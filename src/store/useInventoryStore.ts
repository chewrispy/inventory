import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import type { InventoryItem, RoomDef, SellEntry, ShoppingEntry } from '../types';
import { SEED_ITEMS } from '../data/seedItems';
import { DEFAULT_ROOMS } from '../data/rooms';

interface InventoryState {
  rooms: RoomDef[];
  items: InventoryItem[];
  /** 당근마켓에 내놓을 물건들 (판매함) */
  sellBin: SellEntry[];
  /** 다 써서 다시 사야 할 물건들 (장바구니) */
  shoppingList: ShoppingEntry[];
  selectedItemId: string | null;
  isSellBinOpen: boolean;
  isShoppingListOpen: boolean;
  isAddModalOpen: boolean;
  isFloorPlanEditorOpen: boolean;

  selectItem: (id: string | null) => void;
  openSellBin: () => void;
  closeSellBin: () => void;
  openShoppingList: () => void;
  closeShoppingList: () => void;
  openAddModal: () => void;
  closeAddModal: () => void;
  openFloorPlanEditor: () => void;
  closeFloorPlanEditor: () => void;

  setRooms: (rooms: RoomDef[]) => void;

  addItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateItem: (id: string, patch: Partial<InventoryItem>) => void;
  removeItem: (id: string) => void;

  addToSellBin: (itemId: string, qty?: number) => void;
  removeFromSellBin: (itemId: string) => void;
  updateSellBinQty: (itemId: string, qty: number) => void;
  clearSellBin: () => void;

  addToShoppingList: (itemId: string, qty?: number) => void;
  removeFromShoppingList: (itemId: string) => void;
  updateShoppingQty: (itemId: string, qty: number) => void;
  markPurchased: (itemId: string) => void;
  clearShoppingList: () => void;
}

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      rooms: DEFAULT_ROOMS,
      items: SEED_ITEMS,
      sellBin: [],
      shoppingList: [],
      selectedItemId: null,
      isSellBinOpen: false,
      isShoppingListOpen: false,
      isAddModalOpen: false,
      isFloorPlanEditorOpen: false,

      selectItem: (id) => set({ selectedItemId: id }),
      openSellBin: () => set({ isSellBinOpen: true }),
      closeSellBin: () => set({ isSellBinOpen: false }),
      openShoppingList: () => set({ isShoppingListOpen: true }),
      closeShoppingList: () => set({ isShoppingListOpen: false }),
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
          sellBin: state.sellBin.filter((c) => c.itemId !== id),
          shoppingList: state.shoppingList.filter((c) => c.itemId !== id),
          selectedItemId: state.selectedItemId === id ? null : state.selectedItemId,
        })),

      addToSellBin: (itemId, qty = 1) => {
        const existing = get().sellBin.find((c) => c.itemId === itemId);
        if (existing) {
          set((state) => ({
            sellBin: state.sellBin.map((c) =>
              c.itemId === itemId ? { ...c, qty: c.qty + qty } : c,
            ),
          }));
        } else {
          set((state) => ({
            sellBin: [...state.sellBin, { itemId, qty, addedAt: new Date().toISOString() }],
          }));
        }
      },

      removeFromSellBin: (itemId) =>
        set((state) => ({ sellBin: state.sellBin.filter((c) => c.itemId !== itemId) })),

      updateSellBinQty: (itemId, qty) =>
        set((state) => ({
          sellBin: state.sellBin.map((c) =>
            c.itemId === itemId ? { ...c, qty: Math.max(1, qty) } : c,
          ),
        })),

      clearSellBin: () => set({ sellBin: [] }),

      addToShoppingList: (itemId, qty = 1) => {
        const existing = get().shoppingList.find((c) => c.itemId === itemId);
        if (existing) {
          set((state) => ({
            shoppingList: state.shoppingList.map((c) =>
              c.itemId === itemId ? { ...c, qty: c.qty + qty } : c,
            ),
          }));
        } else {
          set((state) => ({
            shoppingList: [
              ...state.shoppingList,
              { itemId, qty, addedAt: new Date().toISOString() },
            ],
          }));
        }
      },

      removeFromShoppingList: (itemId) =>
        set((state) => ({
          shoppingList: state.shoppingList.filter((c) => c.itemId !== itemId),
        })),

      updateShoppingQty: (itemId, qty) =>
        set((state) => ({
          shoppingList: state.shoppingList.map((c) =>
            c.itemId === itemId ? { ...c, qty: Math.max(1, qty) } : c,
          ),
        })),

      markPurchased: (itemId) => {
        const entry = get().shoppingList.find((c) => c.itemId === itemId);
        if (!entry) return;
        set((state) => ({
          items: state.items.map((it) =>
            it.id === itemId ? { ...it, quantity: it.quantity + entry.qty } : it,
          ),
          shoppingList: state.shoppingList.filter((c) => c.itemId !== itemId),
        }));
      },

      clearShoppingList: () => set({ shoppingList: [] }),
    }),
    {
      name: 'home-inventory',
      partialize: (state) => ({
        items: state.items,
        sellBin: state.sellBin,
        shoppingList: state.shoppingList,
        rooms: state.rooms,
      }),
    },
  ),
);
