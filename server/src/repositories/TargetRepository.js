const BaseRepository = require('./BaseRepository');

class TargetRepository extends BaseRepository {
  constructor() {
    super('targets');
  }

  async findByUserId(user_id) {
    return this.findAll({ user_id });
  }
}

module.exports = new TargetRepository();
