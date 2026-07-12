import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { houseBounds } from '../../data/rooms';
import { useInventoryStore } from '../../store/useInventoryStore';
import RoomFloor from './RoomFloor';
import ItemMarker from './ItemMarker';
import PuffCloud from './PuffCloud';

function Ground({ bounds, onClick }: { bounds: ReturnType<typeof houseBounds>; onClick: () => void }) {
  return (
    <mesh
      position={[bounds.centerX, -0.05, bounds.centerZ]}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
      onClick={onClick}
    >
      <planeGeometry args={[bounds.width + 20, bounds.depth + 20]} />
      <meshStandardMaterial color="#a3e896" />
    </mesh>
  );
}

function Sky({ bounds }: { bounds: ReturnType<typeof houseBounds> }) {
  return (
    <group>
      <PuffCloud position={[bounds.centerX - bounds.width * 0.8, 9, bounds.centerZ - 8]} scale={1.4} />
      <PuffCloud
        position={[bounds.centerX + bounds.width * 0.9, 10.5, bounds.centerZ + bounds.depth * 0.5]}
        scale={1.1}
      />
    </group>
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
      <color attach="background" args={['#8fd0ff']} />
      <fog attach="fog" args={['#bfe6ff', 26, 50]} />
      <hemisphereLight args={['#fff6d6', '#8fd0ff', 0.9]} />
      <ambientLight intensity={0.55} />
      <directionalLight
        position={[bounds.centerX + 8, 14, bounds.centerZ + 6]}
        intensity={1.15}
        color="#fff6e0"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      <Suspense fallback={null}>
        <Sky bounds={bounds} />
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
        <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} intensity={0.35} mipmapBlur />
      </EffectComposer>
    </Canvas>
  );
}
