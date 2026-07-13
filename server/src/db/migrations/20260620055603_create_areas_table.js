/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('areas', (table) => {
    table.string('id', 36).primary();
    table.string('country').notNullable();
    table.string('city').notNullable();
    table.string('name').notNullable();
    
    // Unique index
    table.unique(['country', 'city', 'name']);
    
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('areas');
};
