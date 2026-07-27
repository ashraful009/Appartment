
exports.up = function(knex) {
  return knex.schema.createTable('investment_settings', (table) => {
    table.string('id', 36).primary();
    table.string('key').unique().notNullable();
    table.json('value').notNullable();
    table.timestamps(true, true);
  });
};


exports.down = function(knex) {
  return knex.schema.dropTable('investment_settings');
};
