/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('investment_ledgers', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    
    // membership_id is required but the table isn't created yet, we can't add FK. 
    // We will add it as UUID and we can add constraint later or keep it as UUID.
    table.uuid('membership_id').notNullable(); 
    
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE').notNullable();
    table.uuid('property_id').references('id').inTable('properties').onDelete('SET NULL').nullable();
    
    table.enu('type', ['booking', 'downpayment', 'installment']).notNullable();
    table.integer('installment_number').nullable();
    
    table.decimal('amount', 15, 2).notNullable();
    table.timestamp('due_date').defaultTo(knex.fn.now());
    
    table.enu('status', ['Unpaid', 'Pending', 'AccountantConfirmed', 'DataEntryConfirmed', 'Paid']).defaultTo('Unpaid');
    
    table.enu('payment_method', ['MFS', 'Bank', 'Cash']).nullable();
    table.jsonb('payment_details').defaultTo('{}');
    
    table.string('invoice_url').defaultTo('');
    table.text('description').defaultTo('');
    table.string('batch_id').nullable();
    
    table.timestamp('submitted_at').nullable();
    table.jsonb('audit').defaultTo('{"accountant": {}, "dataEntry": {}, "management": {}}');
    
    table.timestamps(true, true);
    
    // Indexes
    table.index(['user_id', 'type']);
    table.index('membership_id');
    table.index('status');
    table.index('batch_id');
    table.index('property_id');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('investment_ledgers');
};
