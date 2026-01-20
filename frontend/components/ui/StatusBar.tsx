'use client';

import { useLabStore } from '@/store/labStore';
import { Box, Link2, DollarSign } from 'lucide-react';

export default function StatusBar() {
  const { components, connections, simulationResult } = useLabStore();
  
  const estimatedCost = simulationResult && simulationResult.cost_index
    ? `$${Math.round(simulationResult.cost_index * 2.5)}/mo` 
    : 'Run simulation';
  
  return (
    <div className="fixed bottom-0 left-0 right-0 h-10 bg-slate-900/95 backdrop-blur-md border-t-2 border-primary/30 px-4 flex items-center justify-between text-sm text-primary z-40">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Box size={16} className="text-primary" />
          <span className="font-medium">{components.length} components</span>
        </div>
        <div className="flex items-center gap-2">
          <Link2 size={16} className="text-primary" />
          <span className="font-medium">{connections.length} connections</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <DollarSign size={16} className="text-primary" />
        <span className="font-medium">Est. Cost: {estimatedCost}</span>
      </div>
    </div>
  );
}
