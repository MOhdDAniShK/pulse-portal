// ── Types ──
export type Category = 'All' | 'Products' | 'Services' | 'Ideas' | 'Projects' | 'Tools' | 'Players';

export interface Rating { userId: string; userName: string; score: number; review: string; createdAt: string; }
export interface Item {
  _id: string; name: string; tagline: string; description: string; link: string;
  category: Exclude<Category, 'All'>; image: string; upvotes: number;
  upvotedBy: string[]; ratings: Rating[];
  submittedBy: string; submittedAt: string;
}

export interface FeedbackEntry {
  itemId: string; itemName: string; itemImage: string; itemCategory: string;
  userId: string; userName: string; score: number; review: string; createdAt: string;
}

export interface AnalyticsData {
  totalItems: number; totalUpvotes: number; totalRatings: number; avgRating: number;
  categories: Record<string, { count: number; upvotes: number; ratings: number }>;
  topRated: (Item & { avgRating: number })[];
  topUpvoted: Item[];
  ratingDist: number[];
  monthlyData: Record<string, number>;
  recentActivity: { itemName: string; itemImage: string; userName: string; score: number; review: string; createdAt: string }[];
}

export const SESSION_ID = (() => {
  let id = localStorage.getItem('rms_session');
  if (!id) { id = 'u_' + Math.random().toString(36).slice(2, 10); localStorage.setItem('rms_session', id); }
  return id;
})();

// ── User Profile ──
export interface UserProfile { name: string; avatar: string; bio: string; }
export function getUserProfile(): UserProfile {
  try {
    const d = JSON.parse(localStorage.getItem('rms_profile') || '{}');
    return { name: d.name || '', avatar: d.avatar || '⚡', bio: d.bio || '' };
  } catch { return { name: '', avatar: '⚡', bio: '' }; }
}
export function setUserProfile(p: UserProfile) { localStorage.setItem('rms_profile', JSON.stringify(p)); }

// ── Helpers ──
export function getAvgRating(item: Item): number { if (!item.ratings.length) return 0; return item.ratings.reduce((s, r) => s + r.score, 0) / item.ratings.length; }
export function getRatingDistribution(item: Item): number[] { const d = [0, 0, 0, 0, 0]; item.ratings.forEach(r => { if (r.score >= 1 && r.score <= 5) d[r.score - 1]++; }); return d; }
export function timeAgo(date: string): string {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return 'just now'; if (s < 3600) return Math.floor(s / 60) + 'm ago';
  if (s < 86400) return Math.floor(s / 3600) + 'h ago'; return Math.floor(s / 86400) + 'd ago';
}

// ── API Base URL ──
const API_BASE = import.meta.env.VITE_API_URL || '';

// ── Auth ──
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  provider: 'google';
}

export async function fetchCurrentUser(): Promise<{ authenticated: boolean; user: AuthUser | null }> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/me`, { credentials: 'include' });
    if (!res.ok) return { authenticated: false, user: null };
    return await res.json();
  } catch {
    return { authenticated: false, user: null };
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await fetch(`${API_BASE}/api/auth/logout`, { method: 'POST', credentials: 'include' });
  } catch { /* ignore */ }
}

// ── Helper: try API, fallback to local ──
async function apiCall<T>(url: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, { ...options, credentials: 'include' });
    if (!res.ok) throw new Error(`${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`API call failed for ${url}:`, err);
    return null;
  }
}

// ── LocalStorage Fallback ──
const LS_KEY = 'rms_items_v1';
function uid() { return Math.random().toString(36).slice(2, 10); }
function daysAgo(d: number) { return new Date(Date.now() - d * 86400000).toISOString(); }

