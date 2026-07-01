const BaseRepository = require('./BaseRepository');

class InvestmentSettingRepository extends BaseRepository {
  constructor() {
    super('investment_settings');
  }

  async findByKey(key) {
    return this.findOne({ key });
  }
}

module.exports = new InvestmentSettingRepository();
