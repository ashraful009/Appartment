
exports.up = function(knex) {
  return knex.schema.createTable('notifications', (table) => {
    table.string('id', 36).primary();
    table.string('recipient_id', 36).references('id').inTable('users').onDelete('CASCADE').notNullable();
    table.string('sender_id', 36).references('id').inTable('users').onDelete('SET NULL').nullable();
    table.text('message').notNullable();
    table.string('type').defaultTo('General');
    table.boolean('read').defaultTo(false);
    table.timestamps(true, true);

    table.index(['recipient_id', 'read', 'created_at']);
  });
};


exports.down = function(knex) {
  return knex.schema.dropTable('notifications');
};
