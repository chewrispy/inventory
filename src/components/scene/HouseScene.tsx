import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Pixelation } from '@react-three/postprocessing';
import { houseBounds } from '../../data/rooms';
import { useInventoryStore } from '../../store/useInventoryStore';
import RoomFloor from './RoomFloor';
import ItemMarker from './ItemMarker';

function Ground({ bounds, onClick }: { bounds: ReturnType<typeof houseBounds>; onClick: () => void }) {
  return (
    <mesh
      position={[bounds.centerX, -0.05, bounds.centerZ]}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
      onClick={onClick}
    >
      <planeGeometry args={[bounds.width + 16, bounds.depth + 16]} />
      <meshStandardMaterial color="#8fd18a" flatShading />
    </mesh>
  );
}

export default function HouseScene() {
  const rooms = useInventoryStore((s) => s.rooms);
  const items = useInventoryStore((s) => s.items);
  const selectItem = useInventoryStore((s) => s.selectItem);
  const bounds = houseBounds(rooms);
  const sceneKey = rooms.map((r) => `${r.id}:${r.x}:${r.z}:${r.width}:${r.depth}`).join('|');

  return (
    <Canvas
      key={sceneKey}
      shadows
      dpr={[1, 1.5]}
      camera={{ position: [bounds.centerX + bounds.width * 0.9 + 3, 9, bounds.centerZ + bounds.depth * 0.9 + 3], fov: 40 }}
      onPointerMissed={() => selectItem(null)}
    >
      <color attach="background" args={['#bfe9ff']} />
      <fog attach="fog" args={['#bfe9ff', 22, 46]} />
      <ambientLight intensity={0.85} />
      <directionalLight
        position={[bounds.centerX + 8, 14, bounds.centerZ + 6]}
        intensity={0.9}
        castShadow
        shadow-mapSize={[512, 512]}
      />

      <Suspense fallback={null}>
        <Ground bounds={bounds} onClick={() => selectItem(null)} />
        {rooms.map((room) => (
          <RoomFloor key={room.id} room={room} />
        ))}
        {items.map((item) => {
          const room = rooms.find((r) => r.id === item.roomId);
          if (!room) return null;
          return <ItemMarker key={item.id} item={item} room={room} />;
        })}
      </Suspense>

      <OrbitControls
        target={[bounds.centerX, 0.5, bounds.centerZ]}
        enablePan={false}
        minPolarAngle={0.55}
        maxPolarAngle={1.15}
        minDistance={Math.max(9, bounds.width * 0.6)}
        maxDistance={Math.max(24, bounds.width * 2.2)}
        minAzimuthAngle={-Math.PI}
        maxAzimuthAngle={Math.PI}
      />

      <EffectComposer>
        <Pixelation granularity={4} />
      </EffectComposer>
    </Canvas>
  );
}
