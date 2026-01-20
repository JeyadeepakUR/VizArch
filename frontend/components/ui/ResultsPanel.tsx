'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useLabStore } from '@/store/labStore';
import { Activity, Gauge, DollarSign, Sparkles, X } from 'lucide-react';

function getLatencyColor(latency: number): string {
  if (latency < 50) return 'text-green-400';
  if (latency < 150) return 'text-yellow-400';
  return 'text-red-400';
}

export default function ResultsPanel() {
  const { simulationResult, isSimulating, setSimulationResult } = useLabStore();
  
  if (!simulationResult && !isSimulating) {
    return null;
  }
  
  return (
    <div className="h-full panel bg-bg-dark/95 backdrop-blur-md border border-primary/30 rounded-lg overflow-y-auto p-4 shadow-2xl">
      {/* Close Button */}
      {simulationResult && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setSimulationResult(null)}
          className="absolute top-2 right-2 p-2 rounded-full bg-primary/20 hover:bg-primary/30 text-primary"
        >
          <X size={20} />
        </motion.button>
      )}

      <h2 className="text-lg font-bold text-primary flex items-center gap-2 mb-4">
        <Sparkles size={20} className="animate-pulse-glow" />
        Simulation Results
      </h2>
      
      {isSimulating ? (
        <div className="flex flex-col items-center justify-center py-16">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
          />
          <p className="mt-6 text-sm text-primary/70">Analyzing infrastructure...</p>
        </div>
      ) : simulationResult ? (
        <div className="space-y-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 100 }}
              className="panel p-4 rounded"
            >
              <Activity size={24} className={`mb-2 ${getLatencyColor(simulationResult.estimated_latency_ms)}`} />
              <div className="text-xs text-primary/60 mb-1">Latency</div>
              <div className={`text-2xl font-bold ${getLatencyColor(simulationResult.estimated_latency_ms)}`}>
                {simulationResult.estimated_latency_ms}ms
              </div>
              <div className="text-xs text-primary/50 mt-1">
                {simulationResult.estimated_latency_ms < 50 ? 'Excellent' : simulationResult.estimated_latency_ms < 150 ? 'Good' : 'Needs optimization'}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
              className="panel p-4 rounded"
            >
              <Gauge size={24} className="mb-2 text-primary" />
              <div className="text-xs text-primary/60 mb-1">Scalability</div>
              <div className="text-2xl font-bold text-primary">
                {simulationResult.scalability_score}/100
              </div>
              <div className="w-full bg-bg-dark/50 rounded-full h-2 mt-2 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${simulationResult.scalability_score}%` }}
                  transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-primary to-accent"
                />
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
              className="panel p-4 rounded"
            >
              <DollarSign size={24} className="mb-2 text-primary" />
              <div className="text-xs text-primary/60 mb-1">Cost Index</div>
              <div className="text-2xl font-bold text-primary">
                {simulationResult.cost_index}/100
              </div>
              <div className="w-full bg-bg-dark/50 rounded-full h-2 mt-2 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${simulationResult.cost_index}%` }}
                  transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-green-500 to-primary"
                />
              </div>
              <div className="text-xs text-primary/50 mt-1">~${Math.round(simulationResult.cost_index * 2.5)}/month</div>
            </motion.div>
          </div>
          
          {/* AI Explanation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="p-4 rounded border border-primary/30 bg-bg-dark/50"
          >
            <div className="flex items-start gap-2">
              <Sparkles size={16} className="text-primary mt-1 flex-shrink-0" />
              <div className="text-sm text-primary/90 leading-relaxed">
                {simulationResult.explanation}
              </div>
            </div>
          </motion.div>
        </div>
      ) : null}
    </div>
  );
}

