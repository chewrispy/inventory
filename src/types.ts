export type Category =
  | 'furniture'
  | 'appliance'
  | 'kitchen'
  | 'clothing'
  | 'book'
  | 'toy'
  | 'electronics'
  | 'bathroom'
  | 'food'
  | 'misc';

export const CATEGORY_LABEL: Record<Category, string> = {
  furniture: '가구',
  appliance: '가전',
  kitchen: '주방용품',
  clothing: '의류',
  book: '도서',
  toy: '취미/장난감',
  electronics: '전자기기',
  bathroom: '욕실용품',
  food: '식품',
  misc: '기타',
};

export type Condition = '새상품' | '거의새것' | '사용감있음' | '많이사용함';

export interface RoomDef {
  id: string;
  name: string;
  /** world-space footprint, min corner + size (free-form, not grid-locked) */
  x: number;
  z: number;
  width: number;
  depth: number;
  floorColor: string;
  accentColor: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: Category;
  roomId: string;
  /** normalized 0..1 position within the room footprint */
  position: { x: number; z: number };
  quantity: number;
  emoji: string;
  price?: number;
  condition?: Condition;
  purchasedAt?: string;
  memo?: string;
}

export interface CartEntry {
  itemId: string;
  qty: number;
  addedAt: string;
}
