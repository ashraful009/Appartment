
exports.up = function(knex) {
  return knex.schema.createTable('memberships', (table) => {
    table.string('id', 36).primary();
    
    table.string('user_id', 36).references('id').inTable('users').onDelete('CASCADE').notNullable();
    table.string('property_id', 36).references('id').inTable('properties').onDelete('SET NULL').nullable();
    table.string('unit_id', 36).references('id').inTable('apartment_units').onDelete('SET NULL').nullable();
    
    table.enu('status', ['pending_booking', 'member', 'investor', 'lapsed']).defaultTo('pending_booking');
    
    table.decimal('booking_money', 15, 2).defaultTo(500000);
    table.timestamp('became_member_at').nullable();
    table.timestamp('member_deadline').nullable();
    
    table.decimal('down_payment_target', 15, 2).defaultTo(2000000);
    table.decimal('down_payment_amount', 15, 2).defaultTo(0);
    table.timestamp('down_payment_completed_at').nullable();
    
    table.decimal('total_target', 15, 2).defaultTo(5000000);
    table.decimal('installment_amount', 15, 2).defaultTo(16304);
    
    table.boolean('installments_generated').defaultTo(false);
    table.decimal('total_approved_paid', 15, 2).defaultTo(0);
    table.integer('shares').defaultTo(0);
    
    table.timestamps(true, true);
    
    table.unique(['user_id', 'property_id']);
  });
};


exports.down = function(knex) {
  return knex.schema.dropTable('memberships');
};