function getSeedData(): Item[] {
  const r = (u: string, s: number, rev: string, d: number): Rating => ({ userId: 'seed_' + u.toLowerCase(), userName: u, score: s, review: rev, createdAt: daysAgo(d) });
  return [
    { _id: uid(), name: 'ChatGPT', tagline: 'AI assistant for writing, coding, and analysis', image: 'https://www.google.com/s2/favicons?domain=chat.openai.com&sz=128', description: 'ChatGPT by OpenAI is an advanced AI assistant that can help with writing, coding, research, analysis, and creative tasks.', link: 'https://chat.openai.com', category: 'Products', upvotes: 284, upvotedBy: [], ratings: [r('Alex',5,'Revolutionary tool for productivity',1),r('Sam',4,'Great but sometimes hallucinates',2),r('Morgan',5,'Use it daily',3),r('Quinn',4,'Impressive',4),r('Dev',5,'Best AI tool',5),r('Taylor',5,'Changed how I work',2),r('Riley',4,'Helpful for brainstorming',3)], submittedBy: 'seed_admin', submittedAt: daysAgo(14) },
    { _id: uid(), name: 'Notion', tagline: 'All-in-one workspace for notes, docs, and projects', image: 'https://www.google.com/s2/favicons?domain=notion.so&sz=128', description: 'Notion combines notes, docs, wikis, and project management into one connected workspace.', link: 'https://notion.so', category: 'Products', upvotes: 198, upvotedBy: [], ratings: [r('Sam',5,'Perfect for team docs',2),r('Jordan',4,'Great but slow',3),r('Morgan',5,'Replaced 5 tools',1),r('Chris',4,'Love flexibility',5),r('Taylor',5,'Best workspace',4)], submittedBy: 'seed_admin', submittedAt: daysAgo(12) },
    { _id: uid(), name: 'Figma', tagline: 'Collaborative design tool for teams', image: 'https://www.google.com/s2/favicons?domain=figma.com&sz=128', description: 'Figma is a cloud-based design platform for building UIs and prototyping.', link: 'https://figma.com', category: 'Tools', upvotes: 176, upvotedBy: [], ratings: [r('Alex',5,'Industry standard',2),r('Dev',5,'Collaboration unmatched',1),r('Pat',4,'Better than Sketch',4),r('Casey',5,'Dev mode saves hours',3)], submittedBy: 'seed_admin', submittedAt: daysAgo(10) },
    { _id: uid(), name: 'Stripe', tagline: 'Payment infrastructure for the internet', image: 'https://www.google.com/s2/favicons?domain=stripe.com&sz=128', description: 'Stripe provides APIs for online payment processing.', link: 'https://stripe.com', category: 'Services', upvotes: 165, upvotedBy: [], ratings: [r('Jordan',5,'Best payment API',3),r('Dev',5,'Excellent docs',1),r('Quinn',4,'Easy to integrate',5),r('Taylor',5,'Seamless checkout',2)], submittedBy: 'seed_admin', submittedAt: daysAgo(11) },
    { _id: uid(), name: 'Linear', tagline: 'Issue tracking built for speed', image: 'https://www.google.com/s2/favicons?domain=linear.app&sz=128', description: 'Linear is a modern project management tool for high-performance teams.', link: 'https://linear.app', category: 'Tools', upvotes: 142, upvotedBy: [], ratings: [r('Alex',5,'Fastest PM tool',1),r('Sam',5,'Jira killer',2),r('Morgan',4,'Love shortcuts',4),r('Dev',5,'Beautiful and fast',3)], submittedBy: 'seed_admin', submittedAt: daysAgo(9) },
    { _id: uid(), name: 'Vercel', tagline: 'Frontend cloud platform for developers', image: 'https://www.google.com/s2/favicons?domain=vercel.com&sz=128', description: 'Vercel provides infrastructure to build and deploy web applications.', link: 'https://vercel.com', category: 'Services', upvotes: 138, upvotedBy: [], ratings: [r('Dev',5,'Deploy in seconds',1),r('Jordan',4,'Great DX',3),r('Taylor',5,'Preview deploys are amazing',2)], submittedBy: 'seed_admin', submittedAt: daysAgo(8) },
    { _id: uid(), name: 'Spotify', tagline: 'Music streaming for everyone', image: 'https://www.google.com/s2/favicons?domain=spotify.com&sz=128', description: 'Spotify gives access to millions of songs, podcasts, and audiobooks.', link: 'https://spotify.com', category: 'Products', upvotes: 156, upvotedBy: [], ratings: [r('Pat',5,'Best music app',1),r('Riley',4,'Discover Weekly is magic',2),r('Avery',5,'Great podcasts',4),r('Skyler',3,'Too many ads on free',3)], submittedBy: 'seed_admin', submittedAt: daysAgo(13) },
    { _id: uid(), name: 'Tailwind CSS', tagline: 'Utility-first CSS framework', image: 'https://www.google.com/s2/favicons?domain=tailwindcss.com&sz=128', description: 'Tailwind CSS lets you build modern designs directly in your markup.', link: 'https://tailwindcss.com', category: 'Tools', upvotes: 134, upvotedBy: [], ratings: [r('Dev',5,'Changed how I write CSS',1),r('Alex',5,'So productive',2),r('Casey',4,'HTML can get verbose',4),r('Quinn',5,'v4 is amazing',3)], submittedBy: 'seed_admin', submittedAt: daysAgo(7) },
    { _id: uid(), name: 'GitHub Copilot', tagline: 'AI pair programmer for your editor', image: 'https://www.google.com/s2/favicons?domain=github.com&sz=128', description: 'GitHub Copilot uses AI to suggest code completions and entire functions.', link: 'https://github.com/features/copilot', category: 'Products', upvotes: 167, upvotedBy: [], ratings: [r('Dev',5,'Like a senior dev next to you',1),r('Jordan',4,'Great for boilerplate',2),r('Sam',4,'Sometimes wrong patterns',3),r('Taylor',5,'Saves hours daily',4)], submittedBy: 'seed_admin', submittedAt: daysAgo(6) },
    { _id: uid(), name: 'Supabase', tagline: 'Open source Firebase alternative', image: 'https://www.google.com/s2/favicons?domain=supabase.com&sz=128', description: 'Supabase provides Postgres, auth, APIs, edge functions, and storage.', link: 'https://supabase.com', category: 'Services', upvotes: 119, upvotedBy: [], ratings: [r('Dev',5,'All-in-one backend',1),r('Alex',4,'Great for MVPs',3),r('Quinn',5,'Edge functions are powerful',2)], submittedBy: 'seed_admin', submittedAt: daysAgo(5) },
    { _id: uid(), name: 'Canva', tagline: 'Design anything, publish anywhere', image: 'https://www.google.com/s2/favicons?domain=canva.com&sz=128', description: 'Canva makes graphic design accessible to everyone.', link: 'https://canva.com', category: 'Products', upvotes: 143, upvotedBy: [], ratings: [r('Pat',5,'Perfect for non-designers',1),r('Jamie',4,'Templates save time',2),r('Avery',5,'Magic resize is brilliant',3)], submittedBy: 'seed_admin', submittedAt: daysAgo(11) },
    { _id: uid(), name: 'Midjourney', tagline: 'AI-powered image generation', image: 'https://www.google.com/s2/favicons?domain=midjourney.com&sz=128', description: 'Midjourney creates stunning AI artwork from text prompts.', link: 'https://midjourney.com', category: 'Products', upvotes: 131, upvotedBy: [], ratings: [r('Alex',5,'Art quality is incredible',1),r('Morgan',4,'Great for concept art',2),r('Casey',5,'v6 is photorealistic',3)], submittedBy: 'seed_admin', submittedAt: daysAgo(10) },
    { _id: uid(), name: 'Railway', tagline: 'Infrastructure made simple', image: 'https://www.google.com/s2/favicons?domain=railway.app&sz=128', description: 'Railway lets you deploy apps and databases with zero DevOps.', link: 'https://railway.app', category: 'Services', upvotes: 98, upvotedBy: [], ratings: [r('Dev',5,'Easiest deployment',1),r('Jordan',4,'Great for side projects',3),r('Taylor',5,'Replaced Heroku',2)], submittedBy: 'seed_admin', submittedAt: daysAgo(4) },
    { _id: uid(), name: 'Arc Browser', tagline: 'A browser built for the way we use the internet', image: 'https://www.google.com/s2/favicons?domain=arc.net&sz=128', description: 'Arc reimagines the web browser with spaces and profiles.', link: 'https://arc.net', category: 'Products', upvotes: 112, upvotedBy: [], ratings: [r('Sam',4,'Beautiful but heavy',1),r('Quinn',5,'Spaces changed my workflow',2),r('Pat',4,'Best browser design',4)], submittedBy: 'seed_admin', submittedAt: daysAgo(8) },
    { _id: uid(), name: 'Obsidian', tagline: 'Private and flexible note-taking app', image: 'https://www.google.com/s2/favicons?domain=obsidian.md&sz=128', description: 'Obsidian is a knowledge base on local Markdown files.', link: 'https://obsidian.md', category: 'Tools', upvotes: 108, upvotedBy: [], ratings: [r('Morgan',5,'Best for power users',1),r('Alex',5,'Plugin ecosystem is amazing',2),r('Dev',4,'Local-first is great',3)], submittedBy: 'seed_admin', submittedAt: daysAgo(9) },
    { _id: uid(), name: 'Framer', tagline: 'Ship sites with style, no code needed', image: 'https://www.google.com/s2/favicons?domain=framer.com&sz=128', description: 'Framer lets you design and publish stunning websites without code.', link: 'https://framer.com', category: 'Tools', upvotes: 95, upvotedBy: [], ratings: [r('Casey',5,'Best no-code builder',1),r('Pat',4,'Smooth animations',3),r('Avery',5,'Replaced Webflow',2)], submittedBy: 'seed_admin', submittedAt: daysAgo(6) },
    { _id: uid(), name: 'Loom', tagline: 'Record and share video messages', image: 'https://www.google.com/s2/favicons?domain=loom.com&sz=128', description: 'Loom lets you record quick video messages for async communication.', link: 'https://loom.com', category: 'Services', upvotes: 87, upvotedBy: [], ratings: [r('Taylor',5,'Replaced many meetings',1),r('Quinn',4,'AI summary is great',2),r('Sam',4,'Good for bug reports',4)], submittedBy: 'seed_admin', submittedAt: daysAgo(7) },
    { _id: uid(), name: 'Excalidraw', tagline: 'Virtual whiteboard for sketching', image: 'https://www.google.com/s2/favicons?domain=excalidraw.com&sz=128', description: 'Excalidraw is an open-source whiteboard for hand-drawn diagrams.', link: 'https://excalidraw.com', category: 'Tools', upvotes: 92, upvotedBy: [], ratings: [r('Dev',5,'Perfect for diagrams',1),r('Jordan',5,'Hand-drawn style is charming',2),r('Alex',4,'Collab works great',3)], submittedBy: 'seed_admin', submittedAt: daysAgo(5) },
    { _id: uid(), name: 'Cal.com', tagline: 'Open source scheduling infrastructure', image: 'https://www.google.com/s2/favicons?domain=cal.com&sz=128', description: 'Cal.com is an open-source Calendly alternative.', link: 'https://cal.com', category: 'Projects', upvotes: 76, upvotedBy: [], ratings: [r('Quinn',5,'Best OSS scheduling',1),r('Taylor',4,'Self-hosting is great',3),r('Riley',4,'Good customization',2)], submittedBy: 'seed_admin', submittedAt: daysAgo(3) },
    { _id: uid(), name: 'Hacker News', tagline: 'Tech community news and discussion', image: 'https://www.google.com/s2/favicons?domain=news.ycombinator.com&sz=128', description: 'Hacker News is a social news site for CS and entrepreneurship.', link: 'https://news.ycombinator.com', category: 'Projects', upvotes: 104, upvotedBy: [], ratings: [r('Alex',4,'Best tech news',1),r('Dev',5,'Comments are gold',2),r('Sam',3,'Can be elitist',4),r('Morgan',4,'Great for startups',3)], submittedBy: 'seed_admin', submittedAt: daysAgo(12) },
    // ── Arsenal Players (rated below 3 stars) ──
    { _id: uid(), name: 'Bukayo Saka', tagline: 'Arsenal winger & England international', image: 'https://www.google.com/s2/favicons?domain=arsenal.com&sz=128', description: 'Bukayo Saka is an English professional footballer who plays as a right winger for Arsenal and England national team. Known for his pace and dribbling.', link: 'https://www.arsenal.com', category: 'Players', upvotes: 45, upvotedBy: [], ratings: [r('GoalKing',2,'Inconsistent finishing this season',1),r('GunnerFan',3,'Good potential but overhyped',2),r('ArsenalLegend',2,'Needs to step up in big games',3),r('FootyWatch',3,'Decent but not world class yet',4)], submittedBy: 'seed_admin', submittedAt: daysAgo(2) },
    { _id: uid(), name: 'Martin Ødegaard', tagline: 'Arsenal captain & creative midfielder', image: 'https://www.google.com/s2/favicons?domain=arsenal.com&sz=128', description: 'Martin Ødegaard is a Norwegian footballer who plays as an attacking midfielder and captain for Arsenal and the Norway national team.', link: 'https://www.arsenal.com', category: 'Players', upvotes: 38, upvotedBy: [], ratings: [r('TacticsPro',2,'Disappeared in crucial matches',1),r('NorwayFan',3,'Creative but fragile',2),r('PremFanatic',2,'Injury-prone captain',3),r('GoalKing',2,'Not consistent enough',5)], submittedBy: 'seed_admin', submittedAt: daysAgo(2) },
    { _id: uid(), name: 'Declan Rice', tagline: 'Arsenal & England midfielder', image: 'https://www.google.com/s2/favicons?domain=arsenal.com&sz=128', description: 'Declan Rice is an English footballer who plays as a defensive midfielder for Arsenal. Signed from West Ham for a club-record fee.', link: 'https://www.arsenal.com', category: 'Players', upvotes: 42, upvotedBy: [], ratings: [r('MidfieldMaster',3,'Good but overpriced',1),r('GunnerFan',2,'Not worth 100M',2),r('FootyWatch',3,'Solid but unspectacular',3),r('ArsenalLegend',2,'Expected more for that price',4)], submittedBy: 'seed_admin', submittedAt: daysAgo(3) },
    { _id: uid(), name: 'William Saliba', tagline: 'Arsenal & France centre-back', image: 'https://www.google.com/s2/favicons?domain=arsenal.com&sz=128', description: 'William Saliba is a French professional footballer who plays as a centre-back for Arsenal and the France national team.', link: 'https://www.arsenal.com', category: 'Players', upvotes: 35, upvotedBy: [], ratings: [r('DefenceFirst',2,'Makes too many errors',1),r('PremFanatic',3,'Decent but overhyped',2),r('TacticsPro',2,'Positioning needs work',3),r('GoalKing',2,'Not top 5 CB material',5)], submittedBy: 'seed_admin', submittedAt: daysAgo(3) },
    { _id: uid(), name: 'Kai Havertz', tagline: 'Arsenal forward from Germany', image: 'https://www.google.com/s2/favicons?domain=arsenal.com&sz=128', description: 'Kai Havertz is a German footballer who plays as a forward for Arsenal. Versatile attacker who can play multiple positions.', link: 'https://www.arsenal.com', category: 'Players', upvotes: 28, upvotedBy: [], ratings: [r('GunnerFan',1,'No end product at all',1),r('FootyWatch',2,'Wastes too many chances',2),r('ArsenalLegend',2,'Frustrating to watch',3),r('MidfieldMaster',2,'Not a striker',4)], submittedBy: 'seed_admin', submittedAt: daysAgo(1) },
    { _id: uid(), name: 'Gabriel Jesus', tagline: 'Arsenal & Brazil striker', image: 'https://www.google.com/s2/favicons?domain=arsenal.com&sz=128', description: 'Gabriel Jesus is a Brazilian footballer who plays as a forward for Arsenal. Known for his work rate and pressing.', link: 'https://www.arsenal.com', category: 'Players', upvotes: 31, upvotedBy: [], ratings: [r('TacticsPro',2,'Injury ruined his season',1),r('NorwayFan',2,'Barely plays anymore',2),r('PremFanatic',3,'Good when fit but never fit',3),r('GoalKing',1,'Cant stay healthy',4)], submittedBy: 'seed_admin', submittedAt: daysAgo(2) },
    // ── Consumer Products ──
    { _id: uid(), name: 'iPhone 15 Pro', tagline: 'Apple flagship smartphone with titanium design', image: 'https://www.google.com/s2/favicons?domain=apple.com&sz=128', description: 'The iPhone 15 Pro features a titanium design, A17 Pro chip, and an advanced camera system with 48MP main sensor.', link: 'https://apple.com/iphone-15-pro', category: 'Products', upvotes: 210, upvotedBy: [], ratings: [r('TechGuru',5,'Best phone I have ever owned',1),r('Alex',4,'Expensive but worth it',2),r('Sam',4,'Camera is incredible',3),r('Dev',5,'Action button is game changer',4)], submittedBy: 'seed_admin', submittedAt: daysAgo(5) },
    { _id: uid(), name: 'Sony WH-1000XM5', tagline: 'Premium wireless noise-cancelling headphones', image: 'https://www.google.com/s2/favicons?domain=sony.com&sz=128', description: 'Sony WH-1000XM5 headphones offer industry-leading noise cancellation, 30-hour battery life, and exceptional sound quality.', link: 'https://sony.com', category: 'Products', upvotes: 178, upvotedBy: [], ratings: [r('AudioFan',5,'Best ANC headphones period',1),r('Morgan',5,'Sound quality is amazing',2),r('Quinn',4,'Comfortable for long sessions',3),r('Riley',4,'Pricey but justified',5)], submittedBy: 'seed_admin', submittedAt: daysAgo(6) },
    { _id: uid(), name: 'Dyson V15 Detect', tagline: 'Laser-equipped cordless vacuum cleaner', image: 'https://www.google.com/s2/favicons?domain=dyson.com&sz=128', description: 'The Dyson V15 Detect uses a laser to reveal microscopic dust and has an LCD screen showing particle counts in real-time.', link: 'https://dyson.com', category: 'Products', upvotes: 89, upvotedBy: [], ratings: [r('CleanFreak',4,'The laser is so satisfying',1),r('Pat',3,'Great suction but heavy',2),r('Jamie',4,'Battery could be better',3)], submittedBy: 'seed_admin', submittedAt: daysAgo(7) },
    { _id: uid(), name: 'Nintendo Switch OLED', tagline: 'Hybrid gaming console with vibrant OLED screen', image: 'https://www.google.com/s2/favicons?domain=nintendo.com&sz=128', description: 'The Nintendo Switch OLED model features a 7-inch OLED screen, enhanced audio, and a wide adjustable stand.', link: 'https://nintendo.com', category: 'Products', upvotes: 155, upvotedBy: [], ratings: [r('Gamer99',5,'Perfect for portable gaming',1),r('Casey',4,'OLED screen is gorgeous',2),r('Taylor',5,'Zelda on this is amazing',3),r('Avery',4,'Joy-con drift is still an issue',4)], submittedBy: 'seed_admin', submittedAt: daysAgo(8) },
    { _id: uid(), name: 'Air Jordan 1 Retro High', tagline: 'Iconic basketball sneaker by Nike', image: 'https://www.google.com/s2/favicons?domain=nike.com&sz=128', description: 'The Air Jordan 1 Retro High OG is one of the most iconic sneakers ever made, originally released in 1985.', link: 'https://nike.com', category: 'Products', upvotes: 132, upvotedBy: [], ratings: [r('SneakerHead',5,'Timeless classic design',1),r('Skyler',4,'Comfortable and stylish',2),r('Jamie',5,'Goes with everything',3),r('Pat',4,'Hard to get at retail',4)], submittedBy: 'seed_admin', submittedAt: daysAgo(4) },
    { _id: uid(), name: 'Stanley Quencher H2.0', tagline: 'Trendy insulated tumbler that keeps drinks cold', image: 'https://www.google.com/s2/favicons?domain=stanley1913.com&sz=128', description: 'The Stanley Quencher H2.0 FlowState tumbler holds 40oz, fits in car cup holders, and keeps drinks cold for 11 hours.', link: 'https://stanley1913.com', category: 'Products', upvotes: 97, upvotedBy: [], ratings: [r('HydroFan',4,'Actually lives up to the hype',1),r('Avery',3,'Good but overpriced for a cup',2),r('Riley',5,'Keeps ice frozen all day',3)], submittedBy: 'seed_admin', submittedAt: daysAgo(3) },
  ];
}

