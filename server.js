import 'dotenv/config';
import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import { readFileSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const DIST = join(__dirname, 'dist');
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'pulse_portal';
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

const app = express();
app.use(express.json());

// ── Session ──
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'ratemystuff-dev-secret-change-in-prod',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    sameSite: 'lax',
  },
};

// Use MongoDB session store in production for persistence across restarts
if (process.env.NODE_ENV === 'production' && MONGO_URI !== 'mongodb://localhost:27017') {
  sessionConfig.store = MongoStore.create({
    mongoUrl: MONGO_URI,
    dbName: DB_NAME,
    collectionName: 'sessions',
    ttl: 30 * 24 * 60 * 60, // 30 days
  });
}

app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());

// Trust proxy for Railway / production (secure cookies behind reverse proxy)
if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);

// ── MongoDB Connection ──
let db;
async function connectDB() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  db = client.db(DB_NAME);
  console.log('✅ Connected to MongoDB');

  // Create indexes
  await db.collection('items').createIndex({ category: 1 });
  await db.collection('items').createIndex({ upvotes: -1 });
  await db.collection('items').createIndex({ submittedAt: -1 });
  await db.collection('items').createIndex({ name: 'text', tagline: 'text' });

  // Seed data if collection is empty
  const count = await db.collection('items').countDocuments();
  if (count === 0) {
    await seedDatabase();
  }
}

// ── Seed Data ──
function daysAgo(d) { return new Date(Date.now() - d * 86400000).toISOString(); }

