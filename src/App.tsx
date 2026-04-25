import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { api, type Feedback } from './lib/api';
import { LivePulse } from './components/LivePulse';
import { MoodCards } from './components/MoodCards';
import { FeedbackFeed } from './components/FeedbackFeed';
import { Activity } from 'lucide-react';

function App() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [averageRating, setAverageRating] = useState<number | null>(null);

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

  const getBackgroundGradient = useMemo(() => {
    if (averageRating === null) return 'from-slate-900 via-purple-900 to-slate-900';
    if (averageRating < 2.5) return 'from-red-900 via-rose-950 to-red-900';
    if (averageRating < 4) return 'from-yellow-900 via-orange-950 to-amber-900';
    return 'from-emerald-900 via-green-950 to-emerald-900';
  }, [averageRating]);

  // Feed gets only the latest 5 for the sidebar
  const latestFeedbacks = feedbacks.slice(0, 5);

  return (
    <motion.div 
      className={`min-h-screen w-full transition-colors duration-1000 bg-gradient-to-br ${getBackgroundGradient} flex flex-col`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <header className="p-6 lg:p-8 flex items-center justify-between z-10">
        <div className="flex items-center space-x-3 text-white">
          <Activity className="w-8 h-8 text-white/80 animate-pulse-slow" />
          <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            PulsePortal
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center p-6 lg:p-12 gap-12 lg:gap-24 z-10 max-w-7xl mx-auto w-full">
        
        {/* Left Side: Live Pulse & Input */}
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl gap-12">
          <LivePulse 
            averageRating={averageRating} 
            totalRatings={feedbacks.length} 
          />
          <MoodCards />
        </div>

        {/* Right Side: Live Feed */}
        <FeedbackFeed feedbacks={latestFeedbacks} />
        
      </main>

      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl" />
      </div>
    </motion.div>
  );
}

export default App;
