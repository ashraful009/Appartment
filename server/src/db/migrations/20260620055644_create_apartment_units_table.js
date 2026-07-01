/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('apartment_units', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    
    // Core property reference
    table.uuid('property_id').references('id').inTable('properties').onDelete('CASCADE').notNullable();
    
    table.integer('floor').notNullable();
    table.string('column_line').notNullable();
    table.string('unit_name').notNullable();
    
    table.enu('status', ['Unsold', 'Sold', 'Booked']).defaultTo('Unsold');
    
    // Action tracking
    table.uuid('action_by').references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('action_timestamp').nullable();
    table.string('action_role_context').nullable(); // e.g., 'admin', 'seller'
    
    // Customer Details
    table.string('customer_name').nullable();
    table.string('customer_phone').nullable();
    table.uuid('customer_id').references('id').inTable('users').onDelete('SET NULL');
    
    table.boolean('is_document_ready').defaultTo(false);
    
    // Storing specs and financials as JSONB to preserve flexibility 
    // and easily map from existing NoSQL structure.
    table.jsonb('specs').defaultTo('{}');
    table.jsonb('financials').defaultTo('{}');
    
    // EMI Tracking
    table.decimal('emi_amount', 15, 2).nullable();
    table.integer('remaining_emis').defaultTo(184);
    
    // Investor Allocation
    table.uuid('allocated_to').references('id').inTable('users').onDelete('SET NULL');
    table.uuid('allocated_by').references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('allocated_at').nullable();
    
    table.integer('handover_month').nullable();
    table.integer('handover_year').nullable();
    
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('apartment_units');
};
