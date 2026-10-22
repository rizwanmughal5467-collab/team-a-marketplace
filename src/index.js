const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Routes import karo
const connectionRoutes = require('./routes/connections');
const syncRoutes = require('./routes/sync');

const app = express();
app.use(cors());
app.use(express.json()); // Taake hum JSON data bhej saken

// 1. Test Route (bina token ke chalne wala)
app.get('/health', (req, res) => {
  res.json({ ok: true, message: 'Team A Backend is running!' });
});

// 2. Main API Routes (yahan '/api/operations/connections' prefix lagega)
app.use('/api/operations/connections', connectionRoutes);
app.use('/api/operations', syncRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`\n✅ Server running on http://localhost:${PORT}`);
  console.log(`   Test it here: http://localhost:${PORT}/health\n`);
});