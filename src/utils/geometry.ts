import type { Placement, Pt, Room } from '../types';

export const WALL_THICKNESS = 12; // cm
export const WALL_HEIGHT = 240; // cm

export function dist(a: Pt, b: Pt) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** 면적 (cm²) */
export function polygonArea(points: Pt[]) {
  let s = 0;
  for (let i = 0; i < points.length; i += 1) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    s += a.x * b.y - b.x * a.y;
  }
  return Math.abs(s) / 2;
}

export function formatArea(points: Pt[]) {
  const m2 = polygonArea(points) / 10000;
  const pyeong = m2 / 3.3058;
  return `${m2.toFixed(1)}㎡ · ${pyeong.toFixed(1)}평`;
}

export function pointInPolygon(p: Pt, points: Pt[]) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i, i += 1) {
    const a = points[i];
    const b = points[j];
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) {
      inside = !inside;
    }
  }
  return inside;
}

/** 라벨을 놓을 방 안쪽 지점 (ㄱ자 방처럼 무게중심이 밖에 있어도 안쪽을 찾음) */
export function labelPoint(points: Pt[]): Pt {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const c = {
    x: (Math.min(...xs) + Math.max(...xs)) / 2,
    y: (Math.min(...ys) + Math.max(...ys)) / 2,
  };
  if (pointInPolygon(c, points)) return c;
  // 가로 스캔라인에서 가장 긴 안쪽 구간의 중간
  let best: Pt = points[0];
  let bestLen = -1;
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  for (let k = 1; k < 10; k += 1) {
    const y = minY + ((maxY - minY) * k) / 10;
    const hits: number[] = [];
    for (let i = 0; i < points.length; i += 1) {
      const a = points[i];
      const b = points[(i + 1) % points.length];
      if (a.y > y !== b.y > y) hits.push(a.x + ((y - a.y) * (b.x - a.x)) / (b.y - a.y));
    }
    hits.sort((m, n) => m - n);
    for (let i = 0; i + 1 < hits.length; i += 2) {
      const len = hits[i + 1] - hits[i];
      if (len > bestLen) {
        bestLen = len;
        best = { x: (hits[i] + hits[i + 1]) / 2, y };
      }
    }
  }
  return best;
}

export function roomAt(rooms: Room[], p: Pt) {
  return rooms.find((r) => pointInPolygon(p, r.points)) ?? null;
}

export interface WallSeg {
  a: Pt;
  b: Pt;
}

/** 모든 방의 테두리를 벽으로. 두 방이 공유하는 벽은 한 번만. */
export function wallSegments(rooms: Room[]): WallSeg[] {
  const seen = new Set<string>();
  const out: WallSeg[] = [];
  const key = (p: Pt) => `${Math.round(p.x)},${Math.round(p.y)}`;
  const edgeKey = (a: Pt, b: Pt) => [key(a), key(b)].sort().join('|');
  // 한쪽 방이라도 '트인 변'으로 표시했으면 벽을 세우지 않음
  const open = new Set<string>();
  for (const room of rooms) {
    for (const i of room.open ?? []) {
      open.add(edgeKey(room.points[i], room.points[(i + 1) % room.points.length]));
    }
  }
  for (const room of rooms) {
    for (let i = 0; i < room.points.length; i += 1) {
      const a = room.points[i];
      const b = room.points[(i + 1) % room.points.length];
      if (dist(a, b) < 1) continue;
      const k = edgeKey(a, b);
      if (seen.has(k) || open.has(k)) continue;
      seen.add(k);
      out.push({ a, b });
    }
  }
  return out;
}

export function planBounds(rooms: Room[], placements: Placement[] = []) {
  const pts: Pt[] = rooms.flatMap((r) => r.points);
  for (const p of placements) {
    pts.push({ x: p.x - p.w / 2, y: p.y - p.d / 2 }, { x: p.x + p.w / 2, y: p.y + p.d / 2 });
  }
  if (pts.length === 0) return { minX: 0, minY: 0, maxX: 600, maxY: 600 };
  return {
    minX: Math.min(...pts.map((p) => p.x)),
    minY: Math.min(...pts.map((p) => p.y)),
    maxX: Math.max(...pts.map((p) => p.x)),
    maxY: Math.max(...pts.map((p) => p.y)),
  };
}

/** 마지막 점 기준으로 수평/수직에 가까우면 붙이고, 기존 꼭짓점 근처면 그 점으로 붙임 */
export function snapPoint(raw: Pt, opts: { prev?: Pt; vertices: Pt[]; tolerance: number }): Pt {
  const { prev, vertices, tolerance } = opts;
  for (const v of vertices) {
    if (dist(v, raw) <= tolerance) return { ...v };
  }
  let p = { x: Math.round(raw.x / 5) * 5, y: Math.round(raw.y / 5) * 5 };
  if (prev) {
    const dx = Math.abs(p.x - prev.x);
    const dy = Math.abs(p.y - prev.y);
    if (dy < dx * 0.18) p = { x: p.x, y: prev.y };
    else if (dx < dy * 0.18) p = { x: prev.x, y: p.y };
  }
  // 다른 꼭짓점과 x 또는 y 정렬
  for (const v of vertices) {
    if (Math.abs(v.x - p.x) <= tolerance * 0.6) p = { ...p, x: v.x };
    if (Math.abs(v.y - p.y) <= tolerance * 0.6) p = { ...p, y: v.y };
  }
  return p;
}

export function formatLen(cm: number) {
  return cm >= 100 ? `${(cm / 100).toFixed(2)}m` : `${Math.round(cm)}cm`;
}
