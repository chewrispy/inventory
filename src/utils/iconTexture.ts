import * as THREE from 'three';

const cache = new Map<string, THREE.CanvasTexture>();

/**
 * Draws an emoji onto a tiny low-res canvas and scales it up with nearest-neighbor
 * filtering so it reads as a chunky pixel-art sprite instead of a smooth emoji glyph.
 */
export function createIconTexture(emoji: string): THREE.CanvasTexture {
  const cached = cache.get(emoji);
  if (cached) return cached;

  const size = 32;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, size, size);
  ctx.font = `${size * 0.8}px "Noto Color Emoji", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, size / 2, size / 2 + 1);

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.needsUpdate = true;
  cache.set(emoji, texture);
  return texture;
}
