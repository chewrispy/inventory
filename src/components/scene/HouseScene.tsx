import { Suspense, useMemo, useState } from 'react';
import * as THREE from 'three';
import { Canvas, type ThreeEvent } from '@react-three/fiber';
import { Html, OrbitControls, RoundedBox } from '@react-three/drei';
import { useInventoryStore } from '../../store/useInventoryStore';
import type { InventoryItem, Placement, Room } from '../../types';
import { createGroundTexture, createIconTexture } from '../../utils/iconTexture';
import { WALL_HEIGHT, WALL_THICKNESS, labelPoint, planBounds, wallSegments } from '../../utils/geometry';
import { darken } from '../../utils/color';
import PuffCloud from './PuffCloud';

const M = 0.01; // cm → m

function RoomFloor({ room }: { room: Room }) {
  const selectRoom = useInventoryStore((s) => s.selectRoom);
  const geometry = useMemo(() => {
    const shape = new THREE.Shape(room.points.map((p) => new THREE.Vector2(p.x * M, -p.y * M)));
    return new THREE.ShapeGeometry(shape);
  }, [room.points]);
  const lp = labelPoint(room.points);
  return (
    <group>
      <mesh
        geometry={geometry}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          if (e.delta > 8) return; // 화면을 돌린 것
          selectRoom(room.id);
        }}
      >
        <meshStandardMaterial color={room.color} roughness={0.8} />
      </mesh>
      <Html position={[lp.x * M, 0.1, lp.y * M]} center distanceFactor={9} zIndexRange={[5, 0]}>
        <button className="room-label room-label-btn" onClick={() => selectRoom(room.id)}>
          {room.kind === 'dressroom' ? '👗 ' : ''}
          {room.name}
        </button>
      </Html>
    </group>
  );
}

function Walls({ rooms, height }: { rooms: Room[]; height: number }) {
  const segs = useMemo(() => wallSegments(rooms), [rooms]);
  return (
    <group>
      {segs.map((s, i) => {
        const dx = s.b.x - s.a.x;
        const dy = s.b.y - s.a.y;
        const len = Math.hypot(dx, dy) + WALL_THICKNESS;
        const h = height * M;
        return (
          <mesh
            key={i}
            position={[((s.a.x + s.b.x) / 2) * M, h / 2, ((s.a.y + s.b.y) / 2) * M]}
            rotation={[0, -Math.atan2(dy, dx), 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[len * M, h, WALL_THICKNESS * M]} />
            <meshStandardMaterial color="#fbf8f4" roughness={0.9} />
          </mesh>
        );
      })}
    </group>
  );
}

function Furniture({ item, placement: p }: { item: InventoryItem; placement: Placement }) {
  const openDetail = useInventoryStore((s) => s.openDetail);
  const selectedItemId = useInventoryStore((s) => s.selectedItemId);
  const [hover, setHover] = useState(false);
  const texture = useMemo(() => createIconTexture(item.emoji), [item.emoji]);
  const color = item.color ?? '#efe3d3';
  const isGlass = item.emoji === '🪟';
  const h = Math.max(1, p.h) * M;
  const w = p.w * M;
  const d = p.d * M;
  const lift = (p.z ?? 0) * M;
  const icon = Math.min(0.55, Math.max(0.18, Math.min(w, Math.max(d, 0.3)) * 0.6));
  const sel = selectedItemId === item.id;

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.delta > 8) return;
    openDetail(item.id);
  };

  return (
    <group position={[p.x * M, lift, p.y * M]} rotation={[0, -(p.rot * Math.PI) / 180, 0]}>
      <RoundedBox
        args={[w, h, d]}
        radius={Math.min(0.04, w / 4, d / 4, h / 2)}
        smoothness={3}
        position={[0, h / 2, 0]}
        castShadow
        receiveShadow
        onClick={onClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
        }}
        onPointerOut={() => setHover(false)}
      >
        <meshStandardMaterial
          color={hover || sel ? darken(color, -0.08) : color}
          roughness={0.6}
          transparent={isGlass}
          opacity={isGlass ? 0.55 : 1}
          emissive={sel ? '#ff6f91' : '#000000'}
          emissiveIntensity={sel ? 0.25 : 0}
        />
      </RoundedBox>
      {/* 윗면 아이콘 */}
      <mesh position={[0, h + 0.006, 0]} rotation={[-Math.PI / 2, 0, (p.rot * Math.PI) / 180]}>
        <planeGeometry args={[icon, icon]} />
        <meshBasicMaterial map={texture} transparent depthWrite={false} />
      </mesh>
      {hover && (
        <Html position={[0, h + 0.35, 0]} center distanceFactor={9}>
          <div className="hover-tag">{item.name}</div>
        </Html>
      )}
    </group>
  );
}

