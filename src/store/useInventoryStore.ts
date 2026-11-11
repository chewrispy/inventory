import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import type {
  InventoryItem,
  PlanBackground,
  Placement,
  Pt,
  Room,
  SellEntry,
  ShoppingEntry,
} from '../types';
import { HOME_ITEMS, HOME_ROOMS } from '../data/myHome';
import { guessByEmoji } from '../data/catalog';

export type ViewMode = '2d' | '3d';
export type PlanMode = 'arrange' | 'edit';
export type EditTool = 'select' | 'draw' | 'calibrate';

interface InventoryState {
  rooms: Room[];
  background: PlanBackground | null;
  items: InventoryItem[];
  sellBin: SellEntry[];
  shoppingList: ShoppingEntry[];

  view: ViewMode;
  planMode: PlanMode;
  editTool: EditTool;
  /** 평면도 화면 가운데 좌표 — 새 가구를 여기에 놓음 */
  viewCenter: Pt;
  lowWalls: boolean;

  selectedItemId: string | null;
  isDetailOpen: boolean;
  selectedRoomId: string | null;
  isListOpen: boolean;
  isSellBinOpen: boolean;
  isShoppingListOpen: boolean;
  isCatalogOpen: boolean;
  /** null이면 닫힘, 문자열이면 기본 위치(방/가구 id, ''=선택 안 함) */
  addStuffLocation: string | null;

  setView: (v: ViewMode) => void;
  setPlanMode: (m: PlanMode) => void;
  setEditTool: (t: EditTool) => void;
  setViewCenter: (p: Pt) => void;
  toggleLowWalls: () => void;

  selectItem: (id: string | null) => void;
  openDetail: (id: string) => void;
  closeDetail: () => void;
  selectRoom: (id: string | null) => void;
  openList: () => void;
  closeList: () => void;
  openSellBin: () => void;
  closeSellBin: () => void;
  openShoppingList: () => void;
  closeShoppingList: () => void;
  openCatalog: () => void;
  closeCatalog: () => void;
  openAddStuff: (locationId?: string) => void;
  closeAddStuff: () => void;

  addRoom: (room: Omit<Room, 'id'>) => string;
  updateRoom: (id: string, patch: Partial<Room>) => void;
  removeRoom: (id: string) => void;
  clearPlan: () => void;
  setBackground: (bg: PlanBackground | null) => void;
  updateBackground: (patch: Partial<PlanBackground>) => void;
  /** 치수 맞추기: 도면 전체(이미지·방·가구 위치)를 factor배로 */
  rescalePlan: (factor: number) => void;

  addItem: (item: Omit<InventoryItem, 'id'>) => string;
  updateItem: (id: string, patch: Partial<InventoryItem>) => void;
  updatePlacement: (id: string, patch: Partial<Placement>) => void;
  duplicateItem: (id: string) => void;
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

/** 예전 버전의 방 1칸 → cm (기본 방 6칸 ≈ 3.6m). 저장 데이터 복원이 스토어 생성 중에 일어나므로 위에 둬야 함 */
const UNIT_CM = 60;
/** 예전 샘플 집의 방 id — 이것뿐이면 보미네 집으로 교체 (v3) */
const SAMPLE_ROOM_IDS = new Set(['living', 'kitchen', 'bathroom', 'bedroom', 'study']);

/** localStorage가 꽉 차면(큰 도면 이미지) 앱이 죽지 않도록 */
const safeStorage: StateStorage = {
  getItem: (name) => localStorage.getItem(name),
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value);
    } catch {
      console.warn('저장 공간이 부족해요. 도면 이미지를 더 작은 것으로 바꿔주세요.');
    }
  },
  removeItem: (name) => localStorage.removeItem(name),
};

