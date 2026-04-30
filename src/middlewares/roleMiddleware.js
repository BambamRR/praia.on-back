/**
 * Middleware para verificar se o usuário possui o perfil necessário.
 * Deve ser usado APÓS o authMiddleware.
 * 
 * @param {string} perfilNome Nome do perfil exigido (ex: 'administrador')
 */
const roleMiddleware = (requiredRoles) => {
  return (req, res, next) => {
    const user = req.user;
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

    if (!user || !user.perfil) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado: Perfil não identificado.',
        code: 'FORBIDDEN'
      });
    }

    if (!roles.includes(user.perfil.nome)) {
      return res.status(403).json({
        success: false,
        message: `Acesso negado: Requer um dos perfis: ${roles.join(', ')}.`,
        code: 'FORBIDDEN'
      });
    }

    next();
  };
};

module.exports = roleMiddleware;
