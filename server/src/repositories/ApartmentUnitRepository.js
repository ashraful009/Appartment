const BaseRepository = require('./BaseRepository');

class ApartmentUnitRepository extends BaseRepository {
  constructor() {
    super('apartment_units');
  }

  async findByPropertyId(property_id) {
    return this.findAll({ property_id });
  }

  async getUnitsWithCustomerAndProperty(property_id = null) {
    let query = this.db(this.tableName)
      .leftJoin('users as customer', 'apartment_units.customer_id', 'customer.id')
      .leftJoin('properties', 'apartment_units.property_id', 'properties.id')
      .select(
        'apartment_units.*',
        'customer.name as customer_name',
        'customer.email as customer_email',
        'properties.name as property_name'
      );

    if (property_id) {
      query = query.where('apartment_units.property_id', property_id);
    }

    return query;
  }
}

module.exports = new ApartmentUnitRepository();
