'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLabStore } from '@/store/labStore';
import { generateOptimalTopology } from '@/services/api';
import { Sparkles } from 'lucide-react';

export default function AIAssistant() {
  const { goal, clearLab, addComponent, useCase, setUseCase } = useLabStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const typeMap: Record<string, string> = {
    'compute_node': 'lambda',
    'database': 'rds',
    'cache': 'elasticache',
    'message_queue': 'sqs'
  };

  const handleGenerateTopology = async () => {
    if (!useCase.trim()) {
      alert('Please describe your use case first');
      return;
    }

    setIsGenerating(true);
    try {
      const topology = await generateOptimalTopology(goal, useCase);
      clearLab();

      const gridSpacing = 3;
      const cols = Math.ceil(Math.sqrt(topology.components.length));

      topology.components.forEach((comp, idx) => {
        const row = Math.floor(idx / cols);
        const col = idx % cols;
        const x = (col - cols / 2) * gridSpacing;
        const z = (row - Math.floor(topology.components.length / cols) / 2) * gridSpacing;
        const normalizedType = typeMap[comp.type] || comp.type;
        addComponent(normalizedType as any, { x, y: 0, z });
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      const store = useLabStore.getState();
      const compMap = new Map<string, string>();

      topology.components.forEach((aiComp, idx) => {
        const actualComp = store.components[idx];
        if (actualComp) {
          compMap.set(aiComp.id, actualComp.id);
        }
      });

      topology.connections.forEach(([fromAiId, toAiId]) => {
        const fromId = compMap.get(fromAiId);
        const toId = compMap.get(toAiId);
        if (fromId && toId) {
          store.addConnection(fromId, toId);
        }
      });

    } catch (error) {
      console.error('Failed to generate topology:', error);
      alert('Failed to generate topology. Make sure the backend is running.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="relative">
      {/* Icon Button (Always Visible) */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className="panel bg-bg-dark/90 backdrop-blur-md p-3 rounded-lg border border-primary/30"
        title="AI Assistant"
      >
        <Sparkles size={24} className="text-primary" />
      </motion.button>

      {/* Expanded Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full right-0 mb-2 panel bg-bg-dark/95 backdrop-blur-md p-4 rounded-lg border border-primary/30 w-80"
          >
            <h3 className="text-sm font-bold mb-2 text-primary flex items-center gap-2">
              <Sparkles size={16} />
              AI Assistant
            </h3>
            
            <textarea
              value={useCase}
              onChange={(e) => setUseCase(e.target.value)}
              placeholder="Describe your use case (e.g., Comic site with CDN, E-commerce platform...)"
              className="w-full p-2 rounded bg-bg-dark/50 border border-primary/30 text-primary text-xs placeholder-primary/40 focus:border-primary focus:outline-none resize-none"
              rows={3}
            />

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerateTopology}
              disabled={isGenerating}
              className="w-full mt-2 flex items-center justify-center gap-2 p-2 rounded bg-primary/20 border border-primary text-primary text-sm font-bold disabled:opacity-50 hover:bg-primary/30 transition-colors"
            >
              <Sparkles size={16} />
              {isGenerating ? 'Generating...' : 'Generate Topology'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

