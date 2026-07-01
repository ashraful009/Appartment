const BaseRepository = require('./BaseRepository');

class ProjectRepository extends BaseRepository {
  constructor() {
    super('projects');
  }

  async findByStatus(status) {
    return this.findAll({ status });
  }
}

module.exports = new ProjectRepository();
