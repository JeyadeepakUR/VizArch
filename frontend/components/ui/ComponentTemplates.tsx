'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLabStore } from '@/store/labStore';
import { Layers, ChevronDown } from 'lucide-react';
import { ComponentType } from '@/types/infrastructure';

interface Template {
  name: string;
  description: string;
  components: { type: ComponentType; x: number; z: number }[];
  connections: [number, number][]; // indexes into components array
}

const templates: Template[] = [
  {
    name: 'Three-tier Web App',
    description: 'Classic web architecture with load balancer, app servers, and database',
    components: [
      { type: 'load_balancer', x: 0, z: -4 },
      { type: 'lambda', x: -2, z: 0 },
      { type: 'lambda', x: 2, z: 0 },
      { type: 'rds', x: 0, z: 4 },
      { type: 'elasticache', x: 3, z: 4 },
    ],
    connections: [[0, 1], [0, 2], [1, 3], [2, 3], [1, 4], [2, 4]],
  },
  {
    name: 'Serverless API',
    description: 'API Gateway with Lambda functions and DynamoDB',
    components: [
      { type: 'api_gateway', x: 0, z: -3 },
      { type: 'lambda', x: 0, z: 0 },
      { type: 'dynamodb', x: 0, z: 3 },
    ],
    connections: [[0, 1], [1, 2]],
  },
  {
    name: 'Static Website',
    description: 'CloudFront CDN with S3 bucket',
    components: [
      { type: 'cloudfront', x: 0, z: -2 },
      { type: 's3', x: 0, z: 2 },
    ],
    connections: [[0, 1]],
  },
  {
    name: 'Microservices',
    description: 'Multiple services with message queue and cache',
    components: [
      { type: 'api_gateway', x: 0, z: -4 },
      { type: 'lambda', x: -3, z: 0 },
      { type: 'lambda', x: 0, z: 0 },
      { type: 'lambda', x: 3, z: 0 },
      { type: 'sqs', x: 0, z: 2 },
      { type: 'elasticache', x: -2, z: 4 },
      { type: 'dynamodb', x: 2, z: 4 },
    ],
    connections: [[0, 1], [0, 2], [0, 3], [1, 4], [2, 4], [3, 4], [1, 5], [2, 5], [3, 6]],
  },
];

export default function ComponentTemplates() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { clearLab, addComponent } = useLabStore();
  
  const handleApplyTemplate = (template: Template) => {
    clearLab();
    
    // Add all components
    template.components.forEach((comp) => {
      addComponent(comp.type, { x: comp.x, y: 0, z: comp.z });
    });
    
    // Wait for components to be added, then create connections
    setTimeout(() => {
      const store = useLabStore.getState();
      template.connections.forEach(([fromIdx, toIdx]) => {
        const fromId = store.components[fromIdx]?.id;
        const toId = store.components[toIdx]?.id;
        if (fromId && toId) {
          store.addConnection(fromId, toId);
        }
      });
    }, 100);
    
    setIsExpanded(false);
  };
  
  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 px-3 py-2 rounded bg-bg-dark/90 backdrop-blur-md border border-primary/30 text-primary text-sm hover:bg-primary/10 transition-colors"
      >
        <Layers size={16} />
        <span>Templates</span>
        <ChevronDown size={14} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </motion.button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full right-0 mt-2 w-72 panel bg-bg-dark/95 backdrop-blur-md p-3 rounded-lg border border-primary/30 z-50"
          >
            <div className="space-y-2">
              {templates.map((template) => (
                <motion.button
                  key={template.name}
                  whileHover={{ scale: 1.02, x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleApplyTemplate(template)}
                  className="w-full text-left p-3 rounded hover:bg-primary/10 transition-colors border border-primary/20"
                >
                  <div className="font-semibold text-sm text-primary">{template.name}</div>
                  <div className="text-xs text-primary/60 mt-1">{template.description}</div>
                  <div className="text-xs text-primary/40 mt-1">
                    {template.components.length} components, {template.connections.length} connections
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
