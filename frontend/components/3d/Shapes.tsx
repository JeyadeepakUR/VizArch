'use client';

import * as THREE from 'three';
import { Edges, Line, Text } from '@react-three/drei';

type AwsShapeProps = {
  type: string;
  color: string;
  isSelected?: boolean;
};

export default function AwsShape({ type, color, isSelected }: AwsShapeProps) {
  switch (type) {
    case 'lambda':
      return <Lightning color={color} selected={isSelected} />;
    case 's3':
      return <WireCube color={color} selected={isSelected} />;
    case 'dynamodb':
    case 'rds':
    case 'database':
      return <StackedDisks color={color} selected={isSelected} />;
    case 'cloudfront':
      return <GlobeRings color={color} selected={isSelected} />;
    case 'api_gateway':
      return <LinkedTori color={color} selected={isSelected} />;
    case 'amplify':
      return <CloudBlob color={color} selected={isSelected} />;
    case 'elasticache':
    case 'cache':
      return <ClusterCubes color={color} selected={isSelected} />;
    case 'sqs':
      return <RoundedMessage color={color} selected={isSelected} />;
    case 'sns':
      return <SignalWaves color={color} selected={isSelected} />;
    case 'load_balancer':
      return <Balancer color={color} selected={isSelected} />;
    case 'compute_node':
      return <ComputeBox color={color} selected={isSelected} />;
    case 'vpc':
      return <VpcContainer color={color} selected={isSelected} />;
    case 'subnet':
      return <SubnetGrid color={color} selected={isSelected} />;
    case 'security_group':
      return <SecurityShield color={color} selected={isSelected} />;
    case 'nat_gateway':
    case 'internet_gateway':
      return <Gateway color={color} selected={isSelected} />;
    default:
      return <ComputeBox color={color} selected={isSelected} />;
  }
}

function material(color: string, selected?: boolean) {
  return (
    <meshStandardMaterial
      color={color}
      emissive={color}
      emissiveIntensity={0.1}
      transparent
      opacity={0.15}
      metalness={0.6}
      roughness={0.3}
    />
  );
}

function Lightning({ color, selected }: { color: string; selected?: boolean }) {
  // Simple lightning bolt via extruded shape
  const shape = new THREE.Shape();
  shape.moveTo(-0.2, 0.4);
  shape.lineTo(0.0, 0.1);
  shape.lineTo(-0.1, 0.1);
  shape.lineTo(0.2, -0.4);
  shape.lineTo(0.0, -0.1);
  shape.lineTo(0.1, -0.1);
  shape.lineTo(-0.2, 0.4);

  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.1, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02 });
  geo.center();
  return (
    <mesh rotation={[0, 0.5, 0]}>
      <primitive object={geo} />
      {material(color, selected)}
      <Edges scale={1.0} threshold={15} color={color} linewidth={2} />
    </mesh>
  );
}

function WireCube({ color, selected }: { color: string; selected?: boolean }) {
  return (
    <group>
      <mesh>
        <boxGeometry args={[0.9, 0.9, 0.9]} />
        {material('#10141f', selected)}
        <Edges scale={1.0} threshold={1} color={color} linewidth={2} />
      </mesh>
      {/* inner diagonal lines */}
      <Line points={[[-0.45, -0.45, -0.45], [0.45, 0.45, 0.45]]} color={color} lineWidth={2} />
      <Line points={[[0.45, -0.45, -0.45], [-0.45, 0.45, 0.45]]} color={color} lineWidth={2} />
    </group>
  );
}

function StackedDisks({ color, selected }: { color: string; selected?: boolean }) {
  return (
    <group>
      {[0, 0.3, 0.6].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <cylinderGeometry args={[0.55, 0.55, 0.22, 32]} />
          {material(color, selected)}
          <Edges scale={1.0} threshold={15} color={color} linewidth={2} />
        </mesh>
      ))}
    </group>
  );
}

function GlobeRings({ color, selected }: { color: string; selected?: boolean }) {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.6, 32, 32]} />
        {material('#0c1524', selected)}
        <Edges scale={1.0} threshold={15} color={color} linewidth={2} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.65, 0.04, 16, 64]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.65, 0.04, 16, 64]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}

function LinkedTori({ color, selected }: { color: string; selected?: boolean }) {
  return (
    <group>
      <mesh position={[-0.35, 0, 0]} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[0.35, 0.08, 16, 64]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh position={[0.35, 0, 0]} rotation={[Math.PI / 3, Math.PI / 2.5, 0]}>
        <torusGeometry args={[0.35, 0.08, 16, 64]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[0.2, 0.1, 0.2]} />
        {material('#0c1524', selected)}
      </mesh>
    </group>
  );
}

