const BaseRepository = require('./BaseRepository');

class DocumentRepository extends BaseRepository {
  constructor() {
    super('documents');
  }

  async findByUserId(user_id) {
    return this.db(this.tableName)
      .where({ user_id })
      .orderBy('uploaded_at', 'desc');
  }
}

module.exports = new DocumentRepository();