const upsertEntry = (list: SellEntry[], itemId: string, qty: number) =>
  list.some((c) => c.itemId === itemId)
    ? list.map((c) => (c.itemId === itemId ? { ...c, qty: c.qty + qty } : c))
    : [...list, { itemId, qty, addedAt: new Date().toISOString() }];

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      rooms: HOME_ROOMS,
      background: null,
      items: HOME_ITEMS,
      sellBin: [],
      shoppingList: [],

      view: '3d',
      planMode: 'arrange',
      editTool: 'select',
      viewCenter: { x: 400, y: 400 },
      lowWalls: false,

      selectedItemId: null,
      isDetailOpen: false,
      selectedRoomId: null,
      isListOpen: false,
      isSellBinOpen: false,
      isShoppingListOpen: false,
      isCatalogOpen: false,
      addStuffLocation: null,

      setView: (view) =>
        set({ view, selectedItemId: null, isDetailOpen: false, selectedRoomId: null }),
      setPlanMode: (planMode) =>
        set({ planMode, editTool: 'select', selectedItemId: null, selectedRoomId: null }),
      setEditTool: (editTool) => set({ editTool, selectedRoomId: null }),
      setViewCenter: (viewCenter) => set({ viewCenter }),
      toggleLowWalls: () => set((s) => ({ lowWalls: !s.lowWalls })),

      selectItem: (id) => set({ selectedItemId: id, isDetailOpen: false, selectedRoomId: null }),
      openDetail: (id) =>
        set({
          selectedItemId: id,
          isDetailOpen: true,
          isListOpen: false,
          selectedRoomId: null,
          isSellBinOpen: false,
          isShoppingListOpen: false,
        }),
      closeDetail: () => set({ isDetailOpen: false }),
      selectRoom: (id) => set({ selectedRoomId: id, selectedItemId: null, isDetailOpen: false }),
      openList: () => set({ isListOpen: true }),
      closeList: () => set({ isListOpen: false }),
      openSellBin: () => set({ isSellBinOpen: true, isShoppingListOpen: false }),
      closeSellBin: () => set({ isSellBinOpen: false }),
      openShoppingList: () => set({ isShoppingListOpen: true, isSellBinOpen: false }),
      closeShoppingList: () => set({ isShoppingListOpen: false }),
      openCatalog: () => set({ isCatalogOpen: true }),
      closeCatalog: () => set({ isCatalogOpen: false }),
      openAddStuff: (locationId = '') => set({ addStuffLocation: locationId }),
      closeAddStuff: () => set({ addStuffLocation: null }),

      addRoom: (room) => {
        const id = nanoid(6);
        set((s) => ({ rooms: [...s.rooms, { ...room, id }] }));
        return id;
      },
      updateRoom: (id, patch) =>
        set((s) => ({ rooms: s.rooms.map((r) => (r.id === id ? { ...r, ...patch } : r)) })),
      removeRoom: (id) =>
        set((s) => ({
          rooms: s.rooms.filter((r) => r.id !== id),
          items: s.items.map((it) => (it.locationId === id ? { ...it, locationId: undefined } : it)),
          selectedRoomId: null,
        })),
      clearPlan: () => set({ rooms: [], background: null, selectedRoomId: null }),
      setBackground: (background) => set({ background }),
      updateBackground: (patch) =>
        set((s) => (s.background ? { background: { ...s.background, ...patch } } : {})),
      rescalePlan: (f) =>
        set((s) => ({
          rooms: s.rooms.map((r) => ({
            ...r,
            points: r.points.map((p) => ({ x: Math.round(p.x * f), y: Math.round(p.y * f) })),
          })),
          background: s.background
            ? {
                ...s.background,
                cmPerPx: s.background.cmPerPx * f,
                x: s.background.x * f,
                y: s.background.y * f,
              }
            : null,
          items: s.items.map((it) =>
            it.placement
              ? { ...it, placement: { ...it.placement, x: it.placement.x * f, y: it.placement.y * f } }
              : it,
          ),
        })),

      addItem: (item) => {
        const id = nanoid(8);
        set((s) => ({ items: [...s.items, { ...item, id }] }));
        return id;
      },
      updateItem: (id, patch) =>
        set((s) => ({ items: s.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) })),
      updatePlacement: (id, patch) =>
        set((s) => ({
          items: s.items.map((it) =>
            it.id === id && it.placement ? { ...it, placement: { ...it.placement, ...patch } } : it,
          ),
        })),
      duplicateItem: (id) => {
        const src = get().items.find((it) => it.id === id);
        if (!src) return;
        const newId = nanoid(8);
        const copy: InventoryItem = {
          ...src,
          id: newId,
          placement: src.placement
            ? { ...src.placement, x: src.placement.x + 30, y: src.placement.y + 30 }
            : undefined,
        };
        set((s) => ({ items: [...s.items, copy], selectedItemId: newId }));
      },
      removeItem: (id) =>
        set((s) => ({
          // 가구를 지우면 안에 있던 물건은 위치 미정으로
          items: s.items
            .filter((it) => it.id !== id)
            .map((it) => (it.locationId === id ? { ...it, locationId: undefined } : it)),
          sellBin: s.sellBin.filter((c) => c.itemId !== id),
          shoppingList: s.shoppingList.filter((c) => c.itemId !== id),
          selectedItemId: s.selectedItemId === id ? null : s.selectedItemId,
        })),

      addToSellBin: (itemId, qty = 1) => set((s) => ({ sellBin: upsertEntry(s.sellBin, itemId, qty) })),
      removeFromSellBin: (itemId) =>
        set((s) => ({ sellBin: s.sellBin.filter((c) => c.itemId !== itemId) })),
      updateSellBinQty: (itemId, qty) =>
        set((s) => ({
          sellBin: s.sellBin.map((c) => (c.itemId === itemId ? { ...c, qty: Math.max(1, qty) } : c)),
        })),
      clearSellBin: () => set({ sellBin: [] }),

      addToShoppingList: (itemId, qty = 1) =>
        set((s) => ({ shoppingList: upsertEntry(s.shoppingList, itemId, qty) })),
      removeFromShoppingList: (itemId) =>
        set((s) => ({ shoppingList: s.shoppingList.filter((c) => c.itemId !== itemId) })),
      updateShoppingQty: (itemId, qty) =>
        set((s) => ({
          shoppingList: s.shoppingList.map((c) =>
            c.itemId === itemId ? { ...c, qty: Math.max(1, qty) } : c,
          ),
        })),
      markPurchased: (itemId) => {
        const entry = get().shoppingList.find((c) => c.itemId === itemId);
        if (!entry) return;
        set((s) => ({
          items: s.items.map((it) =>
            it.id === itemId ? { ...it, quantity: it.quantity + entry.qty } : it,
          ),
          shoppingList: s.shoppingList.filter((c) => c.itemId !== itemId),
        }));
      },
      clearShoppingList: () => set({ shoppingList: [] }),
    }),
    {
      name: 'home-inventory',
      version: 3,
      storage: createJSONStorage(() => safeStorage),
      onRehydrateStorage: () => (_state, error) => {
        if (error) console.error('저장된 데이터를 불러오지 못했어요', error);
      },
      partialize: (s) => ({
        rooms: s.rooms,
        background: s.background,
        items: s.items,
        sellBin: s.sellBin,
        shoppingList: s.shoppingList,
        lowWalls: s.lowWalls,
      }),
      migrate: (persisted, version) => {
        let s = version < 2 ? migrateV1(persisted) : persisted;
        if (version < 3) s = replaceSampleHome(s);
        return s as never;
      },
    },
  ),
);

