/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('apartment_units', (table) => {
    table.string('id', 36).primary();
    
    // Core property reference
    table.string('property_id', 36).references('id').inTable('properties').onDelete('CASCADE').notNullable();
    
    table.integer('floor').notNullable();
    table.string('column_line').notNullable();
    table.string('unit_name').notNullable();
    
    table.enu('status', ['Unsold', 'Sold', 'Booked']).defaultTo('Unsold');
    
    // Action tracking
    table.string('action_by', 36).references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('action_timestamp').nullable();
    table.string('action_role_context').nullable(); // e.g., 'admin', 'seller'
    
    // Customer Details
    table.string('customer_name').nullable();
    table.string('customer_phone').nullable();
    table.string('customer_id', 36).references('id').inTable('users').onDelete('SET NULL');
    
    table.boolean('is_document_ready').defaultTo(false);
    
    // Storing specs and financials as JSON to preserve flexibility
    // and easily map from existing NoSQL structure.
    table.json('specs');
    table.json('financials');
    
    // EMI Tracking
    table.decimal('emi_amount', 15, 2).nullable();
    table.integer('remaining_emis').defaultTo(184);
    
    // Investor Allocation
    table.string('allocated_to', 36).references('id').inTable('users').onDelete('SET NULL');
    table.string('allocated_by', 36).references('id').inTable('users').onDelete('SET NULL');
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
