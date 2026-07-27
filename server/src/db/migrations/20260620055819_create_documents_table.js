
exports.up = function(knex) {
  return knex.schema.createTable('documents', (table) => {
    table.string('id', 36).primary();
    
    table.string('user_id', 36).references('id').inTable('users').onDelete('CASCADE').notNullable();
    
    table.enu('title', ['NID', 'Passport', 'TIN Certificate', 'Booking Receipt', 'Other']).notNullable();
    
    table.string('file_url').notNullable();
    table.string('public_id').notNullable();
    
    table.enu('status', ['Pending Verification', 'Verified', 'Rejected']).defaultTo('Pending Verification');
    table.timestamp('uploaded_at').defaultTo(knex.fn.now());
    
    table.timestamps(true, true);
    
    table.index(['user_id', 'uploaded_at']);
  });
};


exports.down = function(knex) {
  return knex.schema.dropTable('documents');
};
