const BaseRepository = require('./BaseRepository');

class InvestmentLedgerRepository extends BaseRepository {
  constructor() {
    super('investment_ledgers');
  }

  async findByUserId(user_id) {
    return this.findAll({ user_id });
  }

  async findByMembershipId(membership_id) {
    return this.findAll({ membership_id });
  }

  async findByStatus(status) {
    return this.findAll({ status });
  }
}

module.exports = new InvestmentLedgerRepository();
