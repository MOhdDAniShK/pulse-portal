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
  const [target, setTarget] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleSelect = (category: keyof RatingsState, value: number) => {
    setRatings(prev => ({ ...prev, [category]: value }));
  };

  const handleSubmit = async (event: React.MouseEvent) => {
    if (isSubmitting || !ratings.design || !ratings.speed || !ratings.usability || !target.trim()) return;
    setIsSubmitting(true);
    
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;
    
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { x, y },
      colors: ['#5570F1', '#FF9800', '#FF5722', '#4CAF50', '#2196F3']
    });

    const overallRating = (ratings.design + ratings.speed + ratings.usability) / 3;

    try {
      await api.insertFeedback({
        target: target.trim(),
        comment: comment.trim(),
        rating_design: ratings.design,
        rating_speed: ratings.speed,
        rating_usability: ratings.usability,
        rating: Number(overallRating.toFixed(1))
      });
      
      setRatings({ design: null, speed: null, usability: null });
      setTarget('');
      setComment('');
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isComplete = ratings.design && ratings.speed && ratings.usability && target.trim().length > 0;

  return (
    <div className="w-full max-w-3xl mx-auto p-8 bg-white border border-gray-100 rounded-xl shadow-sm mt-8 mb-16">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Submit Your Review</h2>
        <p className="text-sm text-gray-500 mt-1">Please specify what you are reviewing and rate your experience.</p>
      </div>

      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">What are you reviewing? *</label>
          <input 
            type="text" 
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="e.g., New Homepage, Dashboard Feature, Checkout Process"
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5570F1] focus:border-transparent outline-none transition-all"
          />
        </div>

        {CATEGORIES.map((category, catIndex) => (
          <motion.div 
            key={category.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: catIndex * 0.1 }}
            className="p-6 bg-gray-50 rounded-xl border border-gray-100"
          >
            <h3 className="text-gray-900 font-semibold mb-4 text-center">{category.label} *</h3>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
              {MOODS.map((mood) => {
                const isSelected = ratings[category.id] === mood.value;
                return (
                  <motion.button
                    key={mood.value}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSelect(category.id, mood.value)}
                    className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl cursor-pointer transition-all duration-300 w-24 h-24 ${
                      isSelected 
                        ? 'bg-[#5570F1] text-white shadow-md ring-2 ring-[#5570F1] ring-offset-2' 
                        : 'bg-white border border-gray-200 hover:border-[#5570F1] text-gray-600 hover:text-[#5570F1]'
                    }`}
                  >
                    <span className={`text-3xl sm:text-4xl mb-1 filter drop-shadow-sm transition-transform ${isSelected ? 'scale-110' : ''}`}>
                      {mood.emoji}
                    </span>
                    <span className={`text-xs font-semibold transition-opacity ${isSelected ? 'opacity-100' : 'opacity-80'}`}>
                      {mood.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ))}

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">Additional Comments (Optional)</label>
          <textarea 
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us more about your experience..."
            rows={4}
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5570F1] focus:border-transparent outline-none transition-all resize-none"
          />
        </div>

        <div className="flex flex-col items-center mt-4">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            disabled={!isComplete || isSubmitting}
            onClick={handleSubmit}
            className={`py-4 px-12 rounded-lg font-bold text-lg shadow-sm transition-all duration-300 w-full md:w-auto ${
              isComplete && !isSubmitting
                ? 'bg-[#5570F1] text-white hover:bg-blue-700 hover:shadow-lg cursor-pointer'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </motion.button>
          
          {successMsg && (
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-green-600 font-medium mt-4"
            >
              Review submitted successfully! Thank you.
            </motion.p>
          )}
        </div>
      </div>
    </div>
  );
}
