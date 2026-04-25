import { supabase } from './supabase';

export type Feedback = {
  id: string;
  rating_design: number;
  rating_speed: number;
  rating_usability: number;
  rating: number;
  created_at: string;
};

// Check if Supabase is actually configured
const isSupabaseConfigured = 
  import.meta.env.VITE_SUPABASE_URL && 
  import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder-project.supabase.co';

// Fallback local state for when Supabase is not configured
let localFeedbacks: Feedback[] = [];
const channel = new BroadcastChannel('feedback_sync');

export const api = {
  async fetchFeedbacks(): Promise<Feedback[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as Feedback[];
    } else {
      // Mock / LocalStorage fallback
      const stored = localStorage.getItem('mock_feedbacks');
      if (stored) {
        localFeedbacks = JSON.parse(stored);
      }
      return localFeedbacks;
    }
  },

  async insertFeedback(feedback: Omit<Feedback, 'id' | 'created_at'>): Promise<void> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('feedback').insert([feedback]);
      if (error) throw error;
    } else {
      // Mock / LocalStorage fallback
      const newFeedback: Feedback = {
        ...feedback,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
      };
      localFeedbacks = [newFeedback, ...localFeedbacks].slice(0, 50);
      localStorage.setItem('mock_feedbacks', JSON.stringify(localFeedbacks));
      channel.postMessage({ type: 'INSERT', payload: newFeedback });
    }
  },

  subscribeToFeedbacks(callback: (feedback: Feedback) => void): () => void {
    if (isSupabaseConfigured) {
      const sub = supabase
        .channel('public:feedback')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'feedback' },
          (payload) => {
            callback(payload.new as Feedback);
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(sub);
      };
    } else {
      // Mock / LocalStorage fallback
      const listener = (event: MessageEvent) => {
        if (event.data.type === 'INSERT') {
          callback(event.data.payload);
        }
      };
      channel.addEventListener('message', listener);
      return () => {
        channel.removeEventListener('message', listener);
      };
    }
  }
};
