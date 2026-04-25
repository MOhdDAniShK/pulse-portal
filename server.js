import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const DB_FILE = path.join(__dirname, 'db.json');

// Initialize DB if it doesn't exist
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify([]));
}

let feedbacks = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));

// API endpoint to fetch initial data
app.get('/api/feedback', (req, res) => {
  // Return the latest 50
  res.json(feedbacks.slice(0, 50));
});

// Socket.io for real-time updates
io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);

  socket.on('submit_feedback', (feedback) => {
    const newFeedback = {
      ...feedback,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    };
    
    // Add to top
    feedbacks.unshift(newFeedback);
    // Keep only last 1000 to prevent infinite growth
    if (feedbacks.length > 1000) {
      feedbacks = feedbacks.slice(0, 1000);
    }

    // Save to disk asynchronously
    fs.writeFile(DB_FILE, JSON.stringify(feedbacks, null, 2), (err) => {
      if (err) console.error('Error saving db:', err);
    });

    // Broadcast to all clients
    io.emit('new_feedback', newFeedback);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Live DB Server running on http://localhost:${PORT}`);
});
