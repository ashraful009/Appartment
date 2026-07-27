
exports.up = function(knex) {
  return knex.schema.createTable('investment_ledgers', (table) => {
    table.string('id', 36).primary();
    
    
    
    table.string('membership_id', 36).notNullable(); 
    
    table.string('user_id', 36).references('id').inTable('users').onDelete('CASCADE').notNullable();
    table.string('property_id', 36).references('id').inTable('properties').onDelete('SET NULL').nullable();
    
    table.enu('type', ['booking', 'downpayment', 'installment']).notNullable();
    table.integer('installment_number').nullable();
    
    table.decimal('amount', 15, 2).notNullable();
    table.timestamp('due_date').defaultTo(knex.fn.now());
    
    table.enu('status', ['Unpaid', 'Pending', 'AccountantConfirmed', 'DataEntryConfirmed', 'Paid']).defaultTo('Unpaid');
    
    table.enu('payment_method', ['MFS', 'Bank', 'Cash']).nullable();
    table.json('payment_details');
    
    table.string('invoice_url').defaultTo('');
    table.text('description').defaultTo('');
    table.string('batch_id').nullable();
    
    table.timestamp('submitted_at').nullable();
    table.json('audit');
    
    table.timestamps(true, true);
    
    
    table.index(['user_id', 'type']);
    table.index('membership_id');
    table.index('status');
    table.index('batch_id');
    table.index('property_id');
  });
};


exports.down = function(knex) {
  return knex.schema.dropTable('investment_ledgers');
};
