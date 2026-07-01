const BaseRepository = require('./BaseRepository');

class BannerRepository extends BaseRepository {
  constructor() {
    super('banners');
  }

  async findActive() {
    return this.findAll({ is_active: true });
  }
}

module.exports = new BannerRepository();
