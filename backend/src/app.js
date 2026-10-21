import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { FRONTEND_ORIGIN, NODE_ENV } from './config/env.js';
import publicRoutes from './routes/publicRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import { requireAdminAuth } from './middleware/authMiddleware.js';
import { uploadPdfMiddleware } from './middleware/uploadMiddleware.js';
import { uploadPdfFile } from './controllers/adminResourceController.js';
import { findGridFSFile, openGridFSDownloadStream } from './services/gridfsService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

const configuredOrigins = (FRONTEND_ORIGIN || '')
  .split(',')
  .map(o => o.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const allowedOrigins = [
  ...configuredOrigins,
  'https://aktu-notes1965.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const normalized = origin.replace(/\/+$/, '');
    if (NODE_ENV !== 'production' && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalized)) {
      return callback(null, true);
    }
    if (
      allowedOrigins.includes(normalized) ||
      /^https:\/\/aktu-notes1965[a-z0-9-]*\.vercel\.app$/.test(normalized)
    ) {
      return callback(null, true);
    }
    return callback(new Error(`CORS origin ${origin} is not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(cookieParser());

// Serve uploaded PDFs: first check local disk, then stream from persistent MongoDB GridFS
app.get('/uploads/:filename', async (req, res, next) => {
  const filename = path.basename(req.params.filename);
  const localPath = path.resolve(__dirname, '../uploads', filename);

  // 1. If file exists on local disk, serve directly
  if (fs.existsSync(localPath)) {
    return res.sendFile(localPath);
  }

  // 2. If not on local disk (e.g. after Render redeployment/restart), stream from MongoDB GridFS
  try {
    const gridFile = await findGridFSFile(filename);
    if (gridFile) {
      res.setHeader('Content-Type', gridFile.contentType || 'application/pdf');
      res.setHeader('Content-Length', gridFile.length);
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day

      // Cache to local disk in background for faster subsequent requests
      const writeStream = fs.createWriteStream(localPath);
      const cacheStream = openGridFSDownloadStream(filename);
      cacheStream.pipe(writeStream).on('error', () => {});

      const clientStream = openGridFSDownloadStream(filename);
      return clientStream.pipe(res);
    }
  } catch (err) {
    console.error('[Uploads] GridFS stream error:', err.message);
  }

  // 3. Fall through to static middleware or notFoundHandler
  next();
});

// Serve static uploads directory as fallback
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

app.use('/api', publicRoutes);
app.use('/api/admin', adminRoutes);

// Route aliases to ensure resilience against missing /api or /admin prefixes
app.use('/admin', adminRoutes);
app.post('/api/upload', requireAdminAuth, uploadPdfMiddleware.single('file'), uploadPdfFile);
app.post('/upload', requireAdminAuth, uploadPdfMiddleware.single('file'), uploadPdfFile);
app.use('/', publicRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
