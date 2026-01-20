import { create } from 'zustand';
import { InfrastructureComponent, InfrastructureLayout, SimulationGoal, SimulationResult } from '@/types/infrastructure';

let componentCounter = 0;

interface LabStore {
  components: InfrastructureComponent[];
  connections: [string, string][];
  goal: SimulationGoal;
  simulationResult: SimulationResult | null;
  resultsHistory: Array<{ result: SimulationResult; timestamp: number; componentCount: number }>;
  isSimulating: boolean;
  selectedComponentId: string | null;
  isDraggingComponent: boolean;
  useCase: string;
  
  addComponent: (type: InfrastructureComponent['type'], position: { x: number; y: number; z: number }) => void;
  removeComponent: (id: string) => void;
  updateComponentPosition: (id: string, position: { x: number; y: number; z: number }) => void;
  addConnection: (fromId: string, toId: string) => void;
  removeConnection: (fromId: string, toId: string) => void;
  setGoal: (goal: SimulationGoal) => void;
  setSimulationResult: (result: SimulationResult | null) => void;
  setIsSimulating: (isSimulating: boolean) => void;
  setSelectedComponentId: (id: string | null) => void;
  setIsDraggingComponent: (isDragging: boolean) => void;
  setUseCase: (useCase: string) => void;
  handleComponentClick: (id: string) => void;
  clearLab: () => void;
}

export const useLabStore = create<LabStore>((set) => ({
  components: [],
  connections: [],
  goal: 'low_latency',
  simulationResult: null,
  resultsHistory: [],
  isSimulating: false,
  selectedComponentId: null,
  isDraggingComponent: false,
  useCase: '',
  
  addComponent: (type, position) => set((state) => {
    componentCounter++;
    return {
      components: [
        ...state.components,
        {
          id: `${type}-${Date.now()}-${componentCounter}`,
          type,
          configuration: {},
          position,
        },
      ],
    };
  }),
  
  removeComponent: (id) => set((state) => ({
    components: state.components.filter((c) => c.id !== id),
    connections: state.connections.filter(([from, to]) => from !== id && to !== id),
    selectedComponentId: state.selectedComponentId === id ? null : state.selectedComponentId,
  })),
  
  updateComponentPosition: (id, position) => set((state) => ({
    components: state.components.map((c) => 
      c.id === id ? { ...c, position } : c
    ),
  })),
  
  addConnection: (fromId, toId) => set((state) => {
    const exists = state.connections.some(([f, t]) => f === fromId && t === toId);
    if (exists) return state;
    return {
      connections: [...state.connections, [fromId, toId]],
    };
  }),
  
  removeConnection: (fromId, toId) => set((state) => ({
    connections: state.connections.filter(([f, t]) => !(f === fromId && t === toId)),
  })),
  
  setGoal: (goal) => set({ goal }),
  
  setSimulationResult: (result) => set((state) => {
    if (result) {
      // Add to history (keep last 5)
      const newHistory = [
        { result, timestamp: Date.now(), componentCount: state.components.length },
        ...state.resultsHistory,
      ].slice(0, 5);
      return { simulationResult: result, resultsHistory: newHistory };
    }
    return { simulationResult: result };
  }),
  
  setIsSimulating: (isSimulating) => set({ isSimulating }),
  
  setSelectedComponentId: (id) => set({ selectedComponentId: id }),
  
  setIsDraggingComponent: (isDragging) => set({ isDraggingComponent: isDragging }),
  
  setUseCase: (useCase) => set({ useCase }),
  
  handleComponentClick: (id) => set((state) => {
    // If no component is selected, select this one
    if (!state.selectedComponentId) {
      return { selectedComponentId: id };
    }
    
    // If clicking the same component, deselect
    if (state.selectedComponentId === id) {
      return { selectedComponentId: null };
    }
    
    // If a different component is selected, create connection
    const fromId = state.selectedComponentId;
    const toId = id;
    
    // Check if connection already exists
    const exists = state.connections.some(
      ([f, t]) => (f === fromId && t === toId) || (f === toId && t === fromId)
    );
    
    if (!exists) {
      return {
        connections: [...state.connections, [fromId, toId]],
        selectedComponentId: null,
      };
    }
    
    // Connection exists, just deselect
    return { selectedComponentId: null };
  }),
  
  clearLab: () => set({
    components: [],
    connections: [],
    simulationResult: null,
    selectedComponentId: null,
  }),
}));