/* ---------- 예전(사각형 방 + 방 안 상대 위치) 데이터 이전 ---------- */

interface OldRoom {
  id: string;
  name: string;
  x: number;
  z: number;
  width: number;
  depth: number;
  floorColor: string;
}
interface OldItem extends Omit<InventoryItem, 'placement' | 'locationId'> {
  roomId?: string;
  position?: { x: number; z: number };
}

function migrateV1(old: unknown) {
  const o = (old ?? {}) as {
    rooms?: OldRoom[];
    items?: OldItem[];
    sellBin?: SellEntry[];
    shoppingList?: ShoppingEntry[];
  };
  const oldRooms = o.rooms ?? [];
  const rooms: Room[] = oldRooms.map((r) => {
    const x1 = Math.round(r.x * UNIT_CM);
    const y1 = Math.round(r.z * UNIT_CM);
    const x2 = Math.round((r.x + r.width) * UNIT_CM);
    const y2 = Math.round((r.z + r.depth) * UNIT_CM);
    return {
      id: r.id,
      name: r.name,
      color: r.floorColor,
      points: [
        { x: x1, y: y1 },
        { x: x2, y: y1 },
        { x: x2, y: y2 },
        { x: x1, y: y2 },
      ],
    };
  });

  const items: InventoryItem[] = (o.items ?? []).map((it) => {
    const { roomId, position, ...rest } = it;
    const room = oldRooms.find((r) => r.id === roomId);
    const isBig = it.category === 'furniture' || it.category === 'appliance';
    if (room && isBig) {
      const guess = guessByEmoji(it.emoji);
      const fx = 0.16 + (position?.x ?? 0.5) * 0.68;
      const fz = 0.16 + (position?.z ?? 0.5) * 0.68;
      return {
        ...rest,
        color: guess?.color ?? '#efe3d3',
        placement: {
          x: Math.round((room.x + fx * room.width) * UNIT_CM),
          y: Math.round((room.z + fz * room.depth) * UNIT_CM),
          w: guess?.w ?? 80,
          d: guess?.d ?? 60,
          h: guess?.h ?? 80,
          z: guess?.z,
          rot: 0,
        },
      };
    }
    return { ...rest, locationId: room ? room.id : undefined };
  });

  return {
    rooms: o.rooms ? rooms : HOME_ROOMS,
    background: null,
    items: o.items ? items : HOME_ITEMS,
    sellBin: o.sellBin ?? [],
    shoppingList: o.shoppingList ?? [],
    lowWalls: false,
  };
}

