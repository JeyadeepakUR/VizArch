'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import ComponentPalette from '@/components/ui/ComponentPalette';
import ControlPanel from '@/components/ui/ControlPanel';
import ResultsPanel from '@/components/ui/ResultsPanel';
import AIAssistant from '@/components/ui/AIAssistant';
import StatusBar from '@/components/ui/StatusBar';
import ComponentTemplates from '@/components/ui/ComponentTemplates';
import ResultsHistory from '@/components/ui/ResultsHistory';
import { useLabStore } from '@/store/labStore';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

// Dynamically import 3D scene to avoid SSR issues
const LabScene = dynamic(() => import('@/components/3d/LabScene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-primary">Loading holographic lab...</div>
    </div>
  ),
});

export default function Home() {
  useKeyboardShortcuts();
  const simulationResult = useLabStore((state) => state.simulationResult);
  const hasResults = !!simulationResult;

  return (
    <main className="h-screen w-screen overflow-hidden bg-[#0a0e27] relative">
      {/* Top Bar - Just action buttons, no header box */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <ResultsHistory />
        <ComponentTemplates />
        <ControlPanel />
      </div>
      
      {/* Main 3D Scene */}
      <div 
        className="h-full panel transition-all duration-300"
        style={{ 
          marginRight: hasResults ? '400px' : '0',
        }}
      >
        <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-primary">Loading...</div>}>
          <LabScene />
        </Suspense>
      </div>
      
      {/* Bottom Left - Component Palette (Hover Overlay) */}
      <div className="fixed bottom-14 left-4 z-30">
        <ComponentPalette />
      </div>
      
      {/* Bottom Right - AI Assistant (Use Case + Generate) */}
      <div className="fixed bottom-14 right-4 z-30">
        <AIAssistant />
      </div>
      
      {/* Right Side - Results Panel (Slides in when active) */}
      <div 
        className={`fixed top-16 right-4 bottom-10 w-[400px] transition-transform duration-300 z-10 ${
          hasResults ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <ResultsPanel />
      </div>
      
      {/* Bottom Status Bar */}
      <StatusBar />
    </main>
  );
}
