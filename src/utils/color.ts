/** Darkens a #rrggbb hex color by the given amount (0..1) for a matching accent shade. */
export function darken(hex: string, amount = 0.28): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const f = (v: number) => Math.max(0, Math.round(v * (1 - amount)));
  return `#${[f(r), f(g), f(b)].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

export const ROOM_COLOR_PRESETS = [
  '#ffd9a0',
  '#bfe6c8',
  '#dcccf7',
  '#bfe0f2',
  '#ffc9c9',
  '#c9f7d9',
  '#fff3b0',
  '#e3d9f5',
];
