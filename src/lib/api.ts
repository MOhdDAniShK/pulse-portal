// localStorage-based storage — no database needed

export type Feedback = {
  id: string;
  target: string;
  comment: string;
  rating_design: number;
  rating_speed: number;
  rating_usability: number;
  rating: number;
  created_at: string;
};

const STORAGE_KEY = 'pulse_feedbacks';

function readAll(): Feedback[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(feedbacks: Feedback[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(feedbacks));
}

// Simple event emitter so the dashboard updates instantly
type Listener = (feedbacks: Feedback[]) => void;
const listeners = new Set<Listener>();

function notify() {
  const all = readAll();
  listeners.forEach((fn) => fn(all));
}

export const api = {
  fetchFeedbacks(): Feedback[] {
    return readAll();
  },

  insertFeedback(feedback: Omit<Feedback, 'id' | 'created_at'>): void {
    const entry: Feedback = {
      ...feedback,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    const all = readAll();
    all.unshift(entry);
    writeAll(all);
    notify();
  },

  subscribe(fn: Listener): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};
