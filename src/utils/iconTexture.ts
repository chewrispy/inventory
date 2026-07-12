import * as THREE from 'three';

const iconCache = new Map<string, THREE.CanvasTexture>();

/** Draws an emoji onto a crisp high-res canvas for a smooth, clean sprite. */
export function createIconTexture(emoji: string): THREE.CanvasTexture {
  const cached = iconCache.get(emoji);
  if (cached) return cached;

  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, size, size);
  ctx.font = `${size * 0.72}px "Noto Color Emoji", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, size / 2, size / 2 + size * 0.03);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  iconCache.set(emoji, texture);
  return texture;
}

let cloudTexture: THREE.CanvasTexture | null = null;

/** Soft white radial-gradient puff used to build cheap decorative clouds (no external assets). */
export function createCloudPuffTexture(): THREE.CanvasTexture {
  if (cloudTexture) return cloudTexture;

  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
  gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.75)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  cloudTexture = new THREE.CanvasTexture(canvas);
  cloudTexture.needsUpdate = true;
  return cloudTexture;
}

let shadowTexture: THREE.CanvasTexture | null = null;

/** Soft blurred radial-gradient ellipse used as a cute contact shadow under items. */
export function createSoftShadowTexture(): THREE.CanvasTexture {
  if (shadowTexture) return shadowTexture;

  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  gradient.addColorStop(0, 'rgba(60, 45, 70, 0.32)');
  gradient.addColorStop(0.7, 'rgba(60, 45, 70, 0.16)');
  gradient.addColorStop(1, 'rgba(60, 45, 70, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  shadowTexture = new THREE.CanvasTexture(canvas);
  shadowTexture.needsUpdate = true;
  return shadowTexture;
}
