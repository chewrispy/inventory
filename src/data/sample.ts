import type { InventoryItem, Room } from '../types';

const rect = (x1: number, y1: number, x2: number, y2: number) => [
  { x: x1, y: y1 },
  { x: x2, y: y1 },
  { x: x2, y: y2 },
  { x: x1, y: y2 },
];

export const SAMPLE_ROOMS: Room[] = [
  { id: 'living', name: '거실', points: rect(0, 0, 520, 420), color: '#ffe2b8' },
  { id: 'kitchen', name: '주방', points: rect(520, 0, 820, 260), color: '#d3f0da' },
  { id: 'bathroom', name: '욕실', points: rect(520, 260, 820, 420), color: '#d4ebf7' },
  { id: 'bedroom', name: '침실', points: rect(0, 420, 400, 780), color: '#e6dcfa' },
  { id: 'study', name: '서재', points: rect(400, 420, 820, 780), color: '#fff0c2' },
];

export const SAMPLE_ITEMS: InventoryItem[] = [
  // 거실
  {
    id: 'seed-sofa', name: '3인용 소파', category: 'furniture', quantity: 1, emoji: '🛋️',
    price: 150000, condition: '사용감있음', purchasedAt: '2022-05-10', memo: '쿠션 살짝 꺼짐, 이사하며 정리 예정',
    placement: { x: 260, y: 350, w: 220, d: 90, h: 80, rot: 0 }, color: '#cfd8f2',
  },
  {
    id: 'seed-tvstand', name: 'TV장', category: 'furniture', quantity: 1, emoji: '🗄️',
    placement: { x: 260, y: 32, w: 180, d: 45, h: 45, rot: 0 }, color: '#efe3d3',
  },
  {
    id: 'seed-tv', name: '55인치 TV', category: 'electronics', quantity: 1, emoji: '📺',
    price: 400000, condition: '거의새것', purchasedAt: '2023-11-02',
    placement: { x: 260, y: 26, w: 124, d: 8, h: 72, z: 45, rot: 0 }, color: '#4a4a55',
  },
  {
    id: 'seed-plant', name: '몬스테라 화분', category: 'misc', quantity: 1, emoji: '🪴', condition: '새상품',
    placement: { x: 470, y: 50, w: 40, d: 40, h: 100, rot: 0 }, color: '#cfe9c5',
  },
  {
    id: 'seed-ac', name: '스탠드 에어컨', category: 'appliance', quantity: 1, emoji: '❄️',
    placement: { x: 40, y: 40, w: 40, d: 40, h: 180, rot: 0 }, color: '#f7f9fb',
  },
  // 주방
  {
    id: 'seed-fridge', name: '냉장고', category: 'appliance', quantity: 1, emoji: '🧊',
    condition: '사용감있음', purchasedAt: '2021-03-01',
    placement: { x: 770, y: 55, w: 91, d: 92, h: 180, rot: 0 }, color: '#e9eef2',
  },
  {
    id: 'seed-table', name: '식탁', category: 'furniture', quantity: 1, emoji: '🍽️',
    placement: { x: 640, y: 170, w: 140, d: 80, h: 75, rot: 0 }, color: '#e8d2b0',
  },
  {
    id: 'seed-pot', name: '냄비 세트', category: 'kitchen', quantity: 3, emoji: '🍲',
    price: 30000, condition: '사용감있음', memo: '한 개는 코팅이 벗겨져서 판매하려고요', locationId: 'kitchen',
  },
  { id: 'seed-rice', name: '즉석밥', category: 'food', quantity: 8, emoji: '🍚', locationId: 'kitchen' },
  { id: 'seed-milk', name: '우유', category: 'food', quantity: 2, emoji: '🥛', locationId: 'seed-fridge' },
  // 욕실
  {
    id: 'seed-washer', name: '드럼세탁기', category: 'appliance', quantity: 1, emoji: '🌀',
    condition: '사용감있음', purchasedAt: '2020-08-15',
    placement: { x: 780, y: 375, w: 60, d: 70, h: 85, rot: 0 }, color: '#f1f3f6',
  },
  { id: 'seed-towel', name: '수건 세트', category: 'bathroom', quantity: 6, emoji: '🧻', locationId: 'bathroom' },
  // 침실
  {
    id: 'seed-bed', name: '퀸 침대', category: 'furniture', quantity: 1, emoji: '🛏️', condition: '거의새것',
    placement: { x: 180, y: 600, w: 160, d: 200, h: 45, rot: 0 }, color: '#f6d6c8',
  },
  {
    id: 'seed-wardrobe', name: '옷장', category: 'furniture', quantity: 1, emoji: '👚',
    placement: { x: 330, y: 600, w: 120, d: 60, h: 200, rot: 90 }, color: '#efe3d3',
  },
  {
    id: 'seed-clothes', name: '박스 (겨울옷)', category: 'clothing', quantity: 1, emoji: '🧥',
    condition: '사용감있음', locationId: 'seed-wardrobe',
  },
  // 서재
  {
    id: 'seed-desk', name: '책상', category: 'furniture', quantity: 1, emoji: '✏️',
    placement: { x: 610, y: 735, w: 120, d: 60, h: 73, rot: 0 }, color: '#e8d2b0',
  },
  {
    id: 'seed-shelf', name: '책장', category: 'furniture', quantity: 1, emoji: '📚',
    placement: { x: 790, y: 560, w: 80, d: 30, h: 180, rot: 90 }, color: '#e8d2b0',
  },
  {
    id: 'seed-books', name: '소설책 모음', category: 'book', quantity: 12, emoji: '📚',
    price: 20000, condition: '사용감있음', memo: '다 읽은 책들 당근에 팔아야지', locationId: 'seed-shelf',
  },
  // 문
  {
    id: 'seed-door', name: '현관문', category: 'misc', quantity: 1, emoji: '🚪',
    placement: { x: 0, y: 250, w: 90, d: 16, h: 210, rot: 90 }, color: '#d9b48c',
  },
  {
    id: 'seed-window', name: '주방 창', category: 'misc', quantity: 1, emoji: '🪟',
    placement: { x: 820, y: 170, w: 120, d: 16, h: 120, z: 90, rot: 90 }, color: '#bfe3ff',
  },
];
