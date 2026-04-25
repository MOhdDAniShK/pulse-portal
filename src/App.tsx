import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { api, type Feedback } from './lib/api';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { MoodCards } from './components/MoodCards';

function App() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(api.fetchFeedbacks());
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    // Subscribe to live changes (from insertFeedback calls)
    const unsubscribe = api.subscribe((updated) => {
      setFeedbacks([...updated]);
    });
    return unsubscribe;
  }, []);

  const handleSubmitted = () => {
    // Immediately refresh after a new submission
    setFeedbacks(api.fetchFeedbacks());
  };

  return (
    <div className="flex min-h-screen bg-[#fafafb] text-[#1c1c28]">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 ml-64 flex flex-col">
        <main className="flex-1 relative">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' ? (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                <Dashboard feedbacks={feedbacks} />
              </motion.div>
            ) : (
              <motion.div
                key="submit"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                <div className="max-w-[1400px] mx-auto pt-8">
                  <MoodCards onSubmitted={handleSubmitted} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default App;
