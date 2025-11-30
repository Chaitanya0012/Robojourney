import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Map, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AINavigatorPanel } from '@/components/AINavigatorPanel';
import { ProjectNavigatorPanel } from '@/components/ProjectNavigatorPanel';
import { useAuth } from '@/contexts/AuthContext';

type PanelType = 'none' | 'ai-navigator' | 'project-navigator';

export function FloatingAIAssistant() {
  const { user } = useAuth();
  const [activePanel, setActivePanel] = useState<PanelType>('none');
  const [showMenu, setShowMenu] = useState(false);

  const toggleMenu = () => {
    if (activePanel !== 'none') {
      setActivePanel('none');
    } else {
      setShowMenu(!showMenu);
    }
  };

  const openPanel = (panel: PanelType) => {
    setActivePanel(panel);
    setShowMenu(false);
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {showMenu && activePanel === 'none' && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bottom-16 right-0 mb-2 space-y-2"
            >
              <Button
                onClick={() => openPanel('ai-navigator')}
                className="flex items-center gap-2 w-full justify-start bg-card hover:bg-accent border border-border shadow-lg"
                variant="outline"
              >
                <Compass className="h-4 w-4 text-primary" />
                <span>AI Navigator</span>
              </Button>
              <Button
                onClick={() => openPanel('project-navigator')}
                className="flex items-center gap-2 w-full justify-start bg-card hover:bg-accent border border-border shadow-lg"
                variant="outline"
              >
                <Map className="h-4 w-4 text-primary" />
                <span>Project Navigator</span>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={toggleMenu}
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
          >
            {activePanel !== 'none' ? (
              <X className="h-6 w-6" />
            ) : (
              <Sparkles className="h-6 w-6" />
            )}
          </Button>
        </motion.div>
      </div>

      {/* Panel Overlay */}
      <AnimatePresence>
        {activePanel !== 'none' && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed bottom-24 right-6 z-40 w-96 max-h-[70vh] overflow-hidden rounded-xl shadow-2xl border border-border bg-background"
          >
            {activePanel === 'ai-navigator' && (
              <div className="h-[65vh]">
                <AINavigatorPanel onClose={() => setActivePanel('none')} />
              </div>
            )}
            {activePanel === 'project-navigator' && (
              <div className="h-[65vh]">
                <ProjectNavigatorPanel />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
