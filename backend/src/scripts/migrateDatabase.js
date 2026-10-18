import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKUP_DIR = path.resolve(__dirname, '../../backup');
const BACKUP_FILE = path.join(BACKUP_DIR, 'aktu_notes1965_backup.json');

const COLLECTIONS = ['admins', 'resources', 'reports'];

const exportLocal = async () => {
  const localUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aktu_notes1965';
  console.log(`[Export] Connecting to local MongoDB: ${localUri}...`);

  const conn = await mongoose.connect(localUri);
  const db = conn.connection.db;

  const backupData = {
    exportedAt: new Date().toISOString(),
    collections: {}
  };

  for (const colName of COLLECTIONS) {
    const docs = await db.collection(colName).find({}).toArray();
    backupData.collections[colName] = docs;
    console.log(`[Export] Exported ${docs.length} documents from '${colName}'`);
  }

  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  fs.writeFileSync(BACKUP_FILE, JSON.stringify(backupData, null, 2), 'utf8');
  console.log(`[Export] Backup saved successfully to: ${BACKUP_FILE}`);

  await mongoose.disconnect();
};

const importToAtlas = async (targetUri) => {
  if (!targetUri) {
    console.error('FATAL: Target MongoDB Atlas URI is required.');
    console.error('Usage: node src/scripts/migrateDatabase.js import "<atlas_connection_string>"');
    process.exit(1);
  }

  if (!fs.existsSync(BACKUP_FILE)) {
    console.error(`FATAL: Backup file not found at ${BACKUP_FILE}`);
    console.error('Please run export first: npm run export-db');
    process.exit(1);
  }

  console.log(`[Import] Connecting to target MongoDB: ${targetUri.replace(/:([^:@]+)@/, ':****@')}...`);
  const conn = await mongoose.connect(targetUri);
  const db = conn.connection.db;

  const rawData = fs.readFileSync(BACKUP_FILE, 'utf8');
  const backupData = JSON.parse(rawData);

  console.log(`[Import] Backup exported at: ${backupData.exportedAt}`);

  for (const colName of COLLECTIONS) {
    const docs = backupData.collections[colName] || [];
    if (docs.length === 0) {
      console.log(`[Import] No documents to import for '${colName}'`);
      continue;
    }

    let importedCount = 0;
    for (const doc of docs) {
      // Upsert using original _id to prevent duplicates
      await db.collection(colName).updateOne(
        { _id: new mongoose.Types.ObjectId(doc._id) },
        { $set: { ...doc, _id: new mongoose.Types.ObjectId(doc._id) } },
        { upsert: true }
      );
      importedCount++;
    }
    console.log(`[Import] Successfully imported/upserted ${importedCount} documents into '${colName}'`);
  }

  console.log('========================================================');
  console.log('[Migration] Database migration to Atlas completed 100%!');
  console.log('========================================================');

  await mongoose.disconnect();
};

const main = async () => {
  const action = process.argv[2] || 'export';
  const targetUri = process.argv[3];

  try {
    if (action === 'export') {
      await exportLocal();
    } else if (action === 'import') {
      await importToAtlas(targetUri);
    } else {
      console.log('Usage:');
      console.log('  Export: node src/scripts/migrateDatabase.js export');
      console.log('  Import: node src/scripts/migrateDatabase.js import "<atlas_uri>"');
    }
  } catch (err) {
    console.error('[Migration Error]:', err.message);
    process.exit(1);
  }
};

main();
