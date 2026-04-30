const AppError = require('../utils/AppError');
const { hashPassword } = require('../utils/hashPassword');

class UserService {
  constructor(models) {
    this.User = models.User;
    this.Perfil = models.Perfil;
    this.Estabelecimento = models.Estabelecimento;
  }

  async listUsers() {
    return await this.User.findAll({
      include: [
        { model: this.Perfil, as: 'perfil' },
        { model: this.Estabelecimento, as: 'estabelecimento' }
      ]
    });
  }

  async listPerfis() {
    return await this.Perfil.findAll();
  }

  async createUser(data) {
    const { nome, email, senha, telefone, perfil_id, estabelecimento_id } = data;

    const existe = await this.User.unscoped().findOne({ where: { email } });
    if (existe) throw new AppError('E-mail já cadastrado', 409);

    const senhaHash = await hashPassword(senha);

    const user = await this.User.create({
      nome,
      email,
      senha: senhaHash,
      telefone,
      perfil_id,
      estabelecimento_id
    });

    return await this.User.findByPk(user.id, {
      include: [
        { model: this.Perfil, as: 'perfil' },
        { model: this.Estabelecimento, as: 'estabelecimento' }
      ]
    });
  }

  async updateUser(id, data) {
    const { nome, email, senha, telefone, perfil_id, estabelecimento_id } = data;

    const user = await this.User.unscoped().findByPk(id);
    if (!user) throw new AppError('Usuário não encontrado', 404);

    const updateData = { nome, email, telefone, perfil_id, estabelecimento_id };
    
    if (senha && senha.trim() !== '') {
      updateData.senha = await hashPassword(senha);
    }

    await user.update(updateData);

    return await this.User.findByPk(user.id, {
      include: [
        { model: this.Perfil, as: 'perfil' },
        { model: this.Estabelecimento, as: 'estabelecimento' }
      ]
    });
  }

  async deleteUser(id) {
    const user = await this.User.findByPk(id);
    if (!user) throw new AppError('Usuário não encontrado', 404);
    
    // Não permitir deletar o próprio usuário ou o admin master principal (opcional)
    
    await user.destroy();
    return true;
  }
}

module.exports = UserService;
