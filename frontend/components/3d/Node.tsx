'use client';

import { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';
import AwsShape from './Shapes';
import * as THREE from 'three';
import { InfrastructureComponent } from '@/types/infrastructure';
import { useLabStore } from '@/store/labStore';
import { Trash2 } from 'lucide-react';

interface NodeProps {
  component: InfrastructureComponent;
}

const componentColors: Record<string, string> = {
  load_balancer: '#ff6b35',
  compute_node: '#4ecdc4',
  database: '#f7b731',
  cache: '#5f27cd',
  message_queue: '#00d2d3',
  lambda: '#ff9500',
  s3: '#569a31',
  dynamodb: '#4053d6',
  cloudfront: '#8c4fff',
  api_gateway: '#ff4f81',
  amplify: '#ff9900',
  rds: '#3b48cc',
  elasticache: '#d32f2f',
  sqs: '#d13212',
  sns: '#ff4785',
};

const componentShapes: Record<string, 'box' | 'sphere' | 'cylinder'> = {
  load_balancer: 'cylinder',
  compute_node: 'box',
  database: 'cylinder',
  cache: 'sphere',
  message_queue: 'box',
  lambda: 'box',
  s3: 'cylinder',
  dynamodb: 'cylinder',
  cloudfront: 'sphere',
  api_gateway: 'box',
  amplify: 'box',
  rds: 'cylinder',
  elasticache: 'sphere',
  sqs: 'box',
  sns: 'box',
};

// Human-friendly labels for AWS and generic types
const typeLabels: Record<string, string> = {
  lambda: 'Lambda',
  s3: 'S3',
  dynamodb: 'DynamoDB',
  cloudfront: 'CloudFront',
  api_gateway: 'API Gateway',
  amplify: 'Amplify',
  rds: 'RDS',
  elasticache: 'ElastiCache',
  sqs: 'SQS',
  sns: 'SNS',
  load_balancer: 'ALB (ELB)',
  compute_node: 'EC2 Compute',
  database: 'Database',
  cache: 'Cache',
  // VPC Networking
  vpc: 'VPC',
  subnet: 'Subnet',
  security_group: 'Security Group',
  nat_gateway: 'NAT Gateway',
  internet_gateway: 'Internet Gateway',
};

export default function Node({ component }: NodeProps) {
  const innerMeshRef = useRef<THREE.Group>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hovered, setHovered] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const dragOffset = useRef<{ x: number; z: number }>({ x: 0, z: 0 });
  
  const handleComponentClick = useLabStore((state) => state.handleComponentClick);
  const updateComponentPosition = useLabStore((state) => state.updateComponentPosition);
  const removeComponent = useLabStore((state) => state.removeComponent);
  const setIsDraggingComponent = useLabStore((state) => state.setIsDraggingComponent);
  const selectedComponentId = useLabStore((state) => state.selectedComponentId);
  const isSelected = selectedComponentId === component.id;
  
  const { camera, gl } = useThree();
  const color = componentColors[component.type] || '#00d4ff';
  const shape = componentShapes[component.type] || 'box';
  
  useFrame((state) => {
    // Only rotate and float the inner mesh group
    if (innerMeshRef.current) {
      innerMeshRef.current.rotation.y += 0.01;
      const floatOffset = Math.sin(state.clock.elapsedTime + (component.position?.x || 0)) * 0.1;
      innerMeshRef.current.position.y = floatOffset;
    }
  });
  
  const handlePointerDown = (e: any) => {
    // Only handle left mouse button (button 0)
    if (e.button !== 0) return;
    
    e.stopPropagation();
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    
    // Calculate offset between mouse position and component center
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(
      (e.clientX / gl.domElement.clientWidth) * 2 - 1,
      -(e.clientY / gl.domElement.clientHeight) * 2 + 1
    );
    
    raycaster.setFromCamera(mouse, camera);
    const intersection = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersection);
    
    if (intersection && component.position) {
      dragOffset.current = {
        x: component.position.x - intersection.x,
        z: component.position.z - intersection.z
      };
    }
    
    setIsDragging(true);
    setIsDraggingComponent(true);
    (e.target as any).setPointerCapture(e.pointerId);
  };
  
  const handlePointerMove = (e: any) => {
    if (isDragging && groupRef.current) {
      e.stopPropagation();
      
      // Calculate new position based on mouse movement in world space
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2(
        (e.clientX / gl.domElement.clientWidth) * 2 - 1,
        -(e.clientY / gl.domElement.clientHeight) * 2 + 1
      );
      
      raycaster.setFromCamera(mouse, camera);
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersection);
      
      if (intersection) {
        // Apply the offset to maintain cursor position
        updateComponentPosition(component.id, {
          x: intersection.x + dragOffset.current.x,
          y: component.position?.y || 1,
          z: intersection.z + dragOffset.current.z
        });
      }
    }
  };
  
  const handlePointerUp = (e: any) => {
    e.stopPropagation();
    (e.target as any).releasePointerCapture(e.pointerId);
    
    // Check if this was a click (minimal movement) or a drag
    const wasDragged = dragStartPos.current && (
      Math.abs(e.clientX - dragStartPos.current.x) > 5 ||
      Math.abs(e.clientY - dragStartPos.current.y) > 5
    );
    
    setIsDragging(false);
    setIsDraggingComponent(false);
    dragStartPos.current = null;
    
    // If it was a click (not a drag), handle component selection
    if (!wasDragged) {
      handleComponentClick(component.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete ${component.type.replace('_', ' ')}?`)) {
      removeComponent(component.id);
    }
  };

  const handlePointerEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setHovered(true);
  };

  const handlePointerLeaveDelayed = () => {
    // Delay hiding to allow mouse to reach button
    hoverTimeoutRef.current = setTimeout(() => {
      setHovered(false);
    }, 300);
  };

  const handleButtonMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setHovered(true);
  };

  const handleButtonMouseLeave = () => {
    setHovered(false);
  };
  
  const geometry = () => null; // replaced by AwsShape component
  
  return (
    <group 
      ref={groupRef}
      position={[component.position?.x || 0, component.position?.y || 0, component.position?.z || 0]}
    >
      {/* Inner group for rotation and floating animation */}
      <group ref={innerMeshRef}>
        <group
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeaveDelayed}
        >
          <AwsShape type={component.type} color={color} isSelected={isSelected} />
        </group>
        
        {/* Soft glow - reduced for outline style */}
        <mesh>
          <sphereGeometry args={[0.75, 16, 16]} />
          <meshBasicMaterial color={color} transparent opacity={isSelected ? 0.08 : 0.02} side={THREE.BackSide} />
        </mesh>
      </group>
      
      <Text
        position={[0, -0.8, 0]}
        fontSize={0.15}
        color="#00d4ff"
        anchorX="center"
        anchorY="middle"
      >
        {typeLabels[component.type] ?? component.type.replace('_', ' ')}
      </Text>

      {/* Delete button on hover */}
      {hovered && !isDragging && (
        <Html position={[0, 1.2, 0]} center distanceFactor={10} zIndexRange={[100, 0]}>
          <div
            onMouseEnter={handleButtonMouseEnter}
            onMouseLeave={handleButtonMouseLeave}
            style={{ pointerEvents: 'all' }}
          >
            <button
              onClick={handleDelete}
              className="bg-red-500/90 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-all hover:scale-110"
              title="Delete component"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </Html>
      )}
    </group>
  );
}
