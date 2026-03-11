require('dotenv').config();

const express        = require('express');
const cors           = require('cors');
const helmet         = require('helmet');
const passport       = require('passport');
const swaggerUi      = require('swagger-ui-express');

const setupPassport  = require('../config/passport');
const swaggerSpec    = require('../config/swagger');
const routes         = require('../routes');
const errorHandler   = require('../middlewares/errorHandler');
const requestLogger  = require('../middlewares/requestLogger');
const { generalLimiter } = require('../middlewares/rateLimiter');

const app = express();

/* ── Segurança ─────────────────────────────────────────────────────── */
app.use(helmet());
app.use(cors({
  origin:      process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
app.use(generalLimiter);

/* ── Parsing ─────────────────────────────────────────────────────────── */
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

/* ── Logs ────────────────────────────────────────────────────────────── */
app.use(requestLogger);

/* ── Passport / Auth ─────────────────────────────────────────────────── */
setupPassport(passport);
app.use(passport.initialize());

/* ── Swagger Docs ─────────────────────────────────────────────────────── */
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'PraiOn API Docs',
}));

/* ── Arquivos estáticos (uploads de imagens) ─────────────────────────── */
const path = require('path');
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

/* ── Rotas ─────────────────────────────────────────────────────────── */
app.use('/api', routes);

/* ── 404 ─────────────────────────────────────────────────────────────── */
app.use((req, res) => res.status(404).json({
  success: false,
  message: `Rota não encontrada: ${req.method} ${req.originalUrl}`,
  code:    'NOT_FOUND',
}));

/* ── Error Handler Global ─────────────────────────────────────────────── */
app.use(errorHandler);

module.exports = app;
