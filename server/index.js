import express from 'express';
import cors from 'cors';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = join(__dirname, 'data.json');
const DIST_DIR = join(__dirname, '..', 'dist');
const PORT = process.env.PORT || 3001;

// Initialize data file if it doesn't exist
if (!existsSync(DATA_FILE)) {
  writeFileSync(DATA_FILE, JSON.stringify({}), 'utf-8');
}

function readData() {
  try {
    return JSON.parse(readFileSync(DATA_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

function writeData(data) {
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

const app = express();

app.use(cors());
app.use(express.json());

// API: Get a value by key
app.get('/api/data/:key', (req, res) => {
  const data = readData();
  const key = req.params.key;
  if (key in data) {
    res.json(data[key]);
  } else {
    res.status(404).json(null);
  }
});

// API: Set a value by key
app.post('/api/data/:key', (req, res) => {
  const data = readData();
  data[req.params.key] = req.body;
  writeData(data);
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
  console.log(`📂 Data stored in ${DATA_FILE}`);
});
