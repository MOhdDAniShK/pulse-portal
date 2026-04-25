import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { api } from '../lib/api';
import { ArrowLeft, Box, Star } from 'lucide-react';

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

export const PRODUCTS = [
  { id: 'p1', name: 'Homepage Redesign', description: 'The new landing page experience', icon: '🏠' },
  { id: 'p2', name: 'Mobile App Beta', description: 'iOS and Android beta application', icon: '📱' },
  { id: 'p3', name: 'Checkout Process', description: 'The new 1-click checkout flow', icon: '🛒' },
  { id: 'p4', name: 'Support Dashboard', description: 'Help desk and ticketing system', icon: '🎧' },
];

type RatingsState = { design: number | null; speed: number | null; usability: number | null };

interface MoodCardsProps {
  onSubmitted: () => void;
}

export function MoodCards({ onSubmitted }: MoodCardsProps) {
  const [selectedProduct, setSelectedProduct] = useState<typeof PRODUCTS[0] | null>(null);
  const [ratings, setRatings] = useState<RatingsState>({ design: null, speed: null, usability: null });
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleSelect = (category: keyof RatingsState, value: number) => {
    setRatings(prev => ({ ...prev, [category]: value }));
  };

  const handleSubmit = (event: React.MouseEvent) => {
    if (isSubmitting || !ratings.design || !ratings.speed || !ratings.usability || !selectedProduct) return;
    setIsSubmitting(true);

    const rect = (event.target as HTMLElement).getBoundingClientRect();
    confetti({
      particleCount: 150, spread: 80,
      origin: { x: (rect.left + rect.width / 2) / window.innerWidth, y: (rect.top + rect.height / 2) / window.innerHeight },
      colors: ['#5570F1', '#FF9800', '#FF5722', '#4CAF50', '#2196F3'],
    });

    const overallRating = (ratings.design + ratings.speed + ratings.usability) / 3;

    api.insertFeedback({
      target: selectedProduct.name,
      comment: comment.trim(),
      rating_design: ratings.design,
      rating_speed: ratings.speed,
      rating_usability: ratings.usability,
      rating: Number(overallRating.toFixed(1)),
    });

    setRatings({ design: null, speed: null, usability: null });
    setComment('');
    setSuccessMsg(true);
    setIsSubmitting(false);
    onSubmitted();

    setTimeout(() => {
      setSuccessMsg(false);
      setSelectedProduct(null);
    }, 2500);
  };

  const isComplete = ratings.design && ratings.speed && ratings.usability;

  // --- Compute live stats per product for the product list ---
  const allFeedbacks = api.fetchFeedbacks();
  const statsFor = (name: string) => {
    const items = allFeedbacks.filter(f => f.target === name);
    if (items.length === 0) return { avg: null, count: 0 };
    return { avg: items.reduce((s, f) => s + f.rating, 0) / items.length, count: items.length };
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-8 mb-16">
      <AnimatePresence mode="wait">
        {!selectedProduct ? (
          <motion.div
            key="product-list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Select an Item to Review</h2>
              <p className="text-sm text-gray-500 mt-1">Choose a product or feature below to provide your feedback.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {PRODUCTS.map(product => {
                const { avg, count } = statsFor(product.name);
                return (
                  <button
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className="flex items-start gap-4 p-6 text-left bg-white border border-gray-200 rounded-xl hover:border-[#5570F1] hover:shadow-md transition-all group"
                  >
                    <div className="text-3xl w-12 h-12 flex items-center justify-center bg-blue-50 rounded-xl group-hover:bg-[#5570F1]/10 transition-colors">
                      {product.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 group-hover:text-[#5570F1] transition-colors">{product.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{product.description}</p>
                      <div className="flex items-center gap-3 mt-3">
                        {avg !== null ? (
                          <>
                            <div className="flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs font-bold text-gray-700">{avg.toFixed(1)}</span>
                            </div>
                            <span className="text-xs text-gray-400">·</span>
                            <span className="text-xs text-gray-500">{count} review{count !== 1 ? 's' : ''}</span>
                          </>
                        ) : (
                          <span className="text-xs text-gray-400 italic">No reviews yet</span>
                        )}
                      </div>
                    </div>
                    <Box className="w-5 h-5 text-gray-300 group-hover:text-[#5570F1] transition-colors mt-1" />
                  </button>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="rating-form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white border border-gray-100 rounded-xl shadow-sm p-8"
          >
            <div className="flex items-center gap-4 mb-8">
              <button onClick={() => setSelectedProduct(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-500" />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  <span className="mr-2">{selectedProduct.icon}</span>
                  {selectedProduct.name}
                </h2>
                <p className="text-sm text-gray-500 mt-1">Rate your experience across these categories.</p>
              </div>
            </div>

            <div className="flex flex-col gap-8">
              {CATEGORIES.map((category, catIndex) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: catIndex * 0.1 }}
                  className="p-6 bg-gray-50 rounded-xl border border-gray-100"
                >
                  <h3 className="text-gray-900 font-semibold mb-4 text-center">{category.label}</h3>
                  <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                    {MOODS.map(mood => {
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
                          <span className={`text-3xl sm:text-4xl mb-1 transition-transform ${isSelected ? 'scale-110' : ''}`}>{mood.emoji}</span>
                          <span className={`text-xs font-semibold ${isSelected ? 'opacity-100' : 'opacity-80'}`}>{mood.label}</span>
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
                  onChange={e => setComment(e.target.value)}
                  placeholder="Tell us more about your experience..."
                  rows={3}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5570F1] focus:border-transparent outline-none transition-all resize-none"
                />
              </div>

              <div className="flex flex-col items-center mt-2">
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  disabled={!isComplete || isSubmitting}
                  onClick={handleSubmit}
                  className={`py-4 px-12 rounded-lg font-bold text-lg shadow-sm transition-all duration-300 w-full md:w-auto ${
                    isComplete && !isSubmitting
                      ? 'bg-[#5570F1] text-white hover:bg-[#4460E0] hover:shadow-lg cursor-pointer'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </motion.button>

                {successMsg && (
                  <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-green-600 font-medium mt-4">
                    ✅ Review submitted! Returning to products...
                  </motion.p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
