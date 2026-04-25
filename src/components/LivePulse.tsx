import { motion } from 'framer-motion';

interface LivePulseProps {
  averageRating: number | null;
  totalRatings: number;
}

export function LivePulse({ averageRating, totalRatings }: LivePulseProps) {
  const displayRating = averageRating !== null ? averageRating.toFixed(1) : '--';

  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, type: 'spring' }}
      className="flex flex-col items-center justify-center p-8 glass-dark rounded-3xl shadow-2xl relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      
      <h2 className="text-xl font-medium text-white/80 mb-2 uppercase tracking-widest">
        Live Pulse
      </h2>
      
      <div className="relative">
        <motion.div 
          key={displayRating}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-7xl md:text-9xl font-bold text-white drop-shadow-lg tabular-nums tracking-tighter"
        >
          {displayRating}
        </motion.div>
      </div>
      
      <div className="mt-4 flex items-center space-x-2 text-white/60 font-medium">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>
        <span>{totalRatings} Total Ratings</span>
      </div>
    </motion.div>
  );
}
