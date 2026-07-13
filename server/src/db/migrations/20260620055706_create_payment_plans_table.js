/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('payment_plans', (table) => {
    table.string('id', 36).primary();
    
    table.string('customer_id', 36).references('id').inTable('users').onDelete('CASCADE').notNullable();
    table.string('property_id', 36).references('id').inTable('properties').onDelete('CASCADE').notNullable();
    
    // We'll create price_requests in the next migration, but for now we'll just store the id.
    table.string('request_id', 36).nullable();
    
    table.decimal('total_price', 15, 2).notNullable();
    table.decimal('booking_money', 15, 2).defaultTo(0);
    table.integer('total_installments').notNullable();
    
    // Storing installments as JSON to match NoSQL subdocument structure
    table.json('installments');
    
    table.timestamps(true, true);
    
    // Indexes
    table.index(['customer_id', 'created_at']);
    table.index('property_id');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('payment_plans');
};
