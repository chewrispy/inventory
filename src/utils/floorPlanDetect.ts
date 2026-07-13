export interface DetectedRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface DetectResult {
  rects: DetectedRect[];
  canvasWidth: number;
  canvasHeight: number;
  naturalWidth: number;
  naturalHeight: number;
}

const MAX_DIMENSION = 260;
const WALL_LUMINANCE = 70;
const BACKGROUND_LUMINANCE = 238;
const MIN_AREA_RATIO = 0.012;
const MAX_ROOMS = 10;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Best-effort room-boundary guesser for clean, top-down 2D floor plan images:
 * classifies pixels as "wall/background" (near-black lines or near-white
 * paper) vs "floor interior", then flood-fills connected floor regions into
 * bounding boxes. Works poorly on furnished 3D-rendered floor plan renders
 * since those have no clean wall/background separation.
 */
export async function detectRoomsFromImage(imageUrl: string): Promise<DetectResult> {
  const img = await loadImage(imageUrl);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(img.naturalWidth, img.naturalHeight));
  const canvasWidth = Math.max(1, Math.round(img.naturalWidth * scale));
  const canvasHeight = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
  const { data } = ctx.getImageData(0, 0, canvasWidth, canvasHeight);

  const isFloor = new Uint8Array(canvasWidth * canvasHeight);
  for (let i = 0; i < canvasWidth * canvasHeight; i += 1) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    isFloor[i] = luminance > WALL_LUMINANCE && luminance < BACKGROUND_LUMINANCE ? 1 : 0;
  }

  const visited = new Uint8Array(canvasWidth * canvasHeight);
  const totalArea = canvasWidth * canvasHeight;
  const minArea = totalArea * MIN_AREA_RATIO;
  const components: { minX: number; minY: number; maxX: number; maxY: number; area: number }[] = [];

  for (let y = 0; y < canvasHeight; y += 1) {
    for (let x = 0; x < canvasWidth; x += 1) {
      const idx = y * canvasWidth + x;
      if (!isFloor[idx] || visited[idx]) continue;

      let minX = x;
      let maxX = x;
      let minY = y;
      let maxY = y;
      let area = 0;
      const stack = [idx];
      visited[idx] = 1;

      while (stack.length > 0) {
        const cur = stack.pop()!;
        const cx = cur % canvasWidth;
        const cy = Math.floor(cur / canvasWidth);
        area += 1;
        if (cx < minX) minX = cx;
        if (cx > maxX) maxX = cx;
        if (cy < minY) minY = cy;
        if (cy > maxY) maxY = cy;

        const neighbors = [cur - 1, cur + 1, cur - canvasWidth, cur + canvasWidth];
        for (const n of neighbors) {
          if (n < 0 || n >= canvasWidth * canvasHeight) continue;
          if (cx === 0 && n === cur - 1) continue;
          if (cx === canvasWidth - 1 && n === cur + 1) continue;
          if (!isFloor[n] || visited[n]) continue;
          visited[n] = 1;
          stack.push(n);
        }
      }

      if (area >= minArea) {
        components.push({ minX, minY, maxX, maxY, area });
      }
    }
  }

  const rects = components
    .sort((a, b) => b.area - a.area)
    .slice(0, MAX_ROOMS)
    .sort((a, b) => a.minY - b.minY || a.minX - b.minX)
    .map((c) => ({
      x: c.minX,
      y: c.minY,
      w: c.maxX - c.minX,
      h: c.maxY - c.minY,
    }));

  return { rects, canvasWidth, canvasHeight, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight };
}