async function seedDatabase() {
  const r = (u, s, rev, d) => ({ userId: 'seed_' + u.toLowerCase(), userName: u, score: s, review: rev, createdAt: daysAgo(d) });

  const items = [
    {
      name: 'ChatGPT', tagline: 'AI assistant for writing, coding, and analysis',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/512px-ChatGPT_logo.svg.png',
      description: 'ChatGPT by OpenAI is an advanced AI assistant that can help with writing, coding, research, analysis, and creative tasks.',
      link: 'https://chat.openai.com', category: 'Products', upvotes: 284, upvotedBy: ['a','b','c'],
      ratings: [r('Alex', 5, 'Revolutionary tool for productivity', 1), r('Sam', 4, 'Great but sometimes hallucinates', 2), r('Morgan', 5, 'Use it daily for coding help', 3), r('Quinn', 4, 'Impressive capabilities', 4), r('Dev', 5, 'Best AI tool available', 5), r('Pat', 3, 'Good but needs fact-checking', 6), r('Taylor', 5, 'Changed how I work', 2), r('Riley', 4, 'Very helpful for brainstorming', 3)],
      submittedBy: 'seed_admin', submittedAt: daysAgo(14),
    },
    {
      name: 'Notion', tagline: 'All-in-one workspace for notes, docs, and projects',
      image: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png',
      description: 'Notion combines notes, docs, wikis, and project management into one connected workspace.',
      link: 'https://notion.so', category: 'Products', upvotes: 198, upvotedBy: ['d','e'],
      ratings: [r('Sam', 5, 'Perfect for team documentation', 2), r('Jordan', 4, 'Great but can be slow', 3), r('Morgan', 5, 'Replaced 5 other tools for me', 1), r('Chris', 4, 'Love the flexibility', 5), r('Quinn', 3, 'Learning curve is steep', 7), r('Taylor', 5, 'Best workspace tool', 4)],
      submittedBy: 'seed_admin', submittedAt: daysAgo(12),
    },
    {
      name: 'Figma', tagline: 'Collaborative design tool for teams',
      image: 'https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg',
      description: 'Figma is a cloud-based design platform for building user interfaces, prototyping, and collaborating in real-time.',
      link: 'https://figma.com', category: 'Tools', upvotes: 176, upvotedBy: ['f','g'],
      ratings: [r('Alex', 5, 'Industry standard for good reason', 2), r('Dev', 5, 'Collaboration features are unmatched', 1), r('Pat', 4, 'Much better than Sketch', 4), r('Casey', 5, 'Dev mode saves hours', 3), r('Riley', 4, 'Auto-layout is powerful', 6)],
      submittedBy: 'seed_admin', submittedAt: daysAgo(10),
    },
    {
      name: 'Stripe', tagline: 'Payment infrastructure for the internet',
      image: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg',
      description: 'Stripe provides APIs and tools for online payment processing. Used by millions of businesses.',
      link: 'https://stripe.com', category: 'Services', upvotes: 165, upvotedBy: ['h'],
      ratings: [r('Jordan', 5, 'Best payment API by far', 3), r('Dev', 5, 'Documentation is excellent', 1), r('Quinn', 4, 'Easy to integrate', 5), r('Taylor', 5, 'Checkout flow is seamless', 2), r('Avery', 4, 'Dashboard could be better', 7)],
      submittedBy: 'seed_admin', submittedAt: daysAgo(11),
    },
    {
      name: 'Linear', tagline: 'Issue tracking built for speed',
      image: 'https://asset.brandfetch.io/iduDa181eM/idYmHGSOlR.png',
      description: 'Linear is a modern project management tool designed for high-performance teams.',
      link: 'https://linear.app', category: 'Tools', upvotes: 142, upvotedBy: ['i'],
      ratings: [r('Alex', 5, 'Fastest project management tool ever', 1), r('Sam', 5, 'Jira killer', 2), r('Morgan', 4, 'Love the keyboard shortcuts', 4), r('Dev', 5, 'Beautiful and fast', 3)],
      submittedBy: 'seed_admin', submittedAt: daysAgo(9),
    },
    {
      name: 'Vercel', tagline: 'Frontend cloud platform for developers',
      image: 'https://assets.vercel.com/image/upload/front/favicon/vercel/180x180.png',
      description: 'Vercel provides the developer experience and infrastructure to build, scale, and secure web applications.',
      link: 'https://vercel.com', category: 'Services', upvotes: 138, upvotedBy: ['j'],
      ratings: [r('Dev', 5, 'Deploy in seconds', 1), r('Jordan', 4, 'Great DX but pricey at scale', 3), r('Taylor', 5, 'Preview deployments are game-changing', 2), r('Casey', 4, 'Love the edge functions', 5)],
      submittedBy: 'seed_admin', submittedAt: daysAgo(8),
    },
    {
      name: 'Spotify', tagline: 'Music streaming for everyone',
      image: 'https://storage.googleapis.com/pr-newsroom-wp/1/2023/05/Spotify_Primary_Logo_RGB_Green.png',
      description: 'Spotify gives you access to millions of songs, podcasts, and audiobooks.',
      link: 'https://spotify.com', category: 'Products', upvotes: 156, upvotedBy: ['k','l'],
      ratings: [r('Pat', 5, 'Best music app hands down', 1), r('Riley', 4, 'Discover Weekly is magic', 2), r('Avery', 5, 'Podcast integration is great', 4), r('Skyler', 3, 'Free tier has too many ads', 3), r('Jamie', 4, 'Collaborative playlists are fun', 6)],
      submittedBy: 'seed_admin', submittedAt: daysAgo(13),
    },
    {
      name: 'Tailwind CSS', tagline: 'Utility-first CSS framework',
      image: 'https://tailwindcss.com/_next/static/media/tailwindcss-mark.3c5441fc7a190fb1800d4a5c7f07ba4b1345a9c8.svg',
      description: 'Tailwind CSS is a utility-first CSS framework that lets you build modern designs directly in your markup.',
      link: 'https://tailwindcss.com', category: 'Tools', upvotes: 134, upvotedBy: ['m'],
      ratings: [r('Dev', 5, 'Changed how I write CSS forever', 1), r('Alex', 5, 'So productive once you learn it', 2), r('Casey', 4, 'HTML can get verbose', 4), r('Quinn', 5, 'v4 is amazing', 3)],
      submittedBy: 'seed_admin', submittedAt: daysAgo(7),
    },
    {
      name: 'GitHub Copilot', tagline: 'AI pair programmer for your editor',
      image: 'https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png',
      description: 'GitHub Copilot uses AI to suggest code completions, entire functions, and helps you write code faster.',
      link: 'https://github.com/features/copilot', category: 'Products', upvotes: 167, upvotedBy: ['n'],
      ratings: [r('Dev', 5, 'Like having a senior dev next to you', 1), r('Jordan', 4, 'Great for boilerplate code', 2), r('Sam', 4, 'Sometimes suggests wrong patterns', 3), r('Taylor', 5, 'Saves me hours every day', 4), r('Morgan', 3, 'Tab-completion can be distracting', 6)],
      submittedBy: 'seed_admin', submittedAt: daysAgo(6),
    },
    {
      name: 'Supabase', tagline: 'Open source Firebase alternative',
      image: 'https://seeklogo.com/images/S/supabase-logo-DCC676FFE2-seeklogo.com.png',
      description: 'Supabase provides a Postgres database, authentication, instant APIs, edge functions, and storage.',
      link: 'https://supabase.com', category: 'Services', upvotes: 119, upvotedBy: [],
      ratings: [r('Dev', 5, 'Postgres + auth + storage in one', 1), r('Alex', 4, 'Great for MVPs', 3), r('Quinn', 5, 'Edge functions are powerful', 2), r('Riley', 4, 'Dashboard is clean', 5)],
      submittedBy: 'seed_admin', submittedAt: daysAgo(5),
    },
    {
      name: 'Canva', tagline: 'Design anything, publish anywhere',
      image: 'https://static.canva.com/web/images/12487a1e0770d29351bd4ce4f87ec8fe.svg',
      description: 'Canva makes graphic design accessible to everyone.',
      link: 'https://canva.com', category: 'Products', upvotes: 143, upvotedBy: ['o'],
      ratings: [r('Pat', 5, 'Perfect for non-designers', 1), r('Jamie', 4, 'Templates save so much time', 2), r('Avery', 5, 'Magic resize is brilliant', 3), r('Skyler', 4, 'Free tier is very generous', 5)],
      submittedBy: 'seed_admin', submittedAt: daysAgo(11),
    },
    {
      name: 'Midjourney', tagline: 'AI-powered image generation',
      image: 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Midjourney_Emblem.png',
      description: 'Midjourney creates stunning AI-generated artwork from text prompts.',
      link: 'https://midjourney.com', category: 'Products', upvotes: 131, upvotedBy: [],
      ratings: [r('Alex', 5, 'Art quality is incredible', 1), r('Morgan', 4, 'Great for concept art', 2), r('Casey', 5, 'v6 is photorealistic', 3), r('Riley', 3, 'Wish it had a proper app', 5)],
      submittedBy: 'seed_admin', submittedAt: daysAgo(10),
    },
    {
      name: 'Railway', tagline: 'Infrastructure made simple',
      image: 'https://railway.app/brand/logo-light.png',
      description: 'Railway lets you deploy apps, databases, and cron jobs with zero DevOps.',
      link: 'https://railway.app', category: 'Services', upvotes: 98, upvotedBy: [],
      ratings: [r('Dev', 5, 'Easiest deployment platform', 1), r('Jordan', 4, 'Great for side projects', 3), r('Taylor', 5, 'Replaced Heroku for me', 2)],
      submittedBy: 'seed_admin', submittedAt: daysAgo(4),
    },
    {
      name: 'Arc Browser', tagline: 'A browser built for the way we use the internet',
      image: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Arc_%28browser%29_logo.png',
      description: 'Arc reimagines the web browser with spaces, profiles, easels, and a command bar.',
      link: 'https://arc.net', category: 'Products', upvotes: 112, upvotedBy: [],
      ratings: [r('Sam', 4, 'Beautiful but resource-heavy', 1), r('Quinn', 5, 'Spaces changed my workflow', 2), r('Pat', 4, 'Best browser design ever', 4), r('Casey', 3, 'Missing some extensions', 3)],
      submittedBy: 'seed_admin', submittedAt: daysAgo(8),
    },
    {
      name: 'Obsidian', tagline: 'Private and flexible note-taking app',
      image: 'https://obsidian.md/images/obsidian-logo-gradient.svg',
      description: 'Obsidian is a powerful knowledge base that works on top of local Markdown files.',
      link: 'https://obsidian.md', category: 'Tools', upvotes: 108, upvotedBy: [],
      ratings: [r('Morgan', 5, 'Best note-taking app for power users', 1), r('Alex', 5, 'Plugin ecosystem is amazing', 2), r('Dev', 4, 'Local-first is a huge plus', 3), r('Riley', 4, 'Graph view is beautiful', 5)],
      submittedBy: 'seed_admin', submittedAt: daysAgo(9),
    },
    {
      name: 'Framer', tagline: 'Ship sites with style, no code needed',
      image: 'https://framerusercontent.com/images/3bLFJzhRxQwJOXMVt3G8yh2goHU.png',
      description: 'Framer lets you design and publish stunning websites without writing code.',
      link: 'https://framer.com', category: 'Tools', upvotes: 95, upvotedBy: [],
      ratings: [r('Casey', 5, 'Best no-code website builder', 1), r('Pat', 4, 'Animations are so smooth', 3), r('Avery', 5, 'Replaced Webflow for me', 2)],
      submittedBy: 'seed_admin', submittedAt: daysAgo(6),
    },
    {
      name: 'Loom', tagline: 'Record and share video messages',
      image: 'https://asset.brandfetch.io/id_xHGOeBi/idOBRyBSIK.png',
      description: 'Loom lets you record quick video messages to explain anything.',
      link: 'https://loom.com', category: 'Services', upvotes: 87, upvotedBy: [],
      ratings: [r('Taylor', 5, 'Replaced so many meetings', 1), r('Quinn', 4, 'AI summary saves time', 2), r('Sam', 4, 'Great for bug reports', 4)],
      submittedBy: 'seed_admin', submittedAt: daysAgo(7),
    },
    {
      name: 'Excalidraw', tagline: 'Virtual whiteboard for sketching',
      image: 'https://excalidraw.com/apple-touch-icon.png',
      description: 'Excalidraw is a simple, open-source virtual whiteboard for hand-drawn-like diagrams.',
      link: 'https://excalidraw.com', category: 'Tools', upvotes: 92, upvotedBy: [],
      ratings: [r('Dev', 5, 'Perfect for architecture diagrams', 1), r('Jordan', 5, 'Hand-drawn style is charming', 2), r('Alex', 4, 'Collaboration works great', 3)],
      submittedBy: 'seed_admin', submittedAt: daysAgo(5),
    },
    {
      name: 'Cal.com', tagline: 'Open source scheduling infrastructure',
      image: 'https://cal.com/android-chrome-256x256.png',
      description: 'Cal.com is an open-source Calendly alternative for scheduling meetings.',
      link: 'https://cal.com', category: 'Projects', upvotes: 76, upvotedBy: [],
      ratings: [r('Quinn', 5, 'Best open-source scheduling tool', 1), r('Taylor', 4, 'Self-hosting is a huge plus', 3), r('Riley', 4, 'Customization is great', 2)],
      submittedBy: 'seed_admin', submittedAt: daysAgo(3),
    },
    {
      name: 'Hacker News', tagline: 'Tech community news and discussion',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Y_Combinator_logo.svg/512px-Y_Combinator_logo.svg.png',
      description: 'Hacker News is a social news website focusing on computer science and entrepreneurship.',
      link: 'https://news.ycombinator.com', category: 'Projects', upvotes: 104, upvotedBy: [],
      ratings: [r('Alex', 4, 'Best source for tech news', 1), r('Dev', 5, 'Comments are gold', 2), r('Sam', 3, 'Can be elitist sometimes', 4), r('Morgan', 4, 'Great for discovering startups', 3)],
      submittedBy: 'seed_admin', submittedAt: daysAgo(12),
    },
  ];

  await db.collection('items').insertMany(items);
  console.log('🌱 Seeded database with', items.length, 'items');
}

