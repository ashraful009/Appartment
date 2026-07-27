
exports.up = function(knex) {
  return knex.schema.createTable('targets', (table) => {
    table.string('id', 36).primary();
    table.string('user_id', 36).references('id').inTable('users').onDelete('CASCADE');
    table.decimal('amount', 15, 2).defaultTo(0);
    table.date('target_date').notNullable();
    table.timestamps(true, true);
  });
};


exports.down = function(knex) {
  return knex.schema.dropTable('targets');
};
