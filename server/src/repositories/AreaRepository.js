const BaseRepository = require('./BaseRepository');

class AreaRepository extends BaseRepository {
  constructor() {
    super('areas');
  }

  // Example method specific to areas
  async findByCity(city) {
    return this.findAll({ city });
  }
}

module.exports = new AreaRepository();
