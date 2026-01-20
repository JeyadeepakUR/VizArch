'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLabStore } from '@/store/labStore';
import { ComponentType } from '@/types/infrastructure';
import { 
  Server, Database, Zap, HardDrive, MessageSquare,
  Cloud, Box, Layers, Globe, Workflow, Radio, Menu, Search
} from 'lucide-react';

interface ComponentInfo {
  type: ComponentType;
  icon: React.ReactNode;
  label: string;
  color: string;
  cost: string;
  latency: string;
  description: string;
}

const componentTypes: ComponentInfo[] = [
  // AWS Services
  { type: 'lambda', icon: <Zap size={18} />, label: 'Lambda', color: '#ff9500', cost: '~$5/mo', latency: '15ms', description: 'Serverless compute' },
  { type: 's3', icon: <Box size={18} />, label: 'S3', color: '#569a31', cost: '~$3/mo', latency: '10ms', description: 'Object storage' },
  { type: 'dynamodb', icon: <Database size={18} />, label: 'DynamoDB', color: '#4053d6', cost: '~$8/mo', latency: '8ms', description: 'NoSQL database' },
  { type: 'cloudfront', icon: <Globe size={18} />, label: 'CloudFront', color: '#8c4fff', cost: '~$10/mo', latency: '5ms', description: 'CDN service' },
  { type: 'api_gateway', icon: <Workflow size={18} />, label: 'API Gateway', color: '#ff4f81', cost: '~$5/mo', latency: '12ms', description: 'API management' },
  { type: 'amplify', icon: <Cloud size={18} />, label: 'Amplify', color: '#ff9900', cost: '~$15/mo', latency: '8ms', description: 'Full-stack hosting' },
  { type: 'rds', icon: <Database size={18} />, label: 'RDS', color: '#3b48cc', cost: '~$120/mo', latency: '20ms', description: 'Relational database' },
  { type: 'elasticache', icon: <HardDrive size={18} />, label: 'ElastiCache', color: '#d32f2f', cost: '~$50/mo', latency: '3ms', description: 'In-memory cache' },
  { type: 'sqs', icon: <MessageSquare size={18} />, label: 'SQS', color: '#d13212', cost: '~$3/mo', latency: '10ms', description: 'Message queue' },
  { type: 'sns', icon: <Radio size={18} />, label: 'SNS', color: '#ff4785', cost: '~$3/mo', latency: '8ms', description: 'Notification service' },
  { type: 'load_balancer', icon: <Layers size={18} />, label: 'ALB', color: '#ff6b35', cost: '~$20/mo', latency: '5ms', description: 'Load balancing' },
  { type: 'compute_node', icon: <Server size={18} />, label: 'EC2', color: '#4ecdc4', cost: '~$40/mo', latency: '2ms', description: 'Virtual server' },
  { type: 'vpc', icon: <Box size={18} />, label: 'VPC', color: '#2e7d32', cost: 'Free', latency: '0ms', description: 'Virtual network' },
  { type: 'subnet', icon: <Layers size={18} />, label: 'Subnet', color: '#558b2f', cost: 'Free', latency: '0ms', description: 'Network segment' },
  { type: 'security_group', icon: <Server size={18} />, label: 'SecGroup', color: '#ffa726', cost: 'Free', latency: '0ms', description: 'Firewall rules' },
  { type: 'nat_gateway', icon: <Globe size={18} />, label: 'NAT GW', color: '#5c6bc0', cost: '~$35/mo', latency: '5ms', description: 'Outbound gateway' },
  { type: 'internet_gateway', icon: <Globe size={18} />, label: 'IGW', color: '#26a69a', cost: 'Free', latency: '3ms', description: 'Internet gateway' },
];

export default function ComponentPalette() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null);
  const addComponent = useLabStore((state) => state.addComponent);
  
  const filteredComponents = componentTypes.filter(comp => 
    comp.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    comp.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleAddComponent = (type: ComponentType) => {
    const position = {
      x: (Math.random() - 0.5) * 6,
      y: 1,
      z: (Math.random() - 0.5) * 6,
    };
    addComponent(type, position);
  };
  
  return (
    <div 
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className="relative"
    >
      {/* Burger Button (Always Visible) */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="panel bg-bg-dark/90 backdrop-blur-md p-3 rounded-lg cursor-pointer border border-primary/30"
      >
        <Menu size={24} className="text-primary" />
      </motion.div>
      
      {/* Expanded Palette (Slides up on hover) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full left-0 mb-2 w-64 max-h-[70vh] overflow-hidden panel bg-bg-dark/95 backdrop-blur-md rounded-lg border border-primary/30 flex flex-col"
          >
            <div className="p-3 border-b border-primary/20">
              <h3 className="text-sm font-bold mb-2 text-primary">Components</h3>
              <div className="relative">
                <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-primary/50" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-8 pr-2 py-1.5 text-xs rounded bg-bg-dark/50 border border-primary/30 text-primary placeholder-primary/40 focus:border-primary focus:outline-none"
                />
              </div>
            </div>
            <div className="overflow-y-auto p-3 space-y-1">
              {filteredComponents.map(({ type, icon, label, color, cost, latency, description }) => (
                <div key={type} className="relative">
                  <motion.button
                    whileHover={{ scale: 1.02, x: 3 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAddComponent(type)}
                    onMouseEnter={() => setHoveredComponent(type)}
                    onMouseLeave={() => setHoveredComponent(null)}
                    className="w-full flex items-center gap-2 p-2 rounded hover:bg-primary/10 transition-all text-left relative z-10"
                    style={{ borderLeft: `2px solid ${color}` }}
                  >
                    <div style={{ color }}>{icon}</div>
                    <span className="text-xs text-primary">{label}</span>
                  </motion.button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Tooltip rendered outside to avoid overflow clipping */}
      {isExpanded && hoveredComponent && (
        <div className="fixed left-72 bottom-20 w-56 p-4 bg-slate-800 border-2 border-primary rounded-lg z-[100] shadow-2xl">
          {(() => {
            const comp = componentTypes.find(c => c.type === hoveredComponent);
            return comp ? (
              <>
                <div className="text-sm font-bold text-primary mb-2">{comp.label}</div>
                <div className="text-sm text-slate-300 mb-2">{comp.description}</div>
                <div className="text-xs text-primary/80 flex items-center gap-2 pt-2 border-t border-primary/20">
                  <span className="font-semibold">{comp.cost}</span>
                  <span>•</span>
                  <span className="font-semibold">{comp.latency}</span>
                </div>
              </>
            ) : null;
          })()}
        </div>
      )}
    </div>
  );
}

