
exports.up = function(knex) {
  return knex.schema.createTable('banners', (table) => {
    table.string('id', 36).primary();
    table.string('title').notNullable();
    table.string('image_url').notNullable();
    table.string('link').nullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });
};


exports.down = function(knex) {
  return knex.schema.dropTable('banners');
};
