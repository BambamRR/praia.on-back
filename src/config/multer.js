const path   = require('path');
const multer = require('multer');
const AppError = require('../utils/AppError');

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const MAX_SIZE_MB  = 5;

/* Armazena em disco local — troque por S3/R2 em produção */
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename:    (_req, file, cb) => {
    const ext     = path.extname(file.originalname).toLowerCase();
    const unique  = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Tipo de arquivo não suportado. Use JPEG, PNG, WebP ou GIF.', 415), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
});

module.exports = { upload, UPLOADS_DIR };
