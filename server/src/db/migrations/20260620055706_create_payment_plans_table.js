/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('payment_plans', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    
    table.uuid('customer_id').references('id').inTable('users').onDelete('CASCADE').notNullable();
    table.uuid('property_id').references('id').inTable('properties').onDelete('CASCADE').notNullable();
    
    // We'll create price_requests in the next migration, but for now we'll just store the UUID
    table.uuid('request_id').nullable();
    
    table.decimal('total_price', 15, 2).notNullable();
    table.decimal('booking_money', 15, 2).defaultTo(0);
    table.integer('total_installments').notNullable();
    
    // Storing installments as JSONB to match NoSQL subdocument structure
    table.jsonb('installments').defaultTo('[]');
    
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
