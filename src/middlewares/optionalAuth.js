const passport = require('passport');

/** Popula req.user quando há um JWT válido, sem bloquear o acesso público. */
module.exports = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) return next(err);
    req.user = user || null;
    return next();
  })(req, res, next);
};
