const BaseRepository = require('./BaseRepository');
const { whereJsonArrayContains } = require('../utils/dbUtils');

class UserRepository extends BaseRepository {
  constructor() {
    super('users');
  }

  
  async findByEmail(email) {
    return this.findOne({ email });
  }

  
  
  
  async findByEmailWithPassword(email) {
    return this.db(this.tableName).where({ email }).select('*').first();
  }

  async findByRole(role) {
    return whereJsonArrayContains(this.db(this.tableName), 'roles', role);
  }
}

module.exports = new UserRepository();