function CloudBlob({ color, selected }: { color: string; selected?: boolean }) {
  const spheres = [
    { p: [-0.4, 0.2, 0], r: 0.35 },
    { p: [0.0, 0.3, 0], r: 0.45 },
    { p: [0.4, 0.2, 0], r: 0.35 },
    { p: [0.0, -0.05, 0], r: 0.25 },
  ];
  return (
    <group>
      {spheres.map((s, i) => (
        <group key={i} position={[s.p[0], s.p[1], s.p[2]]}>
          <mesh>
            <sphereGeometry args={[s.r, 24, 24]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.3}
              transparent
              opacity={1}
              metalness={0.4}
              roughness={0.5}
            />
          </mesh>
          {/* Add equator rings for accent */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[s.r * 0.8, 0.02, 8, 32]} />
            <meshBasicMaterial color={color} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function ClusterCubes({ color, selected }: { color: string; selected?: boolean }) {
  const pos = [
    [-0.35, 0.1, 0], [0.0, 0.25, 0], [0.35, 0.1, 0],
    [-0.2, -0.2, 0], [0.2, -0.2, 0]
  ];
  return (
    <group>
      {pos.map((p, i) => (
        <mesh key={i} position={[p[0], p[1], p[2]]}>
          <boxGeometry args={[0.4, 0.4, 0.4]} />
          {material(color, selected)}
          <Edges scale={1.0} threshold={15} color={color} linewidth={2} />
        </mesh>
      ))}
    </group>
  );
}

function RoundedMessage({ color, selected }: { color: string; selected?: boolean }) {
  const shape = new THREE.Shape();
  const w = 1.0, h = 0.7, r = 0.15;
  shape.moveTo(-w/2 + r, -h/2);
  shape.lineTo(w/2 - r, -h/2);
  shape.quadraticCurveTo(w/2, -h/2, w/2, -h/2 + r);
  shape.lineTo(w/2, h/2 - r);
  shape.quadraticCurveTo(w/2, h/2, w/2 - r, h/2);
  shape.lineTo(-w/2 + r, h/2);
  shape.quadraticCurveTo(-w/2, h/2, -w/2, h/2 - r);
  shape.lineTo(-w/2, -h/2 + r);
  shape.quadraticCurveTo(-w/2, -h/2, -w/2 + r, -h/2);
  // tail
  shape.lineTo(-0.1, -h/2);
  shape.lineTo(-0.25, -h/2 - 0.2);
  shape.lineTo(0.0, -h/2);

  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.12, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02 });
  geo.center();
  return (
    <mesh>
      <primitive object={geo} />
      {material(color, selected)}
      <Edges color={color} linewidth={2} />
    </mesh>
  );
}

function SignalWaves({ color, selected }: { color: string; selected?: boolean }) {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {[0.3, 0.45, 0.6].map((r, i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[r, 0.03, 12, 48]} />
          <meshBasicMaterial color={color} />
        </mesh>
      ))}
    </group>
  );
}

function Balancer({ color, selected }: { color: string; selected?: boolean }) {
  return (
    <group>
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[0.9, 0.2, 0.9]} />
        {material(color, selected)}
        <Edges scale={1.0} threshold={15} color={color} linewidth={2} />
      </mesh>
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.6, 16]} />
        {material(color, selected)}
        <Edges scale={1.0} threshold={15} color={color} linewidth={2} />
      </mesh>
    </group>
  );
}

function ComputeBox({ color, selected }: { color: string; selected?: boolean }) {
  return (
    <mesh>
      <boxGeometry args={[0.8, 0.8, 0.8]} />
      {material(color, selected)}
      <Edges scale={1.0} threshold={1} color={color} linewidth={2} />
    </mesh>
  );
}

function VpcContainer({ color, selected }: { color: string; selected?: boolean }) {
  // Large wireframe box to represent VPC boundary
  return (
    <group>
      <mesh>
        <boxGeometry args={[1.5, 1.2, 1.5]} />
        <meshBasicMaterial color={color} transparent opacity={0.05} />
        <Edges scale={1.0} threshold={1} color={color} linewidth={2} />
      </mesh>
    </group>
  );
}

function SubnetGrid({ color, selected }: { color: string; selected?: boolean }) {
  // Grid pattern to show subnet
  return (
    <group>
      <mesh>
        <planeGeometry args={[1.0, 1.0, 4, 4]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} wireframe />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <boxGeometry args={[1.0, 0.1, 1.0]} />
        {material(color, selected)}
        <Edges scale={1.0} threshold={15} color={color} linewidth={2} />
      </mesh>
    </group>
  );
}

function SecurityShield({ color, selected }: { color: string; selected?: boolean }) {
  // Shield shape using extruded path
  const shape = new THREE.Shape();
  shape.moveTo(0, 0.5);
  shape.lineTo(0.4, 0.3);
  shape.lineTo(0.4, -0.2);
  shape.lineTo(0, -0.5);
  shape.lineTo(-0.4, -0.2);
  shape.lineTo(-0.4, 0.3);
  shape.lineTo(0, 0.5);
  
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.15, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02 });
  geo.center();
  
  return (
    <mesh>
      <primitive object={geo} />
      {material(color, selected)}
      <Edges color={color} linewidth={2} />
    </mesh>
  );
}

function Gateway({ color, selected }: { color: string; selected?: boolean }) {
  // Gateway as a portal/archway
  return (
    <group>
      <mesh position={[-0.35, 0, 0]}>
        <boxGeometry args={[0.15, 0.8, 0.3]} />
        {material(color, selected)}
        <Edges scale={1.0} threshold={15} color={color} linewidth={2} />
      </mesh>
      <mesh position={[0.35, 0, 0]}>
        <boxGeometry args={[0.15, 0.8, 0.3]} />
        {material(color, selected)}
        <Edges scale={1.0} threshold={15} color={color} linewidth={2} />
      </mesh>
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[0.8, 0.15, 0.3]} />
        {material(color, selected)}
        <Edges scale={1.0} threshold={15} color={color} linewidth={2} />
      </mesh>
    </group>
  );
}
