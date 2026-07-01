const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.PG_DATABASE || process.env.POSTGRES_DB || "appartment_db",
  process.env.PG_USER || process.env.POSTGRES_USER || "postgres",
  process.env.PG_PASSWORD || process.env.POSTGRES_PASSWORD || "postgres",
  {
    host: process.env.PG_HOST || "localhost",
    port: process.env.PG_PORT ? parseInt(process.env.PG_PORT, 10) : 5432,
    dialect: "postgres",
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

module.exports = sequelize;
