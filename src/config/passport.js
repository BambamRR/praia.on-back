const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const jwtConfig = require('./jwt');

/**
 * Estratégia JWT do Passport.
 * Valida o Bearer token e carrega o usuário na requisição.
 */
const setup = (passport) => {
  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey:    jwtConfig.secret,
  };

  passport.use(
    new JwtStrategy(opts, async (jwtPayload, done) => {
      try {
        const { User } = require('../models');
        const user = await User.findByPk(jwtPayload.id, {
          include: ['perfil'],
          attributes: { exclude: ['senha'] },
        });

        if (!user) {
          return done(null, false, { message: 'Token inválido: usuário não encontrado' });
        }

        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    })
  );
};

module.exports = setup;
