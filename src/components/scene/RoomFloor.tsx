import { Html } from '@react-three/drei';
import type { RoomDef } from '../../types';
import { ROOM_SIZE, roomCenter, roomOrigin } from '../../data/rooms';
import { useInventoryStore } from '../../store/useInventoryStore';

interface Props {
  room: RoomDef;
}

export default function RoomFloor({ room }: Props) {
  const center = roomCenter(room);
  const origin = roomOrigin(room);
  const selectItem = useInventoryStore((s) => s.selectItem);

  return (
    <group>
      {/* rug-like border base, slightly larger + darker */}
      <mesh position={[center.x, 0.05, center.z]} receiveShadow onClick={() => selectItem(null)}>
        <boxGeometry args={[ROOM_SIZE + 0.35, 0.1, ROOM_SIZE + 0.35]} />
        <meshStandardMaterial color={room.accentColor} flatShading />
      </mesh>
      {/* main floor */}
      <mesh position={[center.x, 0.11, center.z]} receiveShadow onClick={() => selectItem(null)}>
        <boxGeometry args={[ROOM_SIZE, 0.12, ROOM_SIZE]} />
        <meshStandardMaterial color={room.floorColor} flatShading />
      </mesh>

      <Html
        position={[origin.x + 0.3, 1.4, origin.z + 0.3]}
        center
        distanceFactor={12}
        occlude={false}
      >
        <div className="room-label" style={{ borderColor: room.accentColor }}>
          {room.name}
        </div>
      </Html>
    </group>
  );
}
