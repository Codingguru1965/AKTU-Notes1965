import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

import { connectDB, disconnectDB } from '../config/db.js';
import { uploadFileToGridFS, findGridFSFile } from '../services/gridfsService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sync = async () => {
  const uri = process.argv[2] || process.env.MONGODB_URI;
  console.log('[Sync] Connecting to database...');
  await connectDB(uri);

  const uploadsDir = path.resolve(__dirname, '../../uploads');
  if (!fs.existsSync(uploadsDir)) {
    console.log('[Sync] No uploads directory found.');
    await disconnectDB();
    return;
  }

  const files = fs.readdirSync(uploadsDir).filter(f =>
    f.toLowerCase().endsWith('.pdf') &&
    !f.startsWith('test-') &&
    !f.startsWith('sample-')
  );
  console.log(`[Sync] Found ${files.length} PDFs in uploads to verify in MongoDB GridFS...`);

  let count = 0;
  for (const filename of files) {
    const existing = await findGridFSFile(filename);
    if (!existing) {
      const fullPath = path.join(uploadsDir, filename);
      const stat = fs.statSync(fullPath);
      await uploadFileToGridFS(fullPath, filename, 'application/pdf', {
        originalName: filename,
        size: stat.size,
        syncedManually: true
      });
      console.log(`[Sync] Uploaded to GridFS: ${filename} (${stat.size} bytes)`);
      count++;
    } else {
      console.log(`[Sync] Already in GridFS: ${filename}`);
    }
  }

  console.log(`[Sync] Completed. Uploaded ${count} new files to GridFS.`);
  await disconnectDB();
};

sync().catch(err => {
  console.error('[Sync] Error:', err);
  process.exit(1);
});
