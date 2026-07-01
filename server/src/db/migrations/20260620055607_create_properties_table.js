/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('properties', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable();
    table.text('address').notNullable();
    
    table.string('main_image').nullable();
    table.string('main_image_public_id').nullable();
    
    table.jsonb('extra_images').defaultTo('[]');
    table.jsonb('extra_image_public_ids').defaultTo('[]');
    
    table.integer('total_units').defaultTo(0);
    table.integer('floors').defaultTo(0);
    table.string('land_size').defaultTo('');
    table.string('handover_time').defaultTo('');
    table.string('parking_area').defaultTo('');
    
    table.text('description').notNullable();
    table.jsonb('map_location').defaultTo('{"lat": null, "lng": null}');
    
    table.integer('display_order').defaultTo(999);
    table.jsonb('apartment_sizes').defaultTo('[]');
    
    // Foreign key to areas table
    table.uuid('area_id').references('id').inTable('areas').onDelete('SET NULL');
    
    table.enu('status', ['Ongoing', 'Completed', 'Upcoming']).defaultTo('Ongoing');
    table.decimal('total_price', 15, 2).defaultTo(0);
    table.decimal('total_sqft', 10, 2).defaultTo(0);
    
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('properties');
};
