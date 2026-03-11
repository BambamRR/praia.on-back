const passport = require('passport');

/**
 * Middleware de autenticação via JWT.
 * Valida Bearer token e insere req.user.
 */
const authMiddleware = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err)   return next(err);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: info?.message || 'Token inválido ou não informado',
        code:    'UNAUTHORIZED',
      });
    }
    req.user = user;
    return next();
  })(req, res, next);
};

module.exports = authMiddleware;
