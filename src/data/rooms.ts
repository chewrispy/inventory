import type { RoomDef } from '../types';

export const ROOM_SIZE = 6;
export const ROOM_GAP = 0.9;

export const ROOMS: RoomDef[] = [
  {
    id: 'living',
    name: '거실',
    gridX: 0,
    gridZ: 0,
    floorColor: '#ffd9a0',
    accentColor: '#f2a33d',
  },
  {
    id: 'kitchen',
    name: '주방',
    gridX: 1,
    gridZ: 0,
    floorColor: '#bfe6c8',
    accentColor: '#4caf7d',
  },
  {
    id: 'bedroom',
    name: '침실',
    gridX: 0,
    gridZ: 1,
    floorColor: '#dcccf7',
    accentColor: '#9b7fd4',
  },
  {
    id: 'bathroom',
    name: '욕실',
    gridX: 1,
    gridZ: 1,
    floorColor: '#bfe0f2',
    accentColor: '#4fa3d1',
  },
];

export function roomOrigin(room: RoomDef) {
  return {
    x: room.gridX * (ROOM_SIZE + ROOM_GAP),
    z: room.gridZ * (ROOM_SIZE + ROOM_GAP),
  };
}

export function roomCenter(room: RoomDef) {
  const origin = roomOrigin(room);
  return { x: origin.x + ROOM_SIZE / 2, z: origin.z + ROOM_SIZE / 2 };
}

export function houseCenter() {
  const maxGridX = Math.max(...ROOMS.map((r) => r.gridX));
  const maxGridZ = Math.max(...ROOMS.map((r) => r.gridZ));
  const width = (maxGridX + 1) * ROOM_SIZE + maxGridX * ROOM_GAP;
  const depth = (maxGridZ + 1) * ROOM_SIZE + maxGridZ * ROOM_GAP;
  return { x: width / 2 - ROOM_GAP / 2, z: depth / 2 - ROOM_GAP / 2, width, depth };
}
