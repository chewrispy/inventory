import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Pixelation } from '@react-three/postprocessing';
import { ROOMS, houseCenter } from '../../data/rooms';
import { useInventoryStore } from '../../store/useInventoryStore';
import RoomFloor from './RoomFloor';
import ItemMarker from './ItemMarker';

function Ground({ onClick }: { onClick: () => void }) {
  const center = houseCenter();
  return (
    <mesh
      position={[center.x, -0.05, center.z]}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
      onClick={onClick}
    >
      <planeGeometry args={[center.width + 14, center.depth + 14]} />
      <meshStandardMaterial color="#8fd18a" flatShading />
    </mesh>
  );
}

export default function HouseScene() {
  const items = useInventoryStore((s) => s.items);
  const selectItem = useInventoryStore((s) => s.selectItem);
  const center = houseCenter();

  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ position: [center.x + 11, 9, center.z + 11], fov: 40 }}
      onPointerMissed={() => selectItem(null)}
    >
      <color attach="background" args={['#bfe9ff']} />
      <fog attach="fog" args={['#bfe9ff', 22, 42]} />
      <ambientLight intensity={0.85} />
      <directionalLight
        position={[center.x + 8, 14, center.z + 6]}
        intensity={0.9}
        castShadow
        shadow-mapSize={[512, 512]}
      />

      <Suspense fallback={null}>
        <Ground onClick={() => selectItem(null)} />
        {ROOMS.map((room) => (
          <RoomFloor key={room.id} room={room} />
        ))}
        {items.map((item) => {
          const room = ROOMS.find((r) => r.id === item.roomId);
          if (!room) return null;
          return <ItemMarker key={item.id} item={item} room={room} />;
        })}
      </Suspense>

      <OrbitControls
        target={[center.x, 0.5, center.z]}
        enablePan={false}
        minPolarAngle={0.55}
        maxPolarAngle={1.15}
        minDistance={9}
        maxDistance={24}
        minAzimuthAngle={-Math.PI}
        maxAzimuthAngle={Math.PI}
      />

      <EffectComposer>
        <Pixelation granularity={4} />
      </EffectComposer>
    </Canvas>
  );
}
