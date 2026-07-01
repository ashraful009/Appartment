const BaseRepository = require('./BaseRepository');

class PropertyRepository extends BaseRepository {
  constructor() {
    super('properties');
  }

  async getPropertiesWithArea() {
    return this.db(this.tableName)
      .leftJoin('areas', 'properties.area_id', 'areas.id')
      .select(
        'properties.*',
        'areas.name as area_name',
        'areas.city as area_city',
        'areas.country as area_country'
      );
  }
}

module.exports = new PropertyRepository();
