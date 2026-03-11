const path             = require('path');
const BaseController   = require('./BaseController');
const asyncErrorWrapper = require('../utils/asyncErrorWrapper');
const { formatResponse } = require('../utils/formatResponse');
const { upload }       = require('../config/multer');
const AppError         = require('../utils/AppError');

class UploadController extends BaseController {
  /**
   * POST /api/upload
   * Form-data:  file (imagem)
   */
  uploadImagem = [
    /* Middleware multer inline */
    (req, res, next) => {
      upload.single('file')(req, res, (err) => {
        if (err) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return next(new AppError('Arquivo muito grande. Máximo 5 MB.', 413));
          }
          return next(err);
        }
        next();
      });
    },

    asyncErrorWrapper(async (req, res) => {
      if (!req.file) throw new AppError('Nenhum arquivo enviado.', 400);

      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const url     = `${baseUrl}/uploads/${req.file.filename}`;

      return formatResponse.success(res, { url }, 201);
    }),
  ];
}

module.exports = new UploadController();
