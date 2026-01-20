'use client';

import { useState, useRef } from 'react';
import { Line } from '@react-three/drei';
import { ThreeEvent } from '@react-three/fiber';

interface ConnectionLineProps {
  start: { x: number; y: number; z: number };
  end: { x: number; y: number; z: number };
  fromId: string;
  toId: string;
  onRemove?: () => void;
}

export default function ConnectionLine({ start, end, fromId, toId, onRemove }: ConnectionLineProps) {
  const [hovered, setHovered] = useState(false);
  const lineRef = useRef<any>();

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (onRemove && confirm(`Disconnect ${fromId} from ${toId}?`)) {
      onRemove();
    }
  };

  return (
    <>
      {/* Main connection line */}
      <Line
        ref={lineRef}
        points={[[start.x, start.y, start.z], [end.x, end.y, end.z]]}
        color={hovered ? "#ff3366" : "#00d4ff"}
        lineWidth={hovered ? 4 : 3}
        transparent
        opacity={hovered ? 0.9 : 0.7}
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = 'default';
        }}
      />
      {/* Glow effect */}
      <Line
        points={[[start.x, start.y, start.z], [end.x, end.y, end.z]]}
        color={hovered ? "#ff1144" : "#0088ff"}
        lineWidth={hovered ? 8 : 6}
        transparent
        opacity={0.2}
      />
    </>
  );
}
