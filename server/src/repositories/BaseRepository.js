const db = require('../config/db');
const {
  stringifyJsonFields,
  withGeneratedIds,
} = require('../utils/dbUtils');

class BaseRepository {
  constructor(tableName) {
    this.tableName = tableName;
    this.db = db;
  }

  async findAll(query = {}, select = '*') {
    return this.db(this.tableName).where(query).select(select);
  }

  async findById(id, select = '*') {
    return this.db(this.tableName).where({ id }).select(select).first();
  }

  async findOne(query, select = '*') {
    return this.db(this.tableName).where(query).select(select).first();
  }

  async create(data, returning = '*') {
    const row = withGeneratedIds(stringifyJsonFields(data));
    await this.db(this.tableName).insert(row);
    return this.findById(row.id, returning);
  }

  async update(id, data, returning = '*') {
    const affected = await this.db(this.tableName).where({ id }).update(stringifyJsonFields(data));
    if (!affected) return null;
    return this.findById(id, returning);
  }

  async delete(id) {
    return this.db(this.tableName).where({ id }).del();
  }

  async count(query = {}) {
    const result = await this.db(this.tableName).where(query).count('id as count').first();
    return parseInt(result.count, 10);
  }
}

module.exports = BaseRepository;
