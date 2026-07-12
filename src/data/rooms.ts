import type { RoomDef } from '../types';

const ROOM_SIZE = 6;
const ROOM_GAP = 0.9;
const STEP = ROOM_SIZE + ROOM_GAP;

export const DEFAULT_ROOMS: RoomDef[] = [
  {
    id: 'living',
    name: '거실',
    x: 0,
    z: 0,
    width: ROOM_SIZE,
    depth: ROOM_SIZE,
    floorColor: '#ffd9a0',
    accentColor: '#f2a33d',
  },
  {
    id: 'kitchen',
    name: '주방',
    x: STEP,
    z: 0,
    width: ROOM_SIZE,
    depth: ROOM_SIZE,
    floorColor: '#bfe6c8',
    accentColor: '#4caf7d',
  },
  {
    id: 'bedroom',
    name: '침실',
    x: 0,
    z: STEP,
    width: ROOM_SIZE,
    depth: ROOM_SIZE,
    floorColor: '#dcccf7',
    accentColor: '#9b7fd4',
  },
  {
    id: 'bathroom',
    name: '욕실',
    x: STEP,
    z: STEP,
    width: ROOM_SIZE,
    depth: ROOM_SIZE,
    floorColor: '#bfe0f2',
    accentColor: '#4fa3d1',
  },
];

export function roomCenter(room: RoomDef) {
  return { x: room.x + room.width / 2, z: room.z + room.depth / 2 };
}

export function houseBounds(rooms: RoomDef[]) {
  if (rooms.length === 0) {
    return { minX: 0, minZ: 0, maxX: 6, maxZ: 6, width: 6, depth: 6, centerX: 3, centerZ: 3 };
  }
  const minX = Math.min(...rooms.map((r) => r.x));
  const minZ = Math.min(...rooms.map((r) => r.z));
  const maxX = Math.max(...rooms.map((r) => r.x + r.width));
  const maxZ = Math.max(...rooms.map((r) => r.z + r.depth));
  return {
    minX,
    minZ,
    maxX,
    maxZ,
    width: maxX - minX,
    depth: maxZ - minZ,
    centerX: (minX + maxX) / 2,
    centerZ: (minZ + maxZ) / 2,
  };
}