function loadLocal(): Item[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) { const parsed = JSON.parse(raw); if (Array.isArray(parsed) && parsed.length >= 15) return parsed; }
  } catch { /* ignore */ }
  const seed = getSeedData();
  localStorage.setItem(LS_KEY, JSON.stringify(seed));
  return seed;
}
function saveLocal(items: Item[]) { localStorage.setItem(LS_KEY, JSON.stringify(items)); }

// ── API Functions with localStorage fallback ──
export async function fetchItems(): Promise<Item[]> {
  const data = await apiCall<Item[]>(`${API_BASE}/api/items`);
  if (data) return data;
  return loadLocal().sort((a, b) => b.upvotes - a.upvotes);
}

export async function fetchItem(id: string): Promise<Item> {
  const data = await apiCall<Item>(`${API_BASE}/api/items/${id}`);
  if (data) return data;
  return loadLocal().find(i => i._id === id)!;
}

export async function submitItem(data: { name: string; tagline: string; description: string; link: string; category: string; image: string }): Promise<Item> {
  const result = await apiCall<Item>(`${API_BASE}/api/items`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, submittedBy: SESSION_ID }),
  });
  if (result) return result;
  const items = loadLocal();
  const newItem: Item = { ...data, _id: uid(), category: data.category as Item['category'], upvotes: 0, upvotedBy: [], ratings: [], submittedBy: SESSION_ID, submittedAt: new Date().toISOString() };
  items.unshift(newItem); saveLocal(items);
  return newItem;
}

