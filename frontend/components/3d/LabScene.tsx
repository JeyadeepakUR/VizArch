'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Stars } from '@react-three/drei';
import { useLabStore } from '@/store/labStore';
import Node from './Node';
import ConnectionLine from './ConnectionLine';

export default function LabScene() {
  const { components, connections, isDraggingComponent } = useLabStore();
  
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [5, 5, 5], fov: 50 }}
        shadows
      >
        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00d4ff" />
        
        {/* Jarvis-style starfield */}
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        {/* Grid floor */}
        <Grid
          args={[20, 20]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#00d4ff"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#0088ff"
          fadeDistance={25}
          fadeStrength={1}
          followCamera={false}
        />
        
        {/* Components */}
        {components.map((component) => (
          <Node key={component.id} component={component} />
        ))}
        
        {/* Connections */}
        {connections.map(([fromId, toId]) => {
          const fromComp = components.find((c) => c.id === fromId);
          const toComp = components.find((c) => c.id === toId);
          
          if (!fromComp || !toComp || !fromComp.position || !toComp.position) {
            return null;
          }
          
          return (
            <ConnectionLine
              key={`${fromId}-${toId}`}
              start={fromComp.position}
              end={toComp.position}
              fromId={fromId}
              toId={toId}
              onRemove={() => useLabStore.getState().removeConnection(fromId, toId)}
            />
          );
        })}
        
        <OrbitControls
          enabled={!isDraggingComponent}
          enablePan
          enableZoom
          enableRotate
          minDistance={3}
          maxDistance={20}
        />
      </Canvas>
    </div>
  );
}
