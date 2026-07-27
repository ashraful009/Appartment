
exports.up = function(knex) {
  return knex.schema.createTable('interactions', (table) => {
    table.string('id', 36).primary();
    
    table.string('lead_id', 36).references('id').inTable('price_requests').onDelete('CASCADE').notNullable();
    table.string('seller_id', 36).references('id').inTable('users').onDelete('CASCADE').notNullable();
    
    table.enu('interaction_type', ['Call', 'WhatsApp', 'Meeting', 'Document Sent', 'Note']).notNullable();
    table.text('notes').notNullable();
    table.timestamp('date').defaultTo(knex.fn.now());
    
    table.timestamp('next_meeting_date').nullable();
    table.string('next_meeting_agenda').defaultTo('');
    table.boolean('is_joint_meeting').defaultTo(false);
    
    table.enu('follow_up_status', ['Pending', 'Completed', 'Unable to Contact']).defaultTo('Pending');
    
    table.text('admin_note').defaultTo('');
    table.text('mentor_note').defaultTo('');
    table.boolean('is_mentor_requested').defaultTo(false);
    
    table.timestamps(true, true);
    
    table.index(['lead_id', 'date']);
    table.index(['seller_id', 'next_meeting_date']);
  });
};


exports.down = function(knex) {
  return knex.schema.dropTable('interactions');
};
