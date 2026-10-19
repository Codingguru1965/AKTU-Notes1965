import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, '../../uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const originalExt = path.extname(file.originalname).toLowerCase() || '.pdf';
    const parsedName = path.parse(file.originalname).name;
    const cleanName = parsedName.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 60);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e6);
    cb(null, `${cleanName}-${uniqueSuffix}${originalExt}`);
  }
});

const fileFilter = (req, file, cb) => {
  const isPdfExt = file.originalname.toLowerCase().endsWith('.pdf');
  const isPdfMime = file.mimetype === 'application/pdf';

  if (isPdfExt || isPdfMime) {
    cb(null, true);
  } else {
    cb(new Error('Only valid PDF documents (.pdf) are permitted'), false);
  }
};

export const uploadPdfMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 30 * 1024 * 1024 // 30 MB max
  }
});
