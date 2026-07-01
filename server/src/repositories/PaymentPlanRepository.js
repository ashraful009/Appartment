const BaseRepository = require('./BaseRepository');

class PaymentPlanRepository extends BaseRepository {
  constructor() {
    super('payment_plans');
  }

  async findByCustomerId(customer_id) {
    return this.findAll({ customer_id });
  }

  async findByPropertyId(property_id) {
    return this.findAll({ property_id });
  }
}

module.exports = new PaymentPlanRepository();
