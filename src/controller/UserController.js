class UserController {
  constructor(userService) {
    this.userService = userService;
  }

  async index(req, res) {
    const users = await this.userService.listUsers();
    return res.json({ success: true, data: users });
  }

  async perfis(req, res) {
    const perfis = await this.userService.listPerfis();
    return res.json({ success: true, data: perfis });
  }

  async store(req, res) {
    const user = await this.userService.createUser(req.body);
    return res.status(201).json({ success: true, data: user });
  }

  async update(req, res) {
    const { id } = req.params;
    const user = await this.userService.updateUser(id, req.body);
    return res.json({ success: true, data: user });
  }

  async destroy(req, res) {
    const { id } = req.params;
    await this.userService.deleteUser(id);
    return res.json({ success: true, message: 'Usuário removido com sucesso' });
  }
}

module.exports = UserController;
