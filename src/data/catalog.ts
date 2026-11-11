import type { Category } from '../types';

export interface CatalogEntry {
  key: string;
  name: string;
  emoji: string;
  category: Category;
  w: number;
  d: number;
  h: number;
  z?: number;
  color: string;
}

export type CatalogGroup = '가구' | '가전' | 'IoT' | '문·창문';

export const CATALOG: Record<CatalogGroup, CatalogEntry[]> = {
  가구: [
    { key: 'bed-s', name: '싱글 침대', emoji: '🛏️', category: 'furniture', w: 100, d: 200, h: 45, color: '#f6d6c8' },
    { key: 'bed-q', name: '퀸 침대', emoji: '🛏️', category: 'furniture', w: 160, d: 200, h: 45, color: '#f6d6c8' },
    { key: 'bed-k', name: '킹 침대', emoji: '🛏️', category: 'furniture', w: 180, d: 200, h: 45, color: '#f6d6c8' },
    { key: 'sofa-2', name: '2인 소파', emoji: '🛋️', category: 'furniture', w: 160, d: 85, h: 80, color: '#cfd8f2' },
    { key: 'sofa-3', name: '3인 소파', emoji: '🛋️', category: 'furniture', w: 220, d: 90, h: 80, color: '#cfd8f2' },
    { key: 'chair', name: '의자', emoji: '🪑', category: 'furniture', w: 50, d: 50, h: 80, color: '#e8d2b0' },
    { key: 'table-4', name: '4인 식탁', emoji: '🍽️', category: 'furniture', w: 140, d: 80, h: 75, color: '#e8d2b0' },
    { key: 'desk', name: '책상', emoji: '✏️', category: 'furniture', w: 120, d: 60, h: 73, color: '#e8d2b0' },
    { key: 'wardrobe', name: '옷장', emoji: '👚', category: 'furniture', w: 120, d: 60, h: 200, color: '#efe3d3' },
    { key: 'drawer', name: '서랍장', emoji: '🗃️', category: 'furniture', w: 80, d: 45, h: 90, color: '#efe3d3' },
    { key: 'bookshelf', name: '책장', emoji: '📚', category: 'furniture', w: 80, d: 30, h: 180, color: '#e8d2b0' },
    { key: 'tvstand', name: 'TV장', emoji: '🗄️', category: 'furniture', w: 180, d: 45, h: 45, color: '#efe3d3' },
    { key: 'cabinet', name: '수납장', emoji: '🗄️', category: 'furniture', w: 80, d: 40, h: 90, color: '#efe3d3' },
    { key: 'vanity', name: '화장대', emoji: '💄', category: 'furniture', w: 80, d: 40, h: 75, color: '#f6e1ea' },
    { key: 'hanger', name: '행거', emoji: '👕', category: 'furniture', w: 120, d: 50, h: 170, color: '#e4e4ea' },
    { key: 'rug', name: '러그', emoji: '🟫', category: 'furniture', w: 160, d: 230, h: 1, color: '#f3e2c4' },
    { key: 'plant', name: '화분', emoji: '🪴', category: 'misc', w: 40, d: 40, h: 100, color: '#cfe9c5' },
  ],
  가전: [
    { key: 'tv', name: 'TV 55인치', emoji: '📺', category: 'electronics', w: 124, d: 8, h: 72, z: 45, color: '#4a4a55' },
    { key: 'fridge', name: '양문형 냉장고', emoji: '🧊', category: 'appliance', w: 91, d: 92, h: 180, color: '#e9eef2' },
    { key: 'kimchi', name: '김치냉장고', emoji: '🥬', category: 'appliance', w: 80, d: 80, h: 100, color: '#e9eef2' },
    { key: 'washer', name: '세탁기', emoji: '🌀', category: 'appliance', w: 60, d: 70, h: 85, color: '#f1f3f6' },
    { key: 'dryer', name: '건조기', emoji: '♨️', category: 'appliance', w: 60, d: 70, h: 85, color: '#f1f3f6' },
    { key: 'ac-stand', name: '스탠드 에어컨', emoji: '❄️', category: 'appliance', w: 40, d: 40, h: 180, color: '#f7f9fb' },
    { key: 'ac-wall', name: '벽걸이 에어컨', emoji: '❄️', category: 'appliance', w: 90, d: 25, h: 30, z: 200, color: '#f7f9fb' },
    { key: 'dishwasher', name: '식기세척기', emoji: '🫧', category: 'appliance', w: 60, d: 60, h: 85, color: '#e9eef2' },
    { key: 'microwave', name: '전자레인지', emoji: '🍱', category: 'appliance', w: 50, d: 40, h: 30, color: '#e4e4ea' },
    { key: 'purifier', name: '공기청정기', emoji: '🌬️', category: 'appliance', w: 40, d: 40, h: 70, color: '#f7f9fb' },
    { key: 'water', name: '정수기', emoji: '🚰', category: 'appliance', w: 30, d: 50, h: 50, color: '#f7f9fb' },
    { key: 'styler', name: '의류관리기', emoji: '👔', category: 'appliance', w: 45, d: 60, h: 185, color: '#e4e4ea' },
    { key: 'robot', name: '로봇청소기', emoji: '🤖', category: 'appliance', w: 35, d: 35, h: 10, color: '#d9dce3' },
    { key: 'pc', name: '컴퓨터·모니터', emoji: '💻', category: 'electronics', w: 60, d: 25, h: 45, color: '#4a4a55' },
  ],
  IoT: [
    { key: 'cam', name: '홈카메라', emoji: '📷', category: 'iot', w: 10, d: 10, h: 12, z: 80, color: '#dff3ff' },
    { key: 'plug', name: '스마트플러그', emoji: '🔌', category: 'iot', w: 6, d: 6, h: 6, z: 30, color: '#dff3ff' },
    { key: 'nesthub', name: '구글 홈 허브', emoji: '🖼️', category: 'iot', w: 18, d: 7, h: 12, z: 75, color: '#dff3ff' },
    { key: 'speaker', name: 'AI 스피커', emoji: '🔊', category: 'iot', w: 10, d: 10, h: 10, z: 75, color: '#dff3ff' },
    { key: 'bulb', name: '스마트 전구', emoji: '💡', category: 'iot', w: 8, d: 8, h: 10, z: 230, color: '#fff6c8' },
    { key: 'switch', name: '스마트 스위치', emoji: '🎚️', category: 'iot', w: 8, d: 3, h: 12, z: 120, color: '#dff3ff' },
    { key: 'lock', name: '도어락', emoji: '🔐', category: 'iot', w: 8, d: 8, h: 30, z: 90, color: '#dff3ff' },
    { key: 'motion', name: '모션 센서', emoji: '👁️', category: 'iot', w: 5, d: 5, h: 5, z: 200, color: '#dff3ff' },
    { key: 'door-sensor', name: '문열림 센서', emoji: '🧲', category: 'iot', w: 5, d: 3, h: 5, z: 150, color: '#dff3ff' },
    { key: 'thermo', name: '온습도계', emoji: '🌡️', category: 'iot', w: 6, d: 3, h: 6, z: 120, color: '#dff3ff' },
    { key: 'irremote', name: 'IR 리모컨 허브', emoji: '📡', category: 'iot', w: 8, d: 8, h: 4, z: 75, color: '#dff3ff' },
    { key: 'hub', name: 'IoT 허브', emoji: '🔗', category: 'iot', w: 10, d: 10, h: 3, z: 75, color: '#dff3ff' },
    { key: 'router', name: '공유기', emoji: '📶', category: 'iot', w: 25, d: 15, h: 5, z: 40, color: '#dff3ff' },
  ],
  '문·창문': [
    { key: 'door', name: '문', emoji: '🚪', category: 'misc', w: 90, d: 16, h: 210, color: '#d9b48c' },
    { key: 'window', name: '창문', emoji: '🪟', category: 'misc', w: 120, d: 16, h: 120, z: 90, color: '#bfe3ff' },
    { key: 'balcony', name: '베란다 창', emoji: '🪟', category: 'misc', w: 240, d: 16, h: 210, color: '#bfe3ff' },
  ],
};

export const ALL_CATALOG = Object.values(CATALOG).flat();

/** 이모지로 대략적인 크기 추정 (예전 데이터 이전용) */
export function guessByEmoji(emoji: string): CatalogEntry | undefined {
  return ALL_CATALOG.find((c) => c.emoji === emoji);
}

export const FURNITURE_COLORS = [
  '#f6d6c8',
  '#cfd8f2',
  '#e8d2b0',
  '#efe3d3',
  '#cfe9c5',
  '#f6e1ea',
  '#f1f3f6',
  '#4a4a55',
];
