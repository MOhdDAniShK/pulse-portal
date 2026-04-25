import { motion, AnimatePresence } from 'framer-motion';
import { Clock } from 'lucide-react';
import type { Feedback } from '../lib/api';
import { formatDistanceToNow } from 'date-fns';

interface FeedbackFeedProps {
  feedbacks: Feedback[];
}

const MOODS: Record<number, { emoji: string; color: string }> = {
  1: { emoji: '😠', color: 'text-red-400' },
  2: { emoji: '🙁', color: 'text-orange-400' },
  3: { emoji: '😐', color: 'text-yellow-400' },
  4: { emoji: '🙂', color: 'text-green-400' },
  5: { emoji: '😍', color: 'text-emerald-400' },
};

export function FeedbackFeed({ feedbacks }: FeedbackFeedProps) {
  return (
    <div className="w-full max-w-sm glass-dark rounded-2xl p-6 shadow-xl overflow-hidden hidden lg:block">
      <div className="flex items-center space-x-2 mb-6">
        <Clock className="w-5 h-5 text-white/70" />
        <h3 className="text-lg font-medium text-white/90">Live Feed</h3>
      </div>
      
      <div className="space-y-4">
        <AnimatePresence initial={false}>
          {feedbacks.map((item) => {
            const mood = MOODS[item.rating] || MOODS[3];
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, height: 0, x: -20 }}
                animate={{ opacity: 1, height: 'auto', x: 0 }}
                exit={{ opacity: 0, height: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="flex items-center space-x-4 p-3 glass rounded-xl"
              >
                <div className="text-2xl">{mood.emoji}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`font-semibold ${mood.color}`}>
                      Rating: {item.rating}
                    </span>
                    <span className="text-xs text-white/50">
                      {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.rating / 5) * 100}%` }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className={`h-full rounded-full ${
                        item.rating >= 4 ? 'bg-green-400' : item.rating <= 2 ? 'bg-red-400' : 'bg-yellow-400'
                      }`}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
          
          {feedbacks.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-white/50 py-8"
            >
              Waiting for incoming feedback...
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
