
exports.up = function(knex) {
  return knex.schema.createTable('apartment_units', (table) => {
    table.string('id', 36).primary();
    
    
    table.string('property_id', 36).references('id').inTable('properties').onDelete('CASCADE').notNullable();
    
    table.integer('floor').notNullable();
    table.string('column_line').notNullable();
    table.string('unit_name').notNullable();
    
    table.enu('status', ['Unsold', 'Sold', 'Booked']).defaultTo('Unsold');
    
    
    table.string('action_by', 36).references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('action_timestamp').nullable();
    table.string('action_role_context').nullable(); 
    
    
    table.string('customer_name').nullable();
    table.string('customer_phone').nullable();
    table.string('customer_id', 36).references('id').inTable('users').onDelete('SET NULL');
    
    table.boolean('is_document_ready').defaultTo(false);
    
    
    
    table.json('specs');
    table.json('financials');
    
    
    table.decimal('emi_amount', 15, 2).nullable();
    table.integer('remaining_emis').defaultTo(184);
    
    
    table.string('allocated_to', 36).references('id').inTable('users').onDelete('SET NULL');
    table.string('allocated_by', 36).references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('allocated_at').nullable();
    
    table.integer('handover_month').nullable();
    table.integer('handover_year').nullable();
    
    table.timestamps(true, true);
  });
};


exports.down = function(knex) {
  return knex.schema.dropTable('apartment_units');
};
