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
  | 'iot'
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
  iot: 'IoT 기기',
  misc: '기타',
};

export type Condition = '새상품' | '거의새것' | '사용감있음' | '많이사용함';

/** 평면도 좌표. 단위는 cm, y는 화면 아래쪽이 +. */
export interface Pt {
  x: number;
  y: number;
}

/** 다각형으로 그린 방. 방의 테두리가 곧 벽이 된다. */
export interface Room {
  id: string;
  name: string;
  points: Pt[];
  color: string;
  /** 벽 없이 트인 변의 번호 (points[i] → points[i+1]). 예: 거실↔주방 */
  open?: number[];
  /** 드레스룸이면 들어갔을 때 옷장 관리 화면 */
  kind?: 'dressroom';
}

/** 도면 참고 이미지 */
export interface PlanBackground {
  dataUrl: string;
  naturalWidth: number;
  naturalHeight: number;
  /** 이미지 1px이 몇 cm인지 (치수 맞추기로 보정) */
  cmPerPx: number;
  /** 이미지 왼쪽 위 모서리의 평면도 좌표(cm) */
  x: number;
  y: number;
  opacity: number;
}

/** 가구·가전의 실제 배치. 중심 좌표 + 실제 크기(cm) */
export interface Placement {
  x: number;
  y: number;
  /** 가로 */
  w: number;
  /** 깊이 */
  d: number;
  /** 높이 */
  h: number;
  /** 바닥에서 띄운 높이 (벽걸이 TV, 에어컨 등) */
  z?: number;
  /** 회전(도), 시계 방향 */
  rot: number;
  /** 원형(원형 식탁 등). 없으면 사각형 */
  shape?: 'round';
}

export interface InventoryItem {
  id: string;
  name: string;
  category: Category;
  quantity: number;
  emoji: string;
  price?: number;
  condition?: Condition;
  purchasedAt?: string;
  memo?: string;
  /** 있으면 평면도에 놓이는 가구·가전 */
  placement?: Placement;
  color?: string;
  /** 작은 물건: 들어있는 가구 id 또는 방 id */
  locationId?: string;
  /** IoT 기기: 연결 앱 (SmartThings, ThinQ, Google Home 등) */
  iotApp?: string;
  /** 옷이면 옷장 정보 */
  clothing?: ClothingInfo;
}

export const CLOTH_TYPES = ['상의', '하의', '아우터', '원피스', '신발', '가방', '액세서리', '기타'] as const;
export type ClothType = (typeof CLOTH_TYPES)[number];
export const SEASONS = ['봄', '여름', '가을', '겨울'] as const;
export type Season = (typeof SEASONS)[number];

export const CLOTH_EMOJI: Record<ClothType, string> = {
  상의: '👕',
  하의: '👖',
  아우터: '🧥',
  원피스: '👗',
  신발: '👟',
  가방: '👜',
  액세서리: '💍',
  기타: '🧦',
};

export interface ClothingInfo {
  type: ClothType;
  seasons: Season[];
  /** 색 이름 (CLOTH_COLORS의 key) */
  color?: string;
  brand?: string;
  size?: string;
  /** 작게 줄인 사진 dataURL (직접 찍은 사진) */
  photo?: string;
  /** 브랜드 사이트 상품 이미지 주소 */
  imageUrl?: string;
  /** 상품 페이지 링크 */
  link?: string;
}

/** an item marked to sell/declutter on 당근마켓 */
export interface SellEntry {
  itemId: string;
  qty: number;
  addedAt: string;
}

/** an item that ran out and needs to be repurchased */
export interface ShoppingEntry {
  itemId: string;
  qty: number;
  addedAt: string;
}

export const IOT_APPS = ['SmartThings', 'LG ThinQ', 'Google Home', 'Apple 홈', 'Tapo', '헤이홈', '기타'] as const;
