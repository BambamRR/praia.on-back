const { Router } = require('express');
const ctrl        = require('../controller/UploadController');
const auth        = require('../middlewares/authMiddleware');

const router = Router();

/**
 * @openapi
 * /upload:
 *   post:
 *     tags: [Upload]
 *     summary: Faz upload de imagem para o servidor (admin)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: URL pública da imagem enviada
 */
router.post('/', auth, ctrl.uploadImagem);

module.exports = router;
