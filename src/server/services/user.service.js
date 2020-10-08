class UserService {
  constructor({ usersRepository, mailer, logger }) {
    this.usersRepository = usersRepository;
    this.mailer = mailer;
    this.logger = logger;
  }

  async findAll() {
    return this.usersRepository.findAll();
  }

  async addUser(user) {
    try {
      await this.usersRepository.addUser(user);
      this.logger.info(`User created: ${user.userName}`);
      await this.mailer.sendConfirmationLink(user);
      this.logger.info(`Confirmation link sent: ${user.userName}`);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async getUser(user) {
    return this.usersRepository.getUser(user);
  }

  async deleteUser(user) {
    try {
      await this.usersRepository.deleteUser(user);
      this.logger.info(`User deleted: ${user.userName}`);
    }
  }
}
