const BaseRepository = require('./BaseRepository');

class MembershipRepository extends BaseRepository {
  constructor() {
    super('memberships');
  }

  async findByUserId(user_id) {
    return this.findAll({ user_id });
  }

  async findByUserAndProperty(user_id, property_id) {
    return this.findOne({ user_id, property_id });
  }
}

module.exports = new MembershipRepository();
