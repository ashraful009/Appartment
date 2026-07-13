require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { normalizeDbResponse } = require('./src/utils/dbUtils');

const mysqlConnection = {
  host: process.env.MYSQL_HOST || process.env.DB_HOST || 'localhost',
  port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT, 10) : 3306,
  database: process.env.MYSQL_DATABASE || process.env.DB_DATABASE || 'appartment_db',
  user: process.env.MYSQL_USER || process.env.DB_USER || 'root',
  password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || '',
};

const baseConfig = {
  client: 'mysql2',
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: './src/db/migrations'
  },
  postProcessResponse: normalizeDbResponse
};

module.exports = {
  development: {
    ...baseConfig,
    connection: mysqlConnection
  },

  production: {
    ...baseConfig,
    connection: {
      ...mysqlConnection,
      ssl: process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: false } : undefined
    }
  }
};
