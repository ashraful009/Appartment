require('dotenv').config();

module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.PG_HOST || 'localhost',
      port: process.env.PG_PORT ? parseInt(process.env.PG_PORT, 10) : 5432,
      database: process.env.PG_DATABASE || process.env.POSTGRES_DB || 'appartment_db',
      user: process.env.PG_USER || process.env.POSTGRES_USER || 'postgres',
      password: process.env.PG_PASSWORD || process.env.POSTGRES_PASSWORD || 'postgres',
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './src/db/migrations'
    }
  },

  production: {
    client: 'pg',
    connection: {
      host: process.env.PG_HOST,
      port: process.env.PG_PORT ? parseInt(process.env.PG_PORT, 10) : 5432,
      database: process.env.PG_DATABASE || process.env.POSTGRES_DB,
      user: process.env.PG_USER || process.env.POSTGRES_USER,
      password: process.env.PG_PASSWORD || process.env.POSTGRES_PASSWORD,
      ssl: { rejectUnauthorized: false }
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './src/db/migrations'
    }
  }
};
