
exports.up = function(knex) {
  return knex.schema.createTable('user_wishlists', (table) => {
    table.string('user_id', 36).references('id').inTable('users').onDelete('CASCADE');
    table.string('property_id', 36).references('id').inTable('properties').onDelete('CASCADE');
    
    table.primary(['user_id', 'property_id']);
    table.timestamps(true, true);
  });
};


exports.down = function(knex) {
  return knex.schema.dropTable('user_wishlists');
};
