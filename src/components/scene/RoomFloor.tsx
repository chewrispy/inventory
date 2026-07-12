import { Html, RoundedBox } from '@react-three/drei';
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
      <RoundedBox
        args={[room.width + 0.35, 0.1, room.depth + 0.35]}
        radius={0.05}
        smoothness={2}
        position={[center.x, 0.05, center.z]}
        receiveShadow
        onClick={() => selectItem(null)}
      >
        <meshStandardMaterial color={room.accentColor} roughness={0.7} />
      </RoundedBox>
      {/* main floor */}
      <RoundedBox
        args={[room.width, 0.12, room.depth]}
        radius={0.06}
        smoothness={2}
        position={[center.x, 0.12, center.z]}
        receiveShadow
        onClick={() => selectItem(null)}
      >
        <meshStandardMaterial color={room.floorColor} roughness={0.55} />
      </RoundedBox>

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