function Ground({ cx, cz, size }: { cx: number; cz: number; size: number }) {
  const texture = useMemo(() => {
    const t = createGroundTexture().clone();
    t.repeat.set(size / 5, size / 5);
    t.needsUpdate = true;
    return t;
  }, [size]);
  return (
    <mesh position={[cx, -0.01, cz]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial map={texture} roughness={0.9} />
    </mesh>
  );
}

export default function HouseScene() {
  const rooms = useInventoryStore((s) => s.rooms);
  const items = useInventoryStore((s) => s.items);
  const lowWalls = useInventoryStore((s) => s.lowWalls);
  const selectItem = useInventoryStore((s) => s.selectItem);
  const selectRoom = useInventoryStore((s) => s.selectRoom);

  const placed = items.filter((it): it is InventoryItem & { placement: Placement } => !!it.placement);
  const b = planBounds(
    rooms,
    placed.map((p) => p.placement),
  );
  const cx = ((b.minX + b.maxX) / 2) * M;
  const cz = ((b.minY + b.maxY) / 2) * M;
  const extent = Math.max(4, (b.maxX - b.minX) * M, (b.maxY - b.minY) * M);
  // 세로 화면(폰)에서는 가로 시야가 좁으니 더 멀리서 보기
  const aspect = window.innerWidth / Math.max(1, window.innerHeight);
  const k = aspect < 1 ? Math.min(1.9, 1 / aspect) * 0.82 : 0.9;

  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ position: [cx + extent * 0.35 * k, extent * 1.45 * k, cz + extent * 0.95 * k], fov: 40 }}
      onPointerMissed={(e) => {
        // 3D 위에 떠 있는 방 이름 버튼을 누른 경우는 무시
        if ((e.target as HTMLElement | null)?.tagName !== 'CANVAS') return;
        selectItem(null);
        selectRoom(null);
      }}
    >
      <color attach="background" args={['#bfe6ff']} />
      <fog attach="fog" args={['#d6efff', extent * 3, extent * 6]} />
      <hemisphereLight args={['#fff6e6', '#b8dcef', 0.95]} />
      <ambientLight intensity={0.45} />
      <directionalLight
        position={[cx + extent * 0.6, extent * 1.6, cz + extent * 0.4]}
        intensity={1.25}
        color="#fff4e0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-extent}
        shadow-camera-right={extent}
        shadow-camera-top={extent}
        shadow-camera-bottom={-extent}
        shadow-bias={-0.0005}
      />

      <Suspense fallback={null}>
        <PuffCloud position={[cx - extent, extent * 1.1, cz - extent * 1.2]} scale={extent * 0.18} />
        <PuffCloud position={[cx + extent * 1.1, extent * 1.3, cz - extent * 0.6]} scale={extent * 0.14} />
        <Ground cx={cx} cz={cz} size={extent * 6} />
        {rooms.map((r) => (
          <RoomFloor key={r.id} room={r} />
        ))}
        <Walls rooms={rooms} height={lowWalls ? 90 : WALL_HEIGHT} />
        {placed.map((it) => (
          <Furniture key={it.id} item={it} placement={it.placement} />
        ))}
      </Suspense>

      <OrbitControls
        target={[cx, 0.4, cz]}
        enableDamping
        minPolarAngle={0.2}
        maxPolarAngle={1.35}
        minDistance={2}
        maxDistance={extent * 4}
      />
    </Canvas>
  );
}
