import { useMemo, useState } from 'react';
import { Billboard, Html } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import type { InventoryItem, RoomDef } from '../../types';
import { createIconTexture, createSoftShadowTexture } from '../../utils/iconTexture';
import { useInventoryStore } from '../../store/useInventoryStore';

interface Props {
  item: InventoryItem;
  room: RoomDef;
}

const MARGIN = 0.16;

export default function ItemMarker({ item, room }: Props) {
  const [hovered, setHovered] = useState(false);
  const texture = useMemo(() => createIconTexture(item.emoji), [item.emoji]);
  const shadowTexture = useMemo(() => createSoftShadowTexture(), []);
  const selectItem = useInventoryStore((s) => s.selectItem);
  const selectedItemId = useInventoryStore((s) => s.selectedItemId);
  const isSelected = selectedItemId === item.id;

  const fx = MARGIN + item.position.x * (1 - MARGIN * 2);
  const fz = MARGIN + item.position.z * (1 - MARGIN * 2);
  const x = room.x + fx * room.width;
  const z = room.z + fz * room.depth;

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    selectItem(item.id);
  };

  return (
    <group
      position={[x, 0.17, z]}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      {/* soft contact shadow */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.7, 0.7]} />
        <meshBasicMaterial map={shadowTexture} transparent depthWrite={false} />
      </mesh>

      <Billboard position={[0, hovered || isSelected ? 0.62 : 0.5, 0]}>
        <mesh scale={hovered || isSelected ? 1.15 : 1}>
          <planeGeometry args={[0.7, 0.7]} />
          <meshBasicMaterial map={texture} transparent depthWrite={false} />
        </mesh>
        {item.quantity > 1 && (
          <Html position={[0.28, 0.32, 0]} center distanceFactor={12}>
            <div className="qty-badge">{item.quantity}</div>
          </Html>
        )}
      </Billboard>

      {hovered && !isSelected && (
        <Html position={[0, 1.05, 0]} center distanceFactor={12}>
          <div className="hover-tag">{item.name}</div>
        </Html>
      )}
    </group>
  );
}
