const BaseRepository = require('./BaseRepository');

class UserRepository extends BaseRepository {
  constructor() {
    super('users');
  }

  // Example of a specialized query method
  async findByEmail(email) {
    return this.findOne({ email });
  }

  // Since we are migrating from Mongoose which used matchPassword, 
  // the authentication logic should ideally be handled in a service or controller using bcrypt,
  // but we can add a helper query to get user with password explicitly (if it's excluded by default)
  async findByEmailWithPassword(email) {
    return this.db(this.tableName).where({ email }).select('*').first();
  }

  async findByRole(role) {
    // Handling array of roles stored as PostgreSQL text[]
    return this.db(this.tableName).whereRaw('? = ANY(roles)', [role]);
  }
}

module.exports = new UserRepository();
