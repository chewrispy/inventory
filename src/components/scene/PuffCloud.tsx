import { useMemo } from 'react';
import { Billboard } from '@react-three/drei';
import { createCloudPuffTexture } from '../../utils/iconTexture';

interface Props {
  position: [number, number, number];
  scale?: number;
}

/** A cheap, self-contained decorative cloud made of a few overlapping soft puffs. */
export default function PuffCloud({ position, scale = 1 }: Props) {
  const texture = useMemo(() => createCloudPuffTexture(), []);
  const puffs = useMemo(
    () => [
      { x: 0, y: 0, s: 2.2 },
      { x: -1.3, y: -0.2, s: 1.5 },
      { x: 1.3, y: -0.15, s: 1.6 },
      { x: 0.3, y: 0.5, s: 1.4 },
    ],
    [],
  );

  return (
    <Billboard position={position}>
      {puffs.map((p, i) => (
        <mesh key={i} position={[p.x * scale, p.y * scale, 0]} scale={p.s * scale}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial map={texture} transparent depthWrite={false} />
        </mesh>
      ))}
    </Billboard>
  );
}
