
exports.up = function(knex) {
  return knex.schema.createTable('areas', (table) => {
    table.string('id', 36).primary();
    table.string('country').notNullable();
    table.string('city').notNullable();
    table.string('name').notNullable();
    
    
    table.unique(['country', 'city', 'name']);
    
    table.timestamps(true, true);
  });
};


exports.down = function(knex) {
  return knex.schema.dropTable('areas');
};
