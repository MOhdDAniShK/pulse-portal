import { useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { api } from '../lib/api';

const MOODS = [
  { value: 1, emoji: '😠', label: 'Poor' },
  { value: 2, emoji: '🙁', label: 'Fair' },
  { value: 3, emoji: '😐', label: 'Good' },
  { value: 4, emoji: '🙂', label: 'Great' },
  { value: 5, emoji: '😍', label: 'Awesome' },
];

const CATEGORIES = [
  { id: 'design', label: 'Design & Aesthetics' },
  { id: 'speed', label: 'Performance & Speed' },
  { id: 'usability', label: 'Ease of Use' },
] as const;

type RatingsState = {
  design: number | null;
  speed: number | null;
  usability: number | null;
};

export function MoodCards() {
  const [ratings, setRatings] = useState<RatingsState>({
    design: null,
    speed: null,
    usability: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelect = (category: keyof RatingsState, value: number) => {
    setRatings(prev => ({ ...prev, [category]: value }));
  };

  const handleSubmit = async (event: React.MouseEvent) => {
    if (isSubmitting || !ratings.design || !ratings.speed || !ratings.usability) return;
    setIsSubmitting(true);
    
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;
    
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { x, y },
      colors: ['#FFC107', '#FF9800', '#FF5722', '#4CAF50', '#2196F3']
    });

    const overallRating = (ratings.design + ratings.speed + ratings.usability) / 3;

    try {
      await api.insertFeedback({
        rating_design: ratings.design,
        rating_speed: ratings.speed,
        rating_usability: ratings.usability,
        rating: Number(overallRating.toFixed(1))
      });
      
      // Reset form
      setRatings({ design: null, speed: null, usability: null });
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isComplete = ratings.design && ratings.speed && ratings.usability;

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-8">
      {CATEGORIES.map((category, catIndex) => (
        <motion.div 
          key={category.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: catIndex * 0.1 }}
          className="glass-dark p-6 rounded-3xl"
        >
          <h3 className="text-white/90 font-medium mb-4 text-lg text-center">{category.label}</h3>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            {MOODS.map((mood) => {
              const isSelected = ratings[category.id] === mood.value;
              return (
                <motion.button
                  key={mood.value}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSelect(category.id, mood.value)}
                  className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl cursor-pointer transition-all duration-300 ${
                    isSelected 
                      ? 'bg-white/30 border border-white/50 shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
                      : 'glass hover:bg-white/20'
                  }`}
                >
                  <span className={`text-3xl sm:text-4xl mb-1 filter drop-shadow-md transition-transform ${isSelected ? 'scale-110' : ''}`}>
                    {mood.emoji}
                  </span>
                  <span className={`text-xs font-medium transition-opacity ${isSelected ? 'text-white opacity-100' : 'text-white/60 opacity-80'}`}>
                    {mood.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      ))}

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isComplete ? 1 : 0.5, y: 0 }}
        disabled={!isComplete || isSubmitting}
        onClick={handleSubmit}
        className={`py-4 px-8 rounded-full font-bold text-lg shadow-xl transition-all duration-300 ${
          isComplete && !isSubmitting
            ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-900 hover:scale-105 hover:shadow-emerald-500/25 cursor-pointer'
            : 'bg-white/10 text-white/40 cursor-not-allowed'
        }`}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
      </motion.button>
    </div>
  );
}
