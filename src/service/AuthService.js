const AppError     = require('../utils/AppError');
const { hashPassword, comparePassword } = require('../utils/hashPassword');
const generateToken = require('../utils/generateToken');

class AuthService {
  constructor(models) {
    this.User   = models.User;
    this.Perfil = models.Perfil;
  }

  /**
   * Registra um novo usuário com perfil padrão "fornecedor".
   */
  async register(data) {
    const { nome, email, senha, telefone, cpf, rg, endereco } = data;

    const existe = await this.User.unscoped().findOne({ where: { email } });
    if (existe) throw new AppError('E-mail já cadastrado', 409);

    /* Perfil padrão = fornecedor (id=2) se não especificado */
    const perfil = await this.Perfil.findOne({ where: { nome: 'fornecedor' } });
    if (!perfil) throw new AppError('Perfil padrão não encontrado', 500);

    const senhaHash = await hashPassword(senha);

    const user = await this.User.create({
      nome, email, senha: senhaHash, telefone, cpf, rg, endereco,
      perfil_id: perfil.id,
    });

    const token = generateToken({ id: user.id, email: user.email, perfil_id: user.perfil_id });

    const userSemSenha = await this.User.findByPk(user.id, { include: [{ model: this.Perfil, as: 'perfil' }] });

    return { token, user: userSemSenha };
  }

  /**
   * Autentica um usuário e retorna JWT.
   */
  async login(email, senha) {
    const user = await this.User.unscoped().findOne({
      where: { email },
      include: [{ model: this.Perfil, as: 'perfil' }],
    });

    if (!user) throw new AppError('Credenciais inválidas', 401);

    const senhaOk = await comparePassword(senha, user.senha);
    if (!senhaOk) throw new AppError('Credenciais inválidas', 401);

    const token = generateToken({ id: user.id, email: user.email, perfil_id: user.perfil_id });

    const { senha: _, ...userSemSenha } = user.toJSON();
    return { token, user: userSemSenha };
  }

  /**
   * Retorna dados do usuário autenticado.
   */
  async me(userId) {
    const user = await this.User.findByPk(userId, {
      include: [{ model: this.Perfil, as: 'perfil' }],
    });
    if (!user) throw new AppError('Usuário não encontrado', 404);
    return user;
  }
}

module.exports = AuthService;
