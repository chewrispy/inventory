import type { InventoryItem } from '../types';

/**
 * 2026-11-11 보정: 처음 배치한 가구 중 벽을 넘던 것들을 방 안쪽으로 살짝 이동,
 * 주방 식탁은 실제처럼 원형으로 바꿔 다용도실 쪽 벽에 붙임.
 * 사용자가 이미 옮긴 가구(좌표가 처음 값과 다름)는 건드리지 않음.
 */
const MOVES: [id: string, fromX: number, fromY: number, toX: number, toY: number][] = [
  ['bomi-desk', 205, 275, 205, 272],
  ['bomi-vacuum', 450, 230, 447, 230],
  ['james-purifier', 685, 245, 697, 245],
  ['dress-styler', 975, 530, 975, 527],
  ['living-ac', 20, 375, 27, 375],
  ['kitchen-fridge', 710, 810, 728, 810],
  ['kitchen-counter', 855, 1035, 852, 1032],
  ['kitchen-water', 700, 890, 707, 890],
  ['kitchen-oven', 960, 720, 960, 722],
  ['utility-washer', 1070, 735, 1070, 740],
  ['entry-shoes', 1000, 615, 997, 627],
];

export function applyDataFixes(items: InventoryItem[]): InventoryItem[] | null {
  let changed = false;
  const out = items.map((it) => {
    const p = it.placement;
    if (!p) return it;
    if (it.id === 'kitchen-table' && p.x === 910 && p.y === 795 && p.w === 130 && !p.shape) {
      changed = true;
      return {
        ...it,
        name: it.name === '식탁' ? '원형 식탁' : it.name,
        placement: { ...p, x: 970, y: 800, w: 100, d: 100, shape: 'round' as const },
      };
    }
    const m = MOVES.find(([id, fx, fy]) => id === it.id && p.x === fx && p.y === fy);
    if (!m) return it;
    changed = true;
    return {
      ...it,
      placement: { ...p, x: m[3], y: m[4], ...(it.id === 'entry-shoes' && p.w === 120 ? { w: 110 } : {}) },
    };
  });
  return changed ? out : null;
}
