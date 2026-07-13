/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('projects', (table) => {
    table.string('id', 36).primary();
    table.string('name').notNullable();
    table.text('description').defaultTo('');
    table.enu('status', ['running', 'completed']).defaultTo('running');
    table.date('expected_complete_date').nullable();
    table.string('cover_image').defaultTo('');
    
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('projects');
};
