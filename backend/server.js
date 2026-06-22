const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { restorePendingAssetCleanups } = require('./utils/assetCleanup');

dotenv.config();
connectDB();

function buildAllowedOrigins() {
  const defaults = [
    'https://formfixer.in',
    'https://www.formfixer.in',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ];

  const envOrigins = [
    process.env.FRONTEND_URL,
    ...(process.env.ALLOWED_ORIGINS || '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean),
  ];

  return [...new Set([...defaults, ...envOrigins].filter(Boolean))];
}

const app = express();
const allowedOrigins = buildAllowedOrigins();

app.set('trust proxy', 1);

app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`[Timing] ${req.method} ${req.originalUrl} -> ${ms}ms`);
  });

  next();
});

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origin not allowed by CORS: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/process', require('./routes/processRoutes'));
app.use('/api/pdf', require('./routes/pdfRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));

app.get('/', (req, res) => {
  res.json({ message: 'FormFixer API Running', version: '1.0.0' });
});

app.get('/healthz', (req, res) => {
  res.json({
    ok: true,
    service: 'formfixer-backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    corsOrigins: allowedOrigins,
  });
});

app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

app.use((err, req, res, next) => {
  console.error('[Server Error]', err.message);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`FormFixer server running on port ${PORT}`);
  try {
    await restorePendingAssetCleanups();
  } catch (error) {
    console.error('[Cleanup] Could not restore pending asset cleanups:', error.message);
  }
});
