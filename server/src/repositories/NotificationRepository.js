const BaseRepository = require('./BaseRepository');

class NotificationRepository extends BaseRepository {
  constructor() {
    super('notifications');
  }

  async findByUserId(user_id) {
    return this.db(this.tableName)
      .where({ user_id })
      .orderBy('created_at', 'desc');
  }

  async markAsRead(id) {
    return this.update(id, { is_read: true });
  }
}

module.exports = new NotificationRepository();
