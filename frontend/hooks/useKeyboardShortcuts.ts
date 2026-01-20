import { useEffect } from 'react';
import { useLabStore } from '@/store/labStore';

export function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const store = useLabStore.getState();
      
      // Space - Toggle simulation (if components exist)
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        if (store.components.length > 0 && !store.isSimulating) {
          // Trigger simulation by dispatching a custom event
          window.dispatchEvent(new CustomEvent('triggerSimulation'));
        }
      }
      
      // Delete/Backspace - Remove selected component
      if ((e.key === 'Delete' || e.key === 'Backspace') && store.selectedComponentId) {
        e.preventDefault();
        store.removeComponent(store.selectedComponentId);
      }
      
      // Escape - Deselect component
      if (e.key === 'Escape' && store.selectedComponentId) {
        e.preventDefault();
        store.setSelectedComponentId(null);
      }
      
      // Ctrl+Z - Undo (placeholder - would need undo/redo implementation)
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        // TODO: Implement undo
        console.log('Undo not yet implemented');
      }
      
      // Ctrl+Shift+Z or Ctrl+Y - Redo
      if (e.ctrlKey && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault();
        // TODO: Implement redo
        console.log('Redo not yet implemented');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
