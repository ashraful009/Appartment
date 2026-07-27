
exports.up = function(knex) {
  return knex.schema.createTable('price_requests', (table) => {
    table.string('id', 36).primary();
    
    table.string('property_id', 36).references('id').inTable('properties').onDelete('CASCADE').notNullable();
    table.string('user_id', 36).references('id').inTable('users').onDelete('CASCADE').notNullable();
    
    table.enu('status', ['pending', 'assigned']).defaultTo('pending');
    
    table.string('assigned_to', 36).references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('assigned_at').nullable();
    
    table.enu('conversion_status', ['none', 'pending_approval', 'approved', 'rejected']).defaultTo('none');
    table.enu('seller_conversion_status', ['none', 'pending_approval', 'approved', 'rejected']).defaultTo('none');
    
    table.enu('pipeline_stage', ['New', 'Contacted', 'Site Visited', 'Negotiation', 'Closed Won', 'Closed Lost']).defaultTo('New');
    table.enu('priority', ['Hot', 'Warm', 'Cold']).defaultTo('Warm');
    
    table.json('client_preferences');
    table.timestamp('last_interaction_date').defaultTo(knex.fn.now());
    
    table.enu('lead_source', ['Website', 'Facebook', 'Agent Referral', 'Organic Search', 'Other']).defaultTo('Website');
    
    table.timestamps(true, true);
    
    
    table.unique(['property_id', 'user_id']);
  }).then(() => {
    
    return knex.schema.alterTable('payment_plans', (table) => {
        table.foreign('request_id').references('id').inTable('price_requests').onDelete('SET NULL');
    });
  });
};


exports.down = function(knex) {
  return knex.schema.alterTable('payment_plans', (table) => {
      table.dropForeign('request_id');
  }).then(() => {
      return knex.schema.dropTable('price_requests');
  });
};
