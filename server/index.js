import express from 'express';
import cors from 'cors';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = join(__dirname, 'data.json');
const DIST_DIR = join(__dirname, '..', 'dist');
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI;

// ---- Storage backends ----

// MongoDB storage (used in production / Render)
let mongoStore = null;
if (MONGODB_URI) {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    mongoStore = client.db('greecebabies').collection('store');
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
  }
}

async function readKey(key) {
  if (mongoStore) {
    const doc = await mongoStore.findOne({ _id: key });
    return doc ? doc.value : undefined;
  }
  // Fallback: file-based (local dev)
  try {
    const data = JSON.parse(readFileSync(DATA_FILE, 'utf-8'));
    return data[key];
  } catch {
    return undefined;
  }
}

async function writeKey(key, value) {
  if (mongoStore) {
    await mongoStore.updateOne(
      { _id: key },
      { $set: { _id: key, value } },
      { upsert: true },
    );
    return;
  }
  // Fallback: file-based (local dev)
  let data = {};
  try {
    data = JSON.parse(readFileSync(DATA_FILE, 'utf-8'));
  } catch {
    /* ignore */
  }
  data[key] = value;
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Init local file if no MongoDB
if (!MONGODB_URI && !existsSync(DATA_FILE)) {
  writeFileSync(DATA_FILE, JSON.stringify({}), 'utf-8');
}

// ---- Express app ----

const app = express();

app.use(cors());
app.use(express.json());

// API: Get a value by key
app.get('/api/data/:key', async (req, res) => {
  const value = await readKey(req.params.key);
  if (value !== undefined) {
    res.json(value);
  } else {
    res.status(404).json(null);
  }
});

// API: Set a value by key
app.post('/api/data/:key', async (req, res) => {
  await writeKey(req.params.key, req.body);
  res.json({ ok: true });
});

// Serve frontend
if (existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.get('/{*splat}', (req, res) => {
    res.sendFile(join(DIST_DIR, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(
    `💾 Storage: ${MONGODB_URI ? 'MongoDB' : 'Local file (' + DATA_FILE + ')'}`,
  );
});
