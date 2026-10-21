import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let bucket = null;

export const getGridFSBucket = () => {
  if (bucket) return bucket;
  const db = mongoose.connection.db;
  if (!db) return null;
  bucket = new mongoose.mongo.GridFSBucket(db, {
    bucketName: 'uploads'
  });
  return bucket;
};

/**
 * Uploads a file stream or file from disk to MongoDB GridFS
 */
export const uploadFileToGridFS = async (filePath, filename, contentType = 'application/pdf', metadata = {}) => {
  const b = getGridFSBucket();
  if (!b) throw new Error('GridFS bucket not initialized (database not connected)');

  // Remove existing file with the same name if present
  try {
    const existing = await b.find({ filename }).toArray();
    for (const file of existing) {
      await b.delete(file._id).catch(() => {});
    }
  } catch {
    // Ignore cleanup errors
  }

  return new Promise((resolve, reject) => {
    const uploadStream = b.openUploadStream(filename, {
      contentType,
      metadata: {
        ...metadata,
        uploadedAt: new Date()
      }
    });

    const readStream = fs.createReadStream(filePath);
    readStream.on('error', reject);
    uploadStream.on('error', reject);
    uploadStream.on('finish', () => resolve(uploadStream.id));

    readStream.pipe(uploadStream);
  });
};

/**
 * Check if a file exists in MongoDB GridFS
 */
export const findGridFSFile = async (filename) => {
  const b = getGridFSBucket();
  if (!b) return null;
  const files = await b.find({ filename }).limit(1).toArray();
  return files.length > 0 ? files[0] : null;
};

/**
 * Opens a readable download stream for a file in MongoDB GridFS
 */
export const openGridFSDownloadStream = (filename) => {
  const b = getGridFSBucket();
  if (!b) throw new Error('GridFS bucket not initialized');
  return b.openDownloadStreamByName(filename);
};

/**
 * Delete a file from MongoDB GridFS
 */
export const deleteFromGridFS = async (filename) => {
  const b = getGridFSBucket();
  if (!b) return;
  const files = await b.find({ filename }).toArray();
  for (const f of files) {
    await b.delete(f._id).catch(() => {});
  }
};

/**
 * Scans local uploads folder and syncs any PDF into MongoDB GridFS
 * Ensures persistent storage across container redeployments and restarts
 */
export const syncUploadsToGridFS = async () => {
  const b = getGridFSBucket();
  if (!b) {
    console.warn('[GridFS Sync] Skipped: GridFS bucket not ready');
    return;
  }

  const uploadDir = path.resolve(__dirname, '../../uploads');
  if (!fs.existsSync(uploadDir)) return;

  const files = fs.readdirSync(uploadDir).filter(f => f.toLowerCase().endsWith('.pdf'));
  let synced = 0;

  for (const filename of files) {
    try {
      const existing = await findGridFSFile(filename);
      if (!existing) {
        const filePath = path.join(uploadDir, filename);
        const stat = fs.statSync(filePath);
        await uploadFileToGridFS(filePath, filename, 'application/pdf', {
          originalName: filename,
          size: stat.size,
          autoSynced: true
        });
        synced++;
      }
    } catch (err) {
      console.warn(`[GridFS Sync] Warning syncing ${filename}:`, err.message);
    }
  }

  if (synced > 0) {
    console.log(`[GridFS Sync] Synced ${synced} PDFs into persistent MongoDB GridFS`);
  }
};