/* ---------- v3: 샘플 집이면 보미네 집으로 바꾸기 (직접 추가한 물건은 유지) ---------- */

function replaceSampleHome(state: unknown) {
  const s = (state ?? {}) as {
    rooms?: Room[];
    items?: InventoryItem[];
    sellBin?: SellEntry[];
    shoppingList?: ShoppingEntry[];
  };
  const rooms = s.rooms ?? [];
  const isSample = rooms.length === 0 || rooms.every((r) => SAMPLE_ROOM_IDS.has(r.id));
  if (!isSample) return state;

  const roomIds = new Set(HOME_ROOMS.map((r) => r.id));
  const mine = (s.items ?? []).filter((it) => !it.id.startsWith('seed-'));
  const mineIds = new Set(mine.map((it) => it.id));
  const kept = mine
    // 예전 샘플 가구는 새 도면 위치와 안 맞아서 빼고, 직접 넣은 작은 물건은 유지
    .filter((it) => !it.placement)
    .map((it) =>
      it.locationId && !roomIds.has(it.locationId) && !mineIds.has(it.locationId)
        ? { ...it, locationId: undefined }
        : it,
    );
  const items = [...HOME_ITEMS, ...kept];
  const ids = new Set(items.map((it) => it.id));
  return {
    ...s,
    rooms: HOME_ROOMS,
    background: null,
    items,
    sellBin: (s.sellBin ?? []).filter((c) => ids.has(c.itemId)),
    shoppingList: (s.shoppingList ?? []).filter((c) => ids.has(c.itemId)),
  };
}

/** 물건이 어디 있는지 사람이 읽는 문자열 */
export function describeLocation(item: InventoryItem, items: InventoryItem[], rooms: Room[]) {
  if (!item.locationId) return '위치 미정';
  const room = rooms.find((r) => r.id === item.locationId);
  if (room) return room.name;
  const parent = items.find((p) => p.id === item.locationId);
  return parent ? `${parent.emoji} ${parent.name} 안` : '위치 미정';
}
