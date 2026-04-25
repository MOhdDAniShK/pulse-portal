import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api, type Feedback } from './lib/api';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { MoodCards } from './components/MoodCards';

function App() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    // Initial fetch
    const fetchInitialData = async () => {
      try {
        const data = await api.fetchFeedbacks();
        setFeedbacks(data);
        calculateAverage(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchInitialData();

    // Subscribe to realtime changes
    const unsubscribe = api.subscribeToFeedbacks((newFeedback) => {
      setFeedbacks((current) => {
        const updated = [newFeedback, ...current].slice(0, 50);
        calculateAverage(updated);
        return updated;
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const calculateAverage = (data: Feedback[]) => {
    if (data.length === 0) {
      setAverageRating(null);
      return;
    }
    const sum = data.reduce((acc, curr) => acc + curr.rating, 0);
    setAverageRating(sum / data.length);
  };

  return (
    <div className="flex min-h-screen bg-[#fafafb] text-[#1c1c28]">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 ml-64 flex flex-col">
        <Header />
        
        <main className="flex-1 p-6 relative">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' ? (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <DashboardView feedbacks={feedbacks} averageRating={averageRating} />
              </motion.div>
            ) : (
              <motion.div
                key="submit"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="max-w-[1600px] mx-auto pt-8">
                  <MoodCards />
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