export async function toggleUpvote(id: string): Promise<Item> {
  const result = await apiCall<Item>(`${API_BASE}/api/items/${id}/upvote`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: SESSION_ID }),
  });
  if (result) return result;
  const items = loadLocal();
  const item = items.find(i => i._id === id)!;
  if (item.upvotedBy.includes(SESSION_ID)) { item.upvotedBy = item.upvotedBy.filter(u => u !== SESSION_ID); item.upvotes--; }
  else { item.upvotedBy.push(SESSION_ID); item.upvotes++; }
  saveLocal(items); return item;
}

export async function addRating(id: string, userName: string, score: number, review: string): Promise<Item> {
  const result = await apiCall<Item>(`${API_BASE}/api/items/${id}/rate`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: SESSION_ID, userName, score, review }),
  });
  if (result) return result;
  const items = loadLocal();
  const item = items.find(i => i._id === id)!;
  const rating: Rating = { userId: SESSION_ID, userName, score, review, createdAt: new Date().toISOString() };
  const idx = item.ratings.findIndex(r => r.userId === SESSION_ID);
  if (idx >= 0) item.ratings[idx] = rating; else item.ratings.push(rating);
  saveLocal(items); return item;
}

export async function fetchFeedback(): Promise<FeedbackEntry[]> {
  const data = await apiCall<FeedbackEntry[]>(`${API_BASE}/api/feedback`);
  if (data) return data;
  const items = loadLocal();
  const feedback: FeedbackEntry[] = [];
  for (const item of items) {
    for (const r of item.ratings) {
      feedback.push({ itemId: item._id, itemName: item.name, itemImage: item.image, itemCategory: item.category, ...r });
    }
  }
  return feedback.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function fetchAnalytics(): Promise<AnalyticsData> {
  const data = await apiCall<AnalyticsData>(`${API_BASE}/api/analytics`);
  if (data) return data;
  const items = loadLocal();
  const totalItems = items.length;
  const totalUpvotes = items.reduce((s, i) => s + i.upvotes, 0);
  const totalRatings = items.reduce((s, i) => s + i.ratings.length, 0);
  const avgRating = totalRatings > 0 ? items.reduce((s, i) => s + i.ratings.reduce((rs, r) => rs + r.score, 0), 0) / totalRatings : 0;
  const categories: AnalyticsData['categories'] = {};
  items.forEach(i => {
    if (!categories[i.category]) categories[i.category] = { count: 0, upvotes: 0, ratings: 0 };
    categories[i.category].count++; categories[i.category].upvotes += i.upvotes; categories[i.category].ratings += i.ratings.length;
  });
  const topRated = items.filter(i => i.ratings.length > 0).map(i => ({ ...i, avgRating: getAvgRating(i) })).sort((a, b) => b.avgRating - a.avgRating).slice(0, 5);
  const topUpvoted = [...items].sort((a, b) => b.upvotes - a.upvotes).slice(0, 5);
  const ratingDist = [0, 0, 0, 0, 0];
  items.forEach(i => i.ratings.forEach(r => { if (r.score >= 1 && r.score <= 5) ratingDist[r.score - 1]++; }));
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const monthlyData: Record<string, number> = {};
  items.forEach(i => i.ratings.forEach(r => { const d = new Date(r.createdAt); const key = `${monthNames[d.getMonth()]}`; monthlyData[key] = (monthlyData[key] || 0) + 1; }));
  const recentActivity = items.flatMap(i => i.ratings.map(r => ({ itemName: i.name, itemImage: i.image, ...r }))).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10);
  return { totalItems, totalUpvotes, totalRatings, avgRating, categories, topRated, topUpvoted, ratingDist, monthlyData, recentActivity };
}

export async function fetchUserActivity(userId: string): Promise<{ submitted: Item[]; upvoted: Item[]; rated: Item[] }> {
  const data = await apiCall<{ submitted: Item[]; upvoted: Item[]; rated: Item[] }>(`${API_BASE}/api/user/${userId}/activity`);
  if (data) return data;
  const items = loadLocal();
  return {
    submitted: items.filter(i => i.submittedBy === userId),
    upvoted: items.filter(i => i.upvotedBy.includes(userId)),
    rated: items.filter(i => i.ratings.some(r => r.userId === userId)),
  };
}
