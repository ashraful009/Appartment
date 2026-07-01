const BaseRepository = require('./BaseRepository');

class PriceRequestRepository extends BaseRepository {
  constructor() {
    super('price_requests');
  }

  async findByPropertyAndUser(property_id, user_id) {
    return this.findOne({ property_id, user_id });
  }

  async findAssignedTo(user_id) {
    return this.findAll({ assigned_to: user_id });
  }
}

module.exports = new PriceRequestRepository();
