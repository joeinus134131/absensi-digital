import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/apiRoutes.js';
import { runSeed } from './db/seed.js';
import { db } from './db/database.js';

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Auto seed if database empty
if (!db.getTable('users').length) {
  runSeed();
}

app.use('/api', apiRoutes);

app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'WajibAbsen Enterprise API is Online', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 WajibAbsen Enterprise Monolith Server running!`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api`);
  console.log(`=======================================================`);
});
