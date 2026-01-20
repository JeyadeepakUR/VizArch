'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLabStore } from '@/store/labStore';
import { simulateInfrastructure, generateOptimalTopology, generateProposalPdf } from '@/services/api';
import { Play, Trash2, Target, Sparkles, FileDown } from 'lucide-react';
import { SimulationGoal } from '@/types/infrastructure';

const goals: { value: SimulationGoal; label: string; description: string }[] = [
  { value: 'low_latency', label: 'Low Latency', description: 'Optimize for speed' },
  { value: 'high_availability', label: 'High Availability', description: 'Maximize uptime' },
  { value: 'low_cost', label: 'Low Cost', description: 'Minimize expenses' },
];

export default function ControlPanel() {
  const { 
    components, 
    connections, 
    goal, 
    setGoal, 
    clearLab, 
    setSimulationResult, 
    setIsSimulating,
    isSimulating,
    selectedComponentId,
    addComponent,
    useCase,
    setUseCase
  } = useLabStore();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingProposal, setIsGeneratingProposal] = useState(false);
  
  // Listen for keyboard shortcut trigger
  useEffect(() => {
    const handleTrigger = () => {
      if (components.length > 0 && !isSimulating) {
        handleSimulate();
      }
    };
    window.addEventListener('triggerSimulation', handleTrigger);
    return () => window.removeEventListener('triggerSimulation', handleTrigger);
  }, [components.length, isSimulating]);
  
  // Map generic component types to AWS-specific equivalents for rendering
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
      
      // Clear existing components first
      clearLab();
      
      // Add components with grid positions
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
      
      // Wait a bit for components to be added
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Add connections using the actual generated IDs
      const store = useLabStore.getState();
      const compMap = new Map<string, string>();
      
      // Map AI IDs to actual component IDs
      topology.components.forEach((aiComp, idx) => {
        const actualComp = store.components[idx];
        if (actualComp) {
          compMap.set(aiComp.id, actualComp.id);
        }
      });
      
      // Create connections
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
  
  const handleSimulate = async () => {
    if (components.length === 0) {
      alert('Please add at least one component to the lab');
      return;
    }
    
    setIsSimulating(true);
    setSimulationResult(null);
    
    try {
      const result = await simulateInfrastructure({
        layout: {
          components: components.map(c => ({
            id: c.id,
            type: c.type,
            configuration: c.configuration,
          })),
          connections,
        },
        goal,
      });
      
      setSimulationResult(result);
    } catch (error) {
      console.error('Simulation failed:', error);
      alert('Simulation failed. Make sure the backend is running.');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleGenerateProposal = async () => {
    if (components.length === 0) {
      alert('Please add at least one component to generate a proposal');
      return;
    }

    setIsGeneratingProposal(true);
    try {
      const requestPayload = {
        layout: {
          components: components.map(c => ({
            id: c.id,
            type: c.type,
            configuration: c.configuration,
          })),
          connections,
        },
        goal,
        use_case: useCase,
      };

      const pdfBlob = await generateProposalPdf(requestPayload as any);
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'proposal.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Proposal generation failed:', error);
      alert('Failed to generate proposal. Make sure the backend is running.');
    } finally {
      setIsGeneratingProposal(false);
    }
  };
  
  return (
    <div className="flex items-center gap-2">
      {/* Goal Selector */}
      <select
        value={goal}
        onChange={(e) => setGoal(e.target.value as SimulationGoal)}
        className="px-3 py-2 rounded bg-bg-dark/90 backdrop-blur-md border border-primary/30 text-primary text-sm focus:outline-none focus:border-primary"
      >
        {goals.map(({ value, label }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>

      {/* Run Simulation */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleSimulate}
        disabled={isSimulating || components.length === 0}
        className="flex items-center gap-2 px-3 py-2 rounded bg-primary text-bg-dark text-sm font-bold disabled:opacity-50 hover:bg-accent transition-colors"
        title="Run Simulation"
      >
        <Play size={16} />
        Simulate
      </motion.button>

      {/* Generate PDF */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleGenerateProposal}
        disabled={isGeneratingProposal || components.length === 0}
        className="flex items-center gap-2 px-3 py-2 rounded bg-bg-dark/90 backdrop-blur-md border border-primary text-primary text-sm font-bold disabled:opacity-50 hover:bg-primary/20 transition-colors"
        title="Generate PDF Proposal"
      >
        <FileDown size={16} />
        PDF
      </motion.button>
      
      {/* Clear Lab */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={clearLab}
        disabled={components.length === 0}
        className="flex items-center gap-2 px-3 py-2 rounded bg-bg-dark/90 backdrop-blur-md border border-red-500/50 text-red-400 text-sm disabled:opacity-50 hover:bg-red-500/10 transition-colors"
        title="Clear Lab"
      >
        <Trash2 size={16} />
      </motion.button>
    </div>
  );
}

