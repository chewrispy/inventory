import { Html } from '@react-three/drei';
import type { RoomDef } from '../../types';
import { roomCenter } from '../../data/rooms';
import { useInventoryStore } from '../../store/useInventoryStore';

interface Props {
  room: RoomDef;
}

export default function RoomFloor({ room }: Props) {
  const center = roomCenter(room);
  const selectItem = useInventoryStore((s) => s.selectItem);

  return (
    <group>
      {/* rug-like border base, slightly larger + darker */}
      <mesh position={[center.x, 0.05, center.z]} receiveShadow onClick={() => selectItem(null)}>
        <boxGeometry args={[room.width + 0.35, 0.1, room.depth + 0.35]} />
        <meshStandardMaterial color={room.accentColor} flatShading />
      </mesh>
      {/* main floor */}
      <mesh position={[center.x, 0.11, center.z]} receiveShadow onClick={() => selectItem(null)}>
        <boxGeometry args={[room.width, 0.12, room.depth]} />
        <meshStandardMaterial color={room.floorColor} flatShading />
      </mesh>

      <Html
        position={[room.x + 0.3, 1.4, room.z + 0.3]}
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
