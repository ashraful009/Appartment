
exports.up = function(knex) {
  return knex.schema.createTable('properties', (table) => {
    table.string('id', 36).primary();
    table.string('name').notNullable();
    table.text('address').notNullable();
    
    table.string('main_image').nullable();
    table.string('main_image_public_id').nullable();
    
    table.json('extra_images');
    table.json('extra_image_public_ids');
    
    table.integer('total_units').defaultTo(0);
    table.integer('floors').defaultTo(0);
    table.string('land_size').defaultTo('');
    table.string('handover_time').defaultTo('');
    table.string('parking_area').defaultTo('');
    
    table.text('description').notNullable();
    table.json('map_location');
    
    table.integer('display_order').defaultTo(999);
    table.json('apartment_sizes');
    
    
    table.string('area_id', 36).references('id').inTable('areas').onDelete('SET NULL');
    
    table.enu('status', ['Ongoing', 'Completed', 'Upcoming']).defaultTo('Ongoing');
    table.decimal('total_price', 15, 2).defaultTo(0);
    table.decimal('total_sqft', 10, 2).defaultTo(0);
    
    table.timestamps(true, true);
  });
};


exports.down = function(knex) {
  return knex.schema.dropTable('properties');
};
