import { supabase } from './supabase';

export type Feedback = {
  id: string;
  rating_design: number;
  rating_speed: number;
  rating_usability: number;
  rating: number;
  created_at: string;
};

// Ensure API fails gracefully if Supabase is not configured
const isConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder-project.supabase.co';

export const api = {
  async fetchFeedbacks(): Promise<Feedback[]> {
    if (!isConfigured) {
      console.warn('Supabase is not configured. Please add VITE_SUPABASE_URL to your .env.local file.');
      return [];
    }

    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (error) throw error;
    return data as Feedback[];
  },

  async insertFeedback(feedback: Omit<Feedback, 'id' | 'created_at'>): Promise<void> {
    if (!isConfigured) {
      alert('Database connection missing! Add VITE_SUPABASE_URL to .env.local');
      return;
    }

    const { error } = await supabase.from('feedback').insert([feedback]);
    if (error) throw error;
  },

  subscribeToFeedbacks(callback: (feedback: Feedback) => void): () => void {
    if (!isConfigured) return () => {};

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
  }
};
