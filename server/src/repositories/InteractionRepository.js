const BaseRepository = require('./BaseRepository');

class InteractionRepository extends BaseRepository {
  constructor() {
    super('interactions');
  }

  async findByLeadId(lead_id) {
    return this.db(this.tableName)
      .where({ lead_id })
      .orderBy('date', 'desc');
  }

  async findBySellerId(seller_id) {
    return this.findAll({ seller_id });
  }
}

module.exports = new InteractionRepository();
