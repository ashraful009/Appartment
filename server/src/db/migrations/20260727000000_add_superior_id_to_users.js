exports.up = function(knex) {
  return knex.schema.alterTable('users', (table) => {
    table.string('superior_id', 36).references('id').inTable('users').onDelete('SET NULL').nullable().index();
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('users', (table) => {
    table.dropColumn('superior_id');
  });
};