// ── API Routes ──

// Get all items
app.get('/api/items', async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    const filter = {};
    if (category && category !== 'All') filter.category = category;
    if (search) filter.$text = { $search: search };

    const sortObj = sort === 'recent' ? { submittedAt: -1 } : { upvotes: -1 };
    const items = await db.collection('items').find(filter).sort(sortObj).toArray();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single item
app.get('/api/items/:id', async (req, res) => {
  try {
    const item = await db.collection('items').findOne({ _id: new ObjectId(req.params.id) });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit new item
app.post('/api/items', async (req, res) => {
  try {
    const { name, tagline, description, link, category, image, submittedBy } = req.body;
    if (!name || !tagline || !description || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const item = {
      name, tagline, description, link: link || '', category,
      image: image || '', upvotes: 0, upvotedBy: [],
      ratings: [], submittedBy: submittedBy || 'anonymous',
      submittedAt: new Date().toISOString(),
    };
    const result = await db.collection('items').insertOne(item);
    res.json({ ...item, _id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle upvote
app.post('/api/items/:id/upvote', async (req, res) => {
  try {
    const { userId } = req.body;
    const item = await db.collection('items').findOne({ _id: new ObjectId(req.params.id) });
    if (!item) return res.status(404).json({ error: 'Not found' });

    if (item.upvotedBy.includes(userId)) {
      await db.collection('items').updateOne(
        { _id: new ObjectId(req.params.id) },
        { $pull: { upvotedBy: userId }, $inc: { upvotes: -1 } }
      );
    } else {
      await db.collection('items').updateOne(
        { _id: new ObjectId(req.params.id) },
        { $push: { upvotedBy: userId }, $inc: { upvotes: 1 } }
      );
    }
    const updated = await db.collection('items').findOne({ _id: new ObjectId(req.params.id) });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add rating
app.post('/api/items/:id/rate', async (req, res) => {
  try {
    const { userId, userName, score, review } = req.body;
    if (!userId || !userName || !score) return res.status(400).json({ error: 'Missing fields' });

    const item = await db.collection('items').findOne({ _id: new ObjectId(req.params.id) });
    if (!item) return res.status(404).json({ error: 'Not found' });

    const existingIdx = item.ratings.findIndex(r => r.userId === userId);
    const rating = { userId, userName, score, review: review || '', createdAt: new Date().toISOString() };

    if (existingIdx >= 0) {
      await db.collection('items').updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: { [`ratings.${existingIdx}`]: rating } }
      );
    } else {
      await db.collection('items').updateOne(
        { _id: new ObjectId(req.params.id) },
        { $push: { ratings: rating } }
      );
    }
    const updated = await db.collection('items').findOne({ _id: new ObjectId(req.params.id) });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all feedback (ratings) across all items
app.get('/api/feedback', async (req, res) => {
  try {
    const items = await db.collection('items').find({ 'ratings.0': { $exists: true } }).toArray();
    const feedback = [];
    for (const item of items) {
      for (const rating of item.ratings) {
        feedback.push({
          itemId: item._id,
          itemName: item.name,
          itemImage: item.image,
          itemCategory: item.category,
          ...rating,
        });
      }
    }
    feedback.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Analytics endpoint
app.get('/api/analytics', async (req, res) => {
  try {
    const items = await db.collection('items').find().toArray();
    const totalItems = items.length;
    const totalUpvotes = items.reduce((s, i) => s + i.upvotes, 0);
    const totalRatings = items.reduce((s, i) => s + i.ratings.length, 0);
    const avgRating = totalRatings > 0
      ? items.reduce((s, i) => s + i.ratings.reduce((rs, r) => rs + r.score, 0), 0) / totalRatings
      : 0;

    // Category breakdown
    const categories = {};
    items.forEach(i => {
      if (!categories[i.category]) categories[i.category] = { count: 0, upvotes: 0, ratings: 0 };
      categories[i.category].count++;
      categories[i.category].upvotes += i.upvotes;
      categories[i.category].ratings += i.ratings.length;
    });

    // Top rated items
    const topRated = items
      .filter(i => i.ratings.length > 0)
      .map(i => ({ ...i, avgRating: i.ratings.reduce((s, r) => s + r.score, 0) / i.ratings.length }))
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, 5);

    // Top upvoted items
    const topUpvoted = [...items].sort((a, b) => b.upvotes - a.upvotes).slice(0, 5);

    // Rating distribution across all items
    const ratingDist = [0, 0, 0, 0, 0];
    items.forEach(i => i.ratings.forEach(r => { if (r.score >= 1 && r.score <= 5) ratingDist[r.score - 1]++; }));

    // Monthly feedback trend (simulated from actual data)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = {};
    items.forEach(i => {
      i.ratings.forEach(r => {
        const d = new Date(r.createdAt);
        const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
        monthlyData[key] = (monthlyData[key] || 0) + 1;
      });
    });

    // Recent activity
    const recentRatings = [];
    items.forEach(i => {
      i.ratings.forEach(r => {
        recentRatings.push({ itemName: i.name, itemImage: i.image, ...r });
      });
    });
    recentRatings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({
      totalItems, totalUpvotes, totalRatings, avgRating,
      categories, topRated, topUpvoted, ratingDist,
      monthlyData, recentActivity: recentRatings.slice(0, 10),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// User activity
app.get('/api/user/:userId/activity', async (req, res) => {
  try {
    const { userId } = req.params;
    const items = await db.collection('items').find().toArray();
    res.json({
      submitted: items.filter(i => i.submittedBy === userId),
      upvoted: items.filter(i => i.upvotedBy.includes(userId)),
      rated: items.filter(i => i.ratings.some(r => r.userId === userId)),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Passport Serialization ──
passport.serializeUser((user, done) => done(null, user._id.toString()));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await db.collection('users').findOne({ _id: new ObjectId(id) });
    done(null, user);
  } catch (err) { done(err, null); }
});

// ── OAuth Strategies (configured after DB connect) ──
function setupPassport() {
  // Google OAuth
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${BASE_URL}/auth/google/callback`,
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await db.collection('users').findOne({ providerId: profile.id, provider: 'google' });
        if (!user) {
          const newUser = {
            provider: 'google', providerId: profile.id,
            name: profile.displayName || 'Google User',
            email: profile.emails?.[0]?.value || '',
            avatar: profile.photos?.[0]?.value || '',
            createdAt: new Date().toISOString(),
          };
          const result = await db.collection('users').insertOne(newUser);
          user = { ...newUser, _id: result.insertedId };
        }
        done(null, user);
      } catch (err) { done(err, null); }
    }));
    console.log('✅ Google OAuth configured');
  } else {
    console.log('⚠️  Google OAuth not configured (missing GOOGLE_CLIENT_ID/SECRET)');
  }
}

// ── Auth Routes ──
// Google
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/?auth=failed' }), (req, res) => {
  res.redirect('/?auth=success');
});

// Get current user
app.get('/api/auth/me', (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated() && req.user) {
    const u = req.user;
    res.json({ authenticated: true, user: { id: u._id, name: u.name, email: u.email, avatar: u.avatar, provider: u.provider } });
  } else {
    res.json({ authenticated: false, user: null });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    req.session?.destroy(() => {
      res.clearCookie('connect.sid');
      res.json({ success: true });
    });
  });
});

// ── Serve static files ──
const MIME_TYPES = {
  '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
  '.webp': 'image/webp',
};

app.use(express.static(DIST));
app.get('*', (req, res) => {
  res.sendFile(join(DIST, 'index.html'));
});

// ── Start Server ──
connectDB().then(() => {
  setupPassport();
  app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Pulse running on port ${PORT}`));
}).catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});
