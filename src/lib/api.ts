import { io } from 'socket.io-client';

export type Feedback = {
  id: string;
  rating_design: number;
  rating_speed: number;
  rating_usability: number;
  rating: number;
  created_at: string;
};

// Use the local server or deployed URL
const SERVER_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const socket = io(SERVER_URL);

export const api = {
  async fetchFeedbacks(): Promise<Feedback[]> {
    try {
      const response = await fetch(`${SERVER_URL}/api/feedback`);
      if (!response.ok) throw new Error('Failed to fetch');
      return await response.json();
    } catch (error) {
      console.warn('Failed to fetch from server, falling back to empty array.', error);
      return [];
    }
  },

  async insertFeedback(feedback: Omit<Feedback, 'id' | 'created_at'>): Promise<void> {
    return new Promise((resolve) => {
      socket.emit('submit_feedback', feedback);
      resolve();
    });
  },

  subscribeToFeedbacks(callback: (feedback: Feedback) => void): () => void {
    const listener = (newFeedback: Feedback) => {
      callback(newFeedback);
    };
    
    socket.on('new_feedback', listener);
    
    return () => {
      socket.off('new_feedback', listener);
    };
  }
};
