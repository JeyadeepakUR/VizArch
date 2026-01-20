'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLabStore } from '@/store/labStore';
import { History, ChevronDown } from 'lucide-react';

export default function ResultsHistory() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { resultsHistory, setSimulationResult } = useLabStore();
  
  if (resultsHistory.length === 0) return null;
  
  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 px-3 py-2 rounded bg-bg-dark/90 backdrop-blur-md border border-primary/30 text-primary text-sm hover:bg-primary/10 transition-colors"
      >
        <History size={16} />
        <span className="text-xs">History ({resultsHistory.length})</span>
        <ChevronDown size={14} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </motion.button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full right-0 mt-2 w-72 panel bg-bg-dark/95 backdrop-blur-md p-3 rounded-lg border border-primary/30 z-50 max-h-96 overflow-y-auto"
          >
            <h3 className="text-sm font-bold mb-2 text-primary">Recent Results</h3>
            <div className="space-y-2">
              {resultsHistory.map((item, idx) => (
                <motion.button
                  key={item.timestamp}
                  whileHover={{ scale: 1.02, x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSimulationResult(item.result);
                    setIsExpanded(false);
                  }}
                  className="w-full text-left p-3 rounded hover:bg-primary/10 transition-colors border border-primary/20"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-primary/60">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="text-xs text-primary/50">{item.componentCount} components</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="text-primary/60">Latency</div>
                      <div className="font-semibold text-primary">{item.result.estimated_latency_ms}ms</div>
                    </div>
                    <div>
                      <div className="text-primary/60">Scale</div>
                      <div className="font-semibold text-primary">{item.result.scalability_score}/100</div>
                    </div>
                    <div>
                      <div className="text-primary/60">Cost</div>
                      <div className="font-semibold text-primary">{item.result.cost_index}/100</div>
                    </div>
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
